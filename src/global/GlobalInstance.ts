import {
  ClaudeInstance,
  DeepSeekInstance,
  GrokInstance,
  LmStudioInstance,
  OIlamaInstance,
  OpenAiInstance,
  PerplexityInstance,
  GeminiInstance,
} from '..';
import { ResponseFormat } from '../common/responseFormat';
import { ModelClaude } from '../claude/ModelClaude';
import { ModelDeepSeek } from '../deepSeek/ModelDeepSeek';
import { ModelGrok } from '../grok/modelGrok';
import { ModelOpenAi } from '../openAi/ModelOpenAi';
import { ModelOpenAiEmbedding } from '../openAi/ModelOpenAiEmbedding';
import { ModelPerplexity } from '../perplexity/ModelPerplexity';
import { GlobalInstanceCompany } from './GlobalInstanceCompany';
import { GlobalInstanceEmbeddingModel } from './GlobalInstanceEmbeddingModel';
import { GlobalInstanceModel } from './GlobalInstanceModel';
import { GlobalInstanceParameters } from './GlobalInstanceParameters';
import { GlobalInstanceVisionModel } from './GlobalInstanceVisionModel';
import { ModelGemini } from '../gemini/ModelGemini';
export default class GlobalInstance {
  private instances: Record<GlobalInstanceCompany, any>;

  constructor({
    openAiKey,
    ollamaUrl,
    deepSeekKey,
    lmstudioUrl,
    perplexityKey,
    grokKey,
    claudeKey,
    geminiKey,
  }: Partial<GlobalInstanceParameters>) {
    this.instances = {
      ...(openAiKey && { openai: new OpenAiInstance(openAiKey) }),
      ...(ollamaUrl && { ollama: new OIlamaInstance(ollamaUrl) }),
      ...(deepSeekKey && { deepseek: new DeepSeekInstance(deepSeekKey) }),
      ...(lmstudioUrl && { lmstudio: new LmStudioInstance(lmstudioUrl) }),
      ...(perplexityKey && { perplexity: new PerplexityInstance(perplexityKey) }),
      ...(grokKey && { grok: new GrokInstance(grokKey) }),
      ...(claudeKey && { claude: new ClaudeInstance(claudeKey) }),
      ...(geminiKey && { gemini: new GeminiInstance(geminiKey) }),
    } as Record<GlobalInstanceCompany, any>;
  }

  public chat({
    prompt,
    systemPrompt,
    model,
    format,
    instance,
  }: {
    prompt: string;
    model: GlobalInstanceModel;
    systemPrompt?: string;
    format?: ResponseFormat;
    instance?: GlobalInstanceCompany;
  }): Promise<string | null> {
    // Auto-detect instance based on model if not explicitly provided
    if (!instance) {
      if (Object.values(ModelOpenAi).includes(model as ModelOpenAi)) {
        return this.instances.openai.chat(prompt, systemPrompt, model as ModelOpenAi, format);
      }
      // Use type assertion for comparison only, not for passing the value
      if (Object.values(ModelDeepSeek).includes(model as ModelDeepSeek)) {
        return this.instances.deepseek.chat(prompt, systemPrompt, model, format);
      }
      if (Object.values(ModelPerplexity).includes(model as ModelPerplexity)) {
        return this.instances.perplexity.chat(prompt, systemPrompt, model, format);
      }
      if (Object.values(ModelGrok).includes(model as ModelGrok)) {
        return this.instances.grok.chat(prompt, systemPrompt, model, format);
      }
      if (Object.values(ModelClaude).includes(model as ModelClaude)) {
        return this.instances.claude.chat(prompt, systemPrompt, model as ModelClaude, format);
      }
      if (Object.values(ModelGemini).includes(model as ModelGemini)) {
        return this.instances.gemini.chat(prompt, systemPrompt, model as ModelGemini, format);
      }
    }

    // Use specified instance
    const selectedInstance = instance as GlobalInstanceCompany;
    if (!this.instances[selectedInstance]) {
      throw new Error(`Unsupported instance: ${selectedInstance}`);
    }

    try {
      return this.instances[selectedInstance].chat(prompt, systemPrompt, model, format);
    } catch (error) {
      throw new Error(`Error with ${selectedInstance} chat: ${error}`);
    }
  }

  public embedding({
    prompt,
    model,
    instance,
  }: {
    prompt: string;
    model: GlobalInstanceEmbeddingModel;
    instance?: GlobalInstanceCompany;
  }): Promise<number[]> {
    // Auto-detect for OpenAI embedding models
    if (Object.values(ModelOpenAiEmbedding).includes(model as ModelOpenAiEmbedding)) {
      return this.instances.openai.embedding(prompt, model as ModelOpenAiEmbedding);
    }

    // Check if instance supports embedding
    if (
      instance === 'deepseek' ||
      instance === 'perplexity' ||
      instance === 'claude' ||
      !instance
    ) {
      throw new Error(`${instance} does not support embedding`);
    }

    try {
      return this.instances[instance].embedding(prompt, model);
    } catch (error) {
      throw new Error(`Error with ${instance} embedding: ${error}`);
    }
  }

  public vision({
    prompt,
    base64Image,
    systemPrompt,
    model,
    instance,
  }: {
    prompt: string;
    model: GlobalInstanceVisionModel;
    base64Image?: string;
    systemPrompt?: string;
    instance?: GlobalInstanceCompany;
  }): Promise<string | null | undefined> {
    // Auto-detect vision models
    if (!instance) {
      if (Object.values(ModelClaude).includes(model as any)) {
        return this.instances.claude.vision(
          prompt,
          base64Image,
          systemPrompt,
          model as ModelClaude
        );
      }
    }

    // Check if instance supports vision
    if (instance === 'deepseek' || instance === 'perplexity' || !instance) {
      throw new Error(`${instance} does not support vision`);
    }

    try {
      return this.instances[instance].vision(prompt, base64Image, systemPrompt, model);
    } catch (error) {
      throw new Error(`Error with ${instance} vision: ${error}`);
    }
  }
}
