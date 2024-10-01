
export interface IMovie {
    ID?: string;
    title: string;
    text: string;
    link?: string;
    scenario?: string;
    releaseDate?: string;
    embedding?: string;
    datasetLabel?: string;
    cosineSimilarity?: number;
    euclideanDistance?: number;
    metadata?: string;
    metadataEmbedding?: string;
    virtualEmbedding?: string;
}

export interface IScenarioConfig {
    ID?: string;
    scenario?: string;
    promptTemplateWithRAG?: string;
    promptTemplateNoRAG?: string;
    importEmbeddingTemplate?: string;
    prepareDocumentTemplate?: string;
}
