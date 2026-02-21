import { AzureChatOpenAI, AzureOpenAIEmbeddings } from '@langchain/openai';
import { aiConfig, ragConfig } from './config';
import { env } from '../env';

// Lazy-loaded model instances (only created when first accessed)
let _claudeModel: AzureChatOpenAI | null = null;
let _openaiModel: AzureChatOpenAI | null = null;
let _embeddings: AzureOpenAIEmbeddings | null = null;

export function getClaudeModel(): AzureChatOpenAI {
  if (!_claudeModel) {
    _claudeModel = new AzureChatOpenAI({
      azureOpenAIApiKey: env.AZURE_OPENAI_API_KEY,
      azureOpenAIEndpoint: env.AZURE_OPENAI_ENDPOINT,
      azureOpenAIApiDeploymentName: env.AZURE_OPENAI_DEPLOYMENT_NAME,
      azureOpenAIApiVersion: env.AZURE_OPENAI_API_VERSION,
      maxTokens: aiConfig.maxTokens,
    });
  }
  return _claudeModel;
}

export function getOpenAIModel(): AzureChatOpenAI {
  if (!_openaiModel) {
    if (!env.AZURE_OPENAI_API_KEY) {
      throw new Error('AZURE_OPENAI_API_KEY is not configured');
    }
    _openaiModel = new AzureChatOpenAI({
      azureOpenAIApiKey: env.AZURE_OPENAI_API_KEY,
      azureOpenAIEndpoint: env.AZURE_OPENAI_ENDPOINT,
      azureOpenAIApiDeploymentName: env.AZURE_OPENAI_DEPLOYMENT_NAME,
      azureOpenAIApiVersion: env.AZURE_OPENAI_API_VERSION,
      maxTokens: aiConfig.maxTokens,
    });
  }
  return _openaiModel;
}

export function getEmbeddings(): AzureOpenAIEmbeddings {
  if (!_embeddings) {
    if (!env.AZURE_OPENAI_API_KEY) {
      throw new Error('AZURE_OPENAI_API_KEY is required for embeddings');
    }
    _embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: env.AZURE_OPENAI_API_KEY,
      azureOpenAIEndpoint: env.AZURE_OPENAI_ENDPOINT,
      azureOpenAIApiDeploymentName: env.AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT,
      azureOpenAIApiVersion: env.AZURE_OPENAI_API_VERSION,
    });
  }
  return _embeddings;
}

// Legacy exports for backward compatibility (lazy getters)
export const claudeModel = {
  get instance() {
    return getClaudeModel();
  },
};

export const openaiModel = {
  get instance() {
    return getOpenAIModel();
  },
};

export const embeddings = {
  get instance() {
    return getEmbeddings();
  },
};

export function getModelForAgent(
  agentType: string,
  preferClaude: boolean = true
) {
  const temperature = aiConfig.temperature[agentType as keyof typeof aiConfig.temperature] || 0.7;

  if (preferClaude) {
    return new AzureChatOpenAI({
      azureOpenAIApiKey: env.AZURE_OPENAI_API_KEY,
      azureOpenAIEndpoint: env.AZURE_OPENAI_ENDPOINT,
      azureOpenAIApiDeploymentName: env.AZURE_OPENAI_DEPLOYMENT_NAME,
      azureOpenAIApiVersion: env.AZURE_OPENAI_API_VERSION,
      maxTokens: aiConfig.maxTokens,
      temperature,
    });
  }

  return new AzureChatOpenAI({
    azureOpenAIApiKey: env.AZURE_OPENAI_API_KEY,
    azureOpenAIEndpoint: env.AZURE_OPENAI_ENDPOINT,
    azureOpenAIApiDeploymentName: env.AZURE_OPENAI_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: env.AZURE_OPENAI_API_VERSION,
    maxTokens: aiConfig.maxTokens,
    temperature,
  });
}
