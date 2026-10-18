import { OpenAIProvider } from './openai.js';
import type { LLMProvider, ScriptGenerationInput } from './provider.js';

export interface GroqProviderOptions {
  apiKey?: string;
  model?: string;
  baseURL?: string;
}

export class GroqProvider implements LLMProvider {
  readonly name = 'groq';
  private readonly inner: OpenAIProvider;

  constructor(opts: GroqProviderOptions = {}) {
    const apiKey = opts.apiKey ?? process.env['GROQ_API_KEY'];
    if (!apiKey) {
      throw new Error(
        'GroqProvider: GROQ_API_KEY not set. Pass apiKey option or set the env var.',
      );
    }
    const model = opts.model ?? process.env['GROQ_MODEL'] ?? 'openai/gpt-oss-120b';
    const baseURL =
      opts.baseURL ?? process.env['GROQ_BASE_URL'] ?? 'https://api.groq.com/openai/v1';

    this.inner = new OpenAIProvider({
      apiKey,
      model,
      baseURL,
      structuredMode: 'json_object',
      temperature: 0.2,
      reasoningEffort: 'low',
    });
  }

  generateScript(input: ScriptGenerationInput) {
    return this.inner.generateScript(input);
  }
}
