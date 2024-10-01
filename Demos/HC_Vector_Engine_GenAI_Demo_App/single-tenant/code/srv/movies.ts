import cds, { ApplicationService } from "@sap/cds";
import { Request } from "@sap/cds/apis/services";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    PromptTemplate,
    SystemMessagePromptTemplate
} from "langchain/prompts";
import { LLMChain, LLMChainInput, StuffDocumentsChain, StuffDocumentsChainInput } from "langchain/chains";

import * as aiCore from "./utils/ai-core";
import BTPEmbedding from "./utils/langchain/BTPEmbedding";
import BTPAzureOpenAIChatLLM from "./utils/langchain/BTPAzureOpenAIChatLLM";

import { IMovie, IScenarioConfig } from "./types";
import { BaseChatModel } from "langchain/dist/chat_models/base";
import { BaseLanguageModel, BaseLanguageModelCallOptions } from "langchain/dist/base_language";
import {Md5} from 'ts-md5';


const MAX_PARALELL_ADA_CALLS = 32;
const MAX_PARALELL_LLM_CALLS = 8;
const MAX_RETRY_DELAY_SECONDS = 90;

const SCENARIO = 'MOVIES';

enum TaskType { LLM = 'LLM', SEMANTICSEARCH = 'SEMANTIC-SEARCH' }

/**
 * Class representing CommonMovies
 * @extends ApplicationService
 */
export default class CommonMovies extends ApplicationService {
    /**
     * Initiate CommonMovies instance
     * @returns {Promise<void>}
     */
    async init(): Promise<void> {
        await super.init();

        // Create a default AI core resource group if non existent
        await aiCore.checkDefaultResourceGroup();

        // Actions
        this.on("semanticSearch", this.onSemanticSearch);
        
        this.on("generateFullRagResponse", this.onFullRagGenerateResponse);
        this.on("generateFullRagResponseStep1", this.onFullRagGenerateResponseStep1);
        this.on("generateFullRagResponseStep2", this.onFullRagGenerateResponseStep2);
        this.on("generateFullRagResponseStep3", this.onFullRagGenerateResponseStep3);

        this.on("getMoviesById", this.onGetMoviesById);
    };

    private getScenario = (req: Request): string => {
        return req.data.scenario;
    };

    private getScenarioConfig = async (scenario: string): Promise<IScenarioConfig> => {
        console.dir(this.entities);
        const { ScenarioConfig } = this.entities;
        const result = await SELECT.from(ScenarioConfig).where({'scenario': scenario});
        if (result.length != 1) {
            let error = new Error(`Cannot find unique scenario names '${scenario}'`);
            // if the result in not unique, treat it as bad requesr
            (error as any).code = 400;
            throw error;
        }
        return result[0];
    }

    /**
    * Handler to make the full (optional) RAG roundtrip.
    * I.e. the request contains a text, a semantic search on database is executed.
    * This search is attached to a prompt and send to an LLM.
    * 
    * @param {Request} req
    * @returns {Promise<any>}
    */
    public onFullRagGenerateResponse = async (req: Request): Promise<any> => {
        const startTime = process.hrtime();
        const { rag, scenario } = req.data;
        let movieIds: string[];
        let context: Array<IMovie>;
        if (rag) {
            const contextCount = 5;
            const vector = await this.getEmbeddingFromRequest(req);
            const resultFromDB = await this.getMovieIdsFromDatabaseBySimilarity(vector, contextCount, scenario);
            movieIds = resultFromDB.map((entry) => entry.ID);
            context = await this.getMovieMetadataFromDatabase(movieIds, scenario);
        } else {
            context = await Promise.resolve([]);
        }
        return {
            ...(await this.executeLLM(req, context)),
            duration: elapsedTime(startTime),
        }
    };

    /**
     * Read the 'text' property from request and apply an Embedding model to retrieve a vector.

     * @param req 
     * @returns stringified embedding vector
     */
    private getEmbeddingFromRequest = async (req: Request): Promise<string> => {
        const text = req.data.text;
        const tenant = this.getTenant(req);
        const embeddings = await this.getEmbeddings([text], tenant);
        return (embeddings[0]);
    };

