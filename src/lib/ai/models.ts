import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { aiConfig, ragConfig } from './config';

export const claudeModel = new ChatAnthropic({
  model: aiConfig.primaryModel,
  maxTokens: aiConfig.maxTokens,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
});

export const openaiModel = new ChatOpenAI({
  model: aiConfig.fallbackModel,
  maxTokens: aiConfig.maxTokens,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export const embeddings = new OpenAIEmbeddings({
  model: ragConfig.embeddingModel,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export function getModelForAgent(
  agentType: string,
  preferClaude: boolean = true
) {
  const temperature = aiConfig.temperature[agentType as keyof typeof aiConfig.temperature] || 0.7;

  if (preferClaude) {
    return new ChatAnthropic({
      model: aiConfig.primaryModel,
      maxTokens: aiConfig.maxTokens,
      temperature,
    });
  }

  return new ChatOpenAI({
    model: aiConfig.fallbackModel,
    maxTokens: aiConfig.maxTokens,
    temperature,
  });
}
