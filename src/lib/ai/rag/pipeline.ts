import { getEmbeddings } from '../models';
import { ragConfig } from '../config';
import { ChromaClient, Collection, IncludeEnum } from 'chromadb';

interface ContentItem {
  contentId: string;
  content: string;
  chunkIndex?: number;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  type?: string;
  title?: string;
}

interface RetrievedContent {
  content: string;
  score: number;
  metadata: Record<string, string>;
}

interface RetrieveOptions {
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  topK?: number;
}

let _chroma: ChromaClient | null = null;
let _collection: Collection | null = null;

function getChroma(): ChromaClient {
  if (!_chroma) {
    const config = ragConfig as { chromaUrl: string };
    _chroma = new ChromaClient({
      path: config.chromaUrl,
    });
  }
  return _chroma;
}

async function initialize(): Promise<void> {
  const chroma = getChroma();
  _collection = await chroma.getOrCreateCollection({
    name: ragConfig.collectionName,
    metadata: { 'hnsw:space': 'cosine' },
  });
}

async function getCollection(): Promise<Collection> {
  if (!_collection) await initialize();
  return _collection!;
}

export const ragPipeline = {
  async initialize() {
    await initialize();
  },

  async indexContent(items: ContentItem[]): Promise<void> {
    const collection = await getCollection();
    const embeddings = await getEmbeddings().embedDocuments(items.map((i) => i.content));
    const ids = items.map((item, i) => `${item.contentId}-${item.chunkIndex ?? i}`);

    await collection.upsert({
      ids,
      embeddings,
      documents: items.map((i) => i.content),
      metadatas: items.map((i) => ({
        contentId: i.contentId,
        chunkIndex: String(i.chunkIndex ?? 0),
        courseId: i.courseId ?? '',
        moduleId: i.moduleId ?? '',
        lessonId: i.lessonId ?? '',
        type: i.type ?? 'content',
        title: i.title ?? '',
      })),
    });
  },

  /**
   * Retrieve relevant content for a query
   */
  async retrieve(query: string, options?: RetrieveOptions): Promise<RetrievedContent[]> {
    const collection = await getCollection();
    const queryEmbedding = await getEmbeddings().embedQuery(query);

    const whereFilter: Record<string, string> = {};
    if (options?.courseId) whereFilter.courseId = options.courseId;
    if (options?.moduleId) whereFilter.moduleId = options.moduleId;
    if (options?.lessonId) whereFilter.lessonId = options.lessonId;

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: options?.topK ?? ragConfig.topK,
      where: Object.keys(whereFilter).length > 0 ? whereFilter : undefined,
      include: [IncludeEnum.Documents, IncludeEnum.Metadatas, IncludeEnum.Distances],
    });

    const docs = results.documents?.[0] ?? [];
    const metas = results.metadatas?.[0] ?? [];
    const distances = results.distances?.[0] ?? [];

    return docs.map((doc, i) => ({
      content: doc ?? '',
      score: 1 - (distances[i] ?? 0),
      metadata: (metas[i] ?? {}) as Record<string, string>,
    }));
  },

  /**
   * Delete content from the index
   */
  async deleteContent(contentId: string): Promise<void> {
    const collection = await getCollection();
    await collection.delete({
      where: { contentId },
    });
  },
};
