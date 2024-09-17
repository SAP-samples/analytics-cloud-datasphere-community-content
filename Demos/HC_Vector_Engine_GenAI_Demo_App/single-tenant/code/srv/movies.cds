using {ai.db as db} from '../db/data-model';

@(requires: [
    'Member', // TODO: may read only
    'Admin', // TODO: may write
    'system-user' // TODO: may write
])
service MoviesService @(
    path    : 'movies',
    protocol: 'odata-v4'
) {

    @readonly entity Movies as projection on db.Movies excluding {embedding, metadata, metadataEmbedding, virtualEmbedding} where scenario = 'MOVIES';
    @readonly entity CapDocs as projection on db.Movies excluding {embedding, metdata, metadataEmbedding, virtualEmbedding} where scenario = 'CAP_DOCUMENTATION';
    entity QuestionsAndAnswersLog @(restrict: [
        { grant: ['READ'], to: 'Admin' }
    ]) as projection on db.QuestionsAndAnswersLog; // TODO: only system-user should be able to write, admin may read
    @readonly entity ScenarioConfig as projection on db.ScenarioConfig;

    action semanticSearch(text : String null, scenario : String null)  returns String;
    action generateFullRagResponse(text : String null, rag : Boolean null, scenario : String null, model: String null)  returns String;

    action generateFullRagResponseStep1(text : String null)  returns String;
    action generateFullRagResponseStep2(vector : String null, count: Int16 null, scenario : String null)  returns String;
    action generateFullRagResponseStep3(text : String null, rag : Boolean null, model: String null, ids: array of String, scenario : String null)  returns String;

    action getMoviesById(ids: array of String)  returns String;
};
