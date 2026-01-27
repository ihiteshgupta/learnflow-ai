import { QdrantClient } from '@qdrant/js-client-rest';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { embeddings } from '../models';
import { ragConfig } from '../config';

const qdrant = new QdrantClient({
  url: ragConfig.qdrantUrl,
  apiKey: ragConfig.qdrantApiKey,
});

export const ragPipeline = {
  /**
   * Initialize the collection if it doesn't exist
   */
  async initialize() {
    try {
      await qdrant.getCollection(ragConfig.collectionName);
    } catch {
      await qdrant.createCollection(ragConfig.collectionName, {
        vectors: {
          size: 3072, // text-embedding-3-large dimension
          distance: 'Cosine',
        },
      });
    }
  },

  /**
   * Index course content into the vector database
   */
  async indexContent(
    contentId: string,
    content: string,
    metadata: {
      courseId: string;
      moduleId?: string;
      lessonId?: string;
      type: string;
      title: string;
    }
  ) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: ragConfig.chunkSize,
      chunkOverlap: ragConfig.chunkOverlap,
    });

    const chunks = await splitter.splitText(content);
    const vectors = await embeddings.embedDocuments(chunks);

    const points = chunks.map((chunk: string, i: number) => ({
      id: `${contentId}-${i}`,
      vector: vectors[i],
      payload: {
        content: chunk,
        contentId,
        chunkIndex: i,
        ...metadata,
      },
    }));

    await qdrant.upsert(ragConfig.collectionName, {
      wait: true,
      points,
    });

    return { indexed: chunks.length };
  },

  /**
   * Retrieve relevant content for a query
   */
  async retrieve(
    query: string,
    filters?: {
      courseId?: string;
      moduleId?: string;
      lessonId?: string;
    },
    limit: number = ragConfig.topK
  ): Promise<string> {
    const queryVector = await embeddings.embedQuery(query);

    const filter: Record<string, unknown> = {};
    if (filters?.courseId) {
      filter.must = [{ key: 'courseId', match: { value: filters.courseId } }];
    }
    if (filters?.moduleId) {
      filter.must = filter.must || [];
      (filter.must as unknown[]).push({ key: 'moduleId', match: { value: filters.moduleId } });
    }
    if (filters?.lessonId) {
      filter.must = filter.must || [];
      (filter.must as unknown[]).push({ key: 'lessonId', match: { value: filters.lessonId } });
    }

    const results = await qdrant.search(ragConfig.collectionName, {
      vector: queryVector,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      limit,
      with_payload: true,
    });

    return results
      .map((r) => r.payload?.content as string)
      .filter(Boolean)
      .join('\n\n---\n\n');
  },

  /**
   * Delete content from the index
   */
  async deleteContent(contentId: string) {
    await qdrant.delete(ragConfig.collectionName, {
      filter: {
        must: [{ key: 'contentId', match: { value: contentId } }],
      },
    });
  },
};
