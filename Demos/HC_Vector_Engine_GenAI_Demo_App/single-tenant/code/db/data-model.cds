using {
      cuid,
      managed
} from '@sap/cds/common';

context ai.db {
      aspect scenario {
            scenario            :      String(50);
      }

      type Movie : scenario {
            ID                  : String;
            link                : String;
            title               : String;
            text                : LargeString;
            releaseDate         : Timestamp;
            datasetLabel        : String;
      }

      entity Movies : managed, cuid, scenario {
            title               :      String;
            text                :      LargeString;
            releaseDate         :      Timestamp;
            embedding           :      cds.Vector;
            datasetLabel        :      String;
            link                :      String;

            // these features are not used in app and serve demonstration purposes
            metadata            :      String;       // movie specific metadata extracted via LLM from Wikipedia
            metadataEmbedding   :      cds.Vector;
            virtual virtualEmbedding : String;       // Test Embedding consumption via ODATA as virtual element
      }

      entity QuestionsAndAnswersLog : cuid, scenario {
            createdAt           :      Timestamp @cds.on.insert : $now;
            userHash            :      String;
            taskType            :      String;
            rag                 :      Boolean;
            question            :      LargeString;
            answer              :      LargeString;
            context             :      LargeString;
      }

      entity ScenarioConfig : cuid, scenario {
            promptTemplateWithRAG    : String;
            promptTemplateNoRAG      : String;
            importEmbeddingTemplate  : String;
            prepareDocumentTemplate  : String;
      }
}