    /**
     * Extract tenant information from request
     * 
     * @param req 
     * @returns tenant id
     */
    private getTenant = (req: Request): string => {
        return cds.env?.requires?.multitenancy ? req.tenant : 'main';
    }

    /**
     * Create embeddings for multiple texts.
     * Requests in chunks of the given text array.
     * Makes use if a retry mechanism, including increasing delay per retry
     * 
     * @param texts array of texts which need the embeddings
     * @param tenant tenant used fpr AI Core service
     * @param maxRetries number of retries for embedding call
     * @returns 
     */
    private getEmbeddings = async (texts: string[], tenant: string, maxRetries: number = 3): Promise<string[]> => {
        const embed = new BTPEmbedding(aiCore.embed, tenant);
        let chunkedTexts: string[][] = [];
        const copiedTexts = texts.slice();
        while (copiedTexts.length > 0) {
            chunkedTexts.push(copiedTexts.splice(0, MAX_PARALELL_ADA_CALLS));
        }

        let result: string[] = [];
        // intentionally not parallel
        for (let i = 0; i < chunkedTexts.length; i++) {
            const embeddings = await this.retryWithDelay(
                async () => { return await embed.embedDocuments(chunkedTexts[i]); },
                maxRetries,
            );
            result = result.concat(embeddings.map((embedding: number[]) => {
                return `[${embedding.toString()}]`;
            }));
        }
        return result;
    };

    /**
     * Calls the given function and if an error is throws, the call is retried.
     * Between each retry, the function waits to retry for an increasing number
     * of seconds: 1, 2, 4, 8, 16. ... up to 90 seconds.
     * 
     * @param func the function, that shall be executed and retried in case of failure
     * @param maxRetries maximum number of retries
     * @returns 
     */
    private retryWithDelay = async (func: Function, maxRetries: number = 3) => {
        let retries = 0;
        while (true) {
            try {
                return await func();
            } catch (e) {
                if (retries >= maxRetries) {
                    throw e; // TODO: handle error correctly and return meaningful error to frontend
                }
                // wait for "2^retries" seconds (max 90 seconds)
                const secondsDelay = Math.min(2 ** retries, MAX_RETRY_DELAY_SECONDS);
                retries++;
                await new Promise(resolve => setTimeout(resolve, secondsDelay * 1000));
            }
        }
    };

    /**
     * Retrieve 'contextCount' movie data from database, ordered by similarity.
     * 
     * @param vector stringified embedding to search similar movies
     * @param contextCount
     * @returns top 'contextCount' similar movie data
     */
    private getMovieIdsFromDatabaseBySimilarity = async (vector: string, contextCount: number = 3, scenario: string): Promise<IMovie[]> => {
        
        // const result = await cds.run(`
        // SELECT TOP ? 
        //     "ID",
        //     "COSINE_SIMILARITY"("EMBEDDING", TO_REAL_VECTOR(?)) AS "COSINE_SIMILARITY",
        //     "L2DISTANCE"("EMBEDDING", TO_REAL_VECTOR(?)) AS "EUCLIDEAN_DISTANCE"
        //   FROM "AI_DB_MOVIES"
        //   WHERE SCENARIO = ?
        //   ORDER BY "COSINE_SIMILARITY" DESC;
        // `, [contextCount, vector, vector, scenario]);

        const { Movies } = cds.db.entities("ai.db");
        const COSINE_SIMILARITY = { func: 'COSINE_SIMILARITY', as: 'COSINE_SIMILARITY', args: [{ ref: ['embedding'] }, { func: 'TO_REAL_VECTOR', args: [{ val: vector }] }] };
        const EUCLIDEAN_DISTANCE = { func: 'L2DISTANCE', as: 'EUCLIDEAN_DISTANCE', args: [{ ref: ['embedding'] }, { func: 'TO_REAL_VECTOR', args: [{ val: vector }] }] };
        const ID = { ref: ['ID'] };

        const result = await SELECT.from(Movies)
            .columns([
                ID,
                COSINE_SIMILARITY,
                EUCLIDEAN_DISTANCE,
            ])
            .where({ "scenario": scenario })
            .orderBy('COSINE_SIMILARITY desc')
            .limit(contextCount);
        return result;
    };

    private getMovieMetadataFromDatabase = async (ids: string[], scenario: string, excludeEmbeddings: boolean = true): Promise<IMovie[]> => {
        const {Movies} = cds.db.entities("ai.db");
        const query = SELECT.from(Movies).where({'ID': {'in': ids}, 'and': {'scenario': scenario}});
        if (excludeEmbeddings) {
            query.SELECT.excluding = ['embedding', 'metadataEmbedding'];
        }
        return await query;
    };

    private executeLLM = async (req: Request, context: Array<IMovie>): Promise<any> => {
        const { text } = req.data;
        const rag = !!req.data?.rag;
        const tenant = this.getTenant(req);
        const scenario = this.getScenario(req);
        const scenarioConfig = await this.getScenarioConfig(scenario);
        const preparedContext = context.map((elem: IMovie) => {
            return {pageContent: this.renderConfigTemplate(scenarioConfig.prepareDocumentTemplate, elem)};
        });

        const chatPrompt = this.getMovieChatPrompt(rag, scenarioConfig);

        const llm = this.getLLM(req, tenant);
        const llmChain = new LLMChain({
            llm: llm,
            prompt: chatPrompt,
            outputKey: "text"
        });
        const chain = rag ? new StuffDocumentsChain({ llmChain: llmChain as unknown as LLMChain<string, BaseLanguageModel<any, BaseLanguageModelCallOptions>> }) : llmChain;
        chain.verbose = true;
        const chainCallOptions: { body: string, input_documents?: object } = {
            body: text,
        };
        if (rag) {
            chainCallOptions.input_documents = preparedContext;
        }
        const result = (await chain.call(chainCallOptions)).text; // TODO: catch the reject and return meaningful error to frontend
        const userHash = getUserHash(req);
        await this.logQuestionAndAnswer(text, userHash, TaskType.LLM, result, rag, context, scenario);

        return {
            text,
            result,
            chainCallOptions
        }
    };

    private renderConfigTemplate(template: string, movie: IMovie): string {
        const result = (template
            .replace("{title}", movie.title)
            .replace("{releaseDate}", movie.releaseDate)
            .replace("{text}", movie.text)
            .replace("{link}", movie.link));
        return result;
    };

    private getMovieChatPrompt = (rag: any, scenarioConfig: IScenarioConfig): ChatPromptTemplate => {
        const systemPrompt = new PromptTemplate({
            template: rag ? scenarioConfig.promptTemplateWithRAG : scenarioConfig.promptTemplateNoRAG,
            inputVariables: rag ? ["context"] : [],
        });
        const systemMessagePrompt = new SystemMessagePromptTemplate({ prompt: systemPrompt });
        const humanTemplate = "{body}";
        const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate(humanTemplate);
        const chatPrompt = ChatPromptTemplate.fromMessages([systemMessagePrompt, humanMessagePrompt]);
        return chatPrompt;
    };

    public getLLM = (req: Request, tenant: string): BaseChatModel => {
        console.log(req.data.model);
        const model = stringToTasks(req.data.model);
        return new BTPAzureOpenAIChatLLM(aiCore.getChatCompletion(model), tenant);
    };

    private logQuestionAndAnswer = async (question: string, userHash: string, taskType: string, answer: string, rag: boolean, context: Array<any>, scenario: string) => {
        const contextForLogs = context.map((ctx: { ID: string; title?: string; TITLE?: string }) => {
            const title = ctx.TITLE ? ctx.TITLE : ctx.title;  // TODO: Get rod of such statements
            return {
                ID: ctx?.ID,
                title
            }
        })
        
        const QAA = {
            userHash: userHash,
            taskType: taskType,
            question: question,
            answer: answer,
            rag,
            context: JSON.stringify(contextForLogs),
            scenario: scenario,
        }
        const { QuestionsAndAnswersLog } = this.entities;
        await INSERT.into(QuestionsAndAnswersLog).entries(QAA);
    };


    /**
    * Handler to make the full (optional) RAG roundtrip.
    * I.e. the request contains a text, a semantic search on database is executed.
    * This search is attached to a prompt and send to an LLM.
    * 
    * @param {Request} req
    * @returns {Promise<any>}
    */
    public onFullRagGenerateResponseStep1 = async (req: Request): Promise<any> => {
        const startTime = process.hrtime();
        const vector = await this.getEmbeddingFromRequest(req);
        return {
            vector,
            duration: elapsedTime(startTime),
        };
    };

    /**
    * Handler to make the full (optional) RAG roundtrip.
    * I.e. the request contains a text, a semantic search on database is executed.
    * This search is attached to a prompt and send to an LLM.
    * 
    * @param {Request} req
    * @returns {Promise<any>}
    */
    public onFullRagGenerateResponseStep2 = async (req: Request): Promise<any> => {
        const { vector, count } = req.data;
        const startTime = process.hrtime();
        const scenario = this.getScenario(req);
        return {
            movies: await this.getMovieIdsFromDatabaseBySimilarity(vector, count, scenario),
            duration: elapsedTime(startTime),
        };
    };

    /**
    * Handler to make the full (optional) RAG roundtrip.
    * I.e. the request contains a text, a semantic search on database is executed.
    * This search is attached to a prompt and send to an LLM.
    * 
    * @param {Request} req
    * @returns {Promise<any>}
    */
    public onFullRagGenerateResponseStep3 = async (req: Request): Promise<any> => {
        const { rag, ids } = req.data;
        const startTime = process.hrtime();
        let movies: IMovie[] = [];
        if (rag) {
            const { Movies } = cds.db.entities("ai.db");
            movies = await SELECT.from(Movies).where({'ID': {'in': ids}});
        }
        return {
            ...(await this.executeLLM(req, movies)),
            duration: elapsedTime(startTime),
        };
    };


    /**
        * Handler to make the full (optional) RAG roundtrip.
        * I.e. the request contains a text, a semantic search on database is executed.
        * This search is attached to a prompt and send to an LLM.
        * 
        * @param {Request} req
        * @returns {Promise<any>}
        */
    public onGetMoviesById = async (req: Request): Promise<any> => {
        const { ids } = req.data;
        const startTime = process.hrtime();

        const scenario = this.getScenario(req);
        return {
            ...(await this.getMovieMetadataFromDatabase(ids, scenario)),
            duration: elapsedTime(startTime),
        };
    };

    /**
    * Handler to import multiple movies
    * @param {Request} req
    * @returns {Promise<any>}
    */
    public onImportMovies = async (req: Request): Promise<any> => {
        let movies = req.data.movies as IMovie[];
        const tenant = this.getTenant(req);
        const texts = await this.prepareEmbeddingText(movies);
        const maxRetries = 8;
        const embeddings = await this.getEmbeddings(texts, tenant, maxRetries);
        const embeddedMovies = movies.map((movie, index) => {
            return { ...movie, embedding: embeddings[index] };
        });
        const { Movies } = this.entities;
        await INSERT.into(Movies).entries(embeddedMovies);
        return true;
    };

    /**
     * Generates the string from a movie, which is passed to generate the embedding.
     * Allows to scenarios to differ per movie.
     */
    private prepareEmbeddingText = async(movies: IMovie[]): Promise<string[]> => {
        let scenarioConfigs: Record<string, IScenarioConfig> = {};
        return await Promise.all(movies.map(async (movie): Promise<string> => {
            const scenario = movie.scenario;
            if (!scenarioConfigs[scenario]) {
                scenarioConfigs[scenario] = await this.getScenarioConfig(scenario);
            }
            return this.renderConfigTemplate(scenarioConfigs[scenario].importEmbeddingTemplate, movie);
        }));
    };

    /**
     * Handler for getting a similar documents
     * @param {Request} req
     * @returns {Promise<any>}
     */
    public onSemanticSearch = async (req: Request): Promise<any> => {
        const startEmbeddingTime = process.hrtime();
        const embedding = await this.getEmbeddingFromRequest(req);
        const embeddingDuration = elapsedTime(startEmbeddingTime);
        const scenario = this.getScenario(req);
        const startGetMoviesFromDatabaseBySimilarityTime = process.hrtime();
        const resultFromSemanticSearch = await this.getMovieIdsFromDatabaseBySimilarity(embedding, 20, scenario);
        const databaseDuration = elapsedTime(startGetMoviesFromDatabaseBySimilarityTime);
        console.log(resultFromSemanticSearch);
        const movieIds = resultFromSemanticSearch.map((entry) => entry.ID);
        const movieMetadata = await this.getMovieMetadataFromDatabase(movieIds, scenario);
        console.log("!!!!!!",movieMetadata);

        const moviesToReturn = resultFromSemanticSearch.map((movie) => {
            const sameMovie = movieMetadata.find((result) => result.ID === movie.ID);
            return Object.assign(movie, sameMovie);
        })
        const question = req.data.text;
        const userHash = getUserHash(req);
        const context = movieMetadata.map((movie) => {
            return {ID: movie.ID, title: movie.title}
        });

        await this.logQuestionAndAnswer(question, userHash, TaskType.SEMANTICSEARCH, null, false, context, scenario);
        return {
            result: JSON.stringify(moviesToReturn),
            embeddingDuration: embeddingDuration,
            databaseDuration: databaseDuration
        }
    };

    /**
    * Handler for getting a similar documents
    * @param {Request} req
    * @returns {Promise<any>}
    */
    public onAnalyzeSimilarity = async (req: Request): Promise<any> => {       
        const text = req.data.text;
        const tenant = cds.env?.requires?.multitenancy && req.tenant;
        const embed = new BTPEmbedding(aiCore.embed, tenant);
        const embeddings = await Promise.all(
            [text].map(async (txt: string) => {
                const embedding = `[${(await embed.embedDocuments([txt]))[0].toString()}]`;
                // const binaryEmbedding = array2VectorBuffer(JSON.parse(embedding));
                return embedding;
            })
        );
        //SELECT NTH_VALUE (COL1, 2 ORDER BY COL2) FROM T;
        const vector = embeddings[0];
        const result = await cds.run(`
                SELECT
                   DATASETLABEL,
                   COUNT(*) AS COUNT,
                   MAX(COSINE_SIMILARITY_VALUES) AS MAX,
                   MIN(COSINE_SIMILARITY_VALUES) AS MIN,
                   AVG(COSINE_SIMILARITY_VALUES) AS AVG,
                   SUM(COSINE_SIMILARITY_VALUES) AS SUM,
                   MEDIAN(COSINE_SIMILARITY_VALUES) AS MEDIAN,
                   NTH_VALUE (COSINE_SIMILARITY_VALUES, 10 ORDER BY COSINE_SIMILARITY_VALUES DESC) RANK_010,
                   NTH_VALUE (COSINE_SIMILARITY_VALUES, 20 ORDER BY COSINE_SIMILARITY_VALUES DESC) RANK_020,
                   NTH_VALUE (COSINE_SIMILARITY_VALUES, 50 ORDER BY COSINE_SIMILARITY_VALUES DESC) RANK_050,
                   NTH_VALUE (COSINE_SIMILARITY_VALUES, 100 ORDER BY COSINE_SIMILARITY_VALUES DESC) RANK_100,
                   NTH_VALUE (COSINE_SIMILARITY_VALUES, 200 ORDER BY COSINE_SIMILARITY_VALUES DESC) RANK_200,
                   MAX(EUCLIDEAN_DISTANCE_VALUES) AS EU_MAX,
                   MIN(EUCLIDEAN_DISTANCE_VALUES) AS EU_MIN,
                   AVG(EUCLIDEAN_DISTANCE_VALUES) AS EU_AVG,
                   SUM(EUCLIDEAN_DISTANCE_VALUES) AS EU_SUM,
                   MEDIAN(EUCLIDEAN_DISTANCE_VALUES) AS EU_MEDIAN,
                   NTH_VALUE (EUCLIDEAN_DISTANCE_VALUES, 10 ORDER BY EUCLIDEAN_DISTANCE_VALUES DESC) EU_RANK_010,
                   NTH_VALUE (EUCLIDEAN_DISTANCE_VALUES, 20 ORDER BY EUCLIDEAN_DISTANCE_VALUES DESC) EU_RANK_020,
                   NTH_VALUE (EUCLIDEAN_DISTANCE_VALUES, 50 ORDER BY EUCLIDEAN_DISTANCE_VALUES DESC) EU_RANK_050,
                   NTH_VALUE (EUCLIDEAN_DISTANCE_VALUES, 100 ORDER BY EUCLIDEAN_DISTANCE_VALUES DESC) EU_RANK_100,
                   NTH_VALUE (EUCLIDEAN_DISTANCE_VALUES, 200 ORDER BY EUCLIDEAN_DISTANCE_VALUES DESC) EU_RANK_200
                FROM
                (SELECT DATASETLABEL ,
                        "COSINE_SIMILARITY"("EMBEDDING", TO_REAL_VECTOR('${vector}')) AS "COSINE_SIMILARITY_VALUES",
                        "L2DISTANCE"("EMBEDDING", TO_REAL_VECTOR('${vector}')) AS "EUCLIDEAN_DISTANCE_VALUES"
                FROM "AI_DB_MOVIES" AS "CS_TABLE")
                GROUP BY DATASETLABEL;
                `);

        return JSON.stringify(result);
    };

    /**
     * Called, when the virtialEmbedding property is potentially requested.
     * Retrieve the requeted vectors from database and extend the requested entities.
     * 
     * @param requestedMovies 
     * @param req 
     * @returns 
     */
    public extendWithVirtualEmbedding = async (requestedMovies: IMovie[], req: Request): Promise<IMovie[]> => { 
        if (!this.isColumnExpectedInResult(req, 'virtualEmbedding')) {
            // virtual Embedding is not requested
            return requestedMovies;
        }

        const { Movies } = cds.db.entities("ai.db");
        const ids = requestedMovies.map(m => m.ID);
        const moviesWithEmbedding: IMovie[] = await SELECT.from(Movies)
            .columns('ID', 'embedding')
            .where({'ID': {'in': ids}});

        // Could be more efficient, but in this application, usually only a small number is retrieved
        requestedMovies.map(movie => {
            const movieWithEmbedding = moviesWithEmbedding.find(x => x.ID == movie.ID);
            movie.virtualEmbedding = movieWithEmbedding?.embedding;
        });
        return requestedMovies;
    };
    
    /**
     * Apply this funtion on 'after READ' events to check, whether a virtual element
     * shall be part of the result.
     * 
     * The column is in the result, if:
     *  - The entity as whole is requested, i.e. the 'query' property doesn't contain a 'SELECT' property
     *  - The columns are expictly specified, and the name is in one of the columns
     * 
     * Note: I am not aware of any official CAP function to do this.
     * Note: I am not aware of any other cases, but it is very likely, that there are some, which are not covered here
     * 
     * @param req 
     * @param columnName 
     * @returns 
     */
    private isColumnExpectedInResult = (req: Request, columnName: string) : boolean => {
        const select = req.query?.SELECT;
        if (select.columns) {
            for (let i = 0; i < select.columns.length; i++) {
                const column = select.columns[i];
                if ((column as any)?.flatName === columnName) {
                    return true;
                }
            }    
        }
        else {
            return true;
        }
        return false;
    };
};

const getUserHash = (req: Request): string => {
    return Md5.hashStr(req.user.id);
};
const elapsedTime = (startTime: number[]): number => {
    const currentTime = process.hrtime();
    const startAsSeconds = startTime[0] + startTime[1] / 1000000000.0;
    const currentAsSeconds = currentTime[0] + currentTime[1] / 1000000000.0;
    return currentAsSeconds - startAsSeconds;
}

const stringToTasks = (modelName: string): aiCore.Tasks => {
    if (modelName == null) {
        return aiCore.Tasks.CHATGPT35;
    } else if (modelName?.toUpperCase() === "CHATGPT4") {
        return aiCore.Tasks.CHAT;
    } else if (modelName.toUpperCase() === "CHATGPT35") {
        return aiCore.Tasks.CHATGPT35;
    } else if (modelName.toUpperCase() === "CHATFALCON") {
        return aiCore.Tasks.CHATFALCON;
    } else {
        return aiCore.Tasks.CHATGPT35;
    }
};

const fixJsonString = (jsonString: String): string => {
    return (
        jsonString
            // Workaround - Add missing ',' for valid JSON
            .replace(/\"\s*\"/g, '", "')
            // Workaround - Replace \n by \\n in property values
            .replace(/"([^"]*)"/g, (match, _) => {
                return match.replace(/\n(?!\\n)/g, "\\n");
            })
    );
};

