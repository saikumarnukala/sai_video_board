import type { SynthesizeInput, SynthesizeOutput, TTSProvider } from './provider.js';

export interface DeepgramProviderOptions {
  apiKey?: string;
  model?: string;
  voice?: string;
}

export class DeepgramProvider implements TTSProvider {
  readonly name = 'deepgram';
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(opts: DeepgramProviderOptions = {}) {
    const apiKey = opts.apiKey ?? process.env['DEEPGRAM_API_KEY'];
    if (!apiKey) {
      throw new Error(
        'DeepgramProvider: DEEPGRAM_API_KEY not set. Pass apiKey option or set the env var.',
      );
    }
    this.apiKey = apiKey;
    this.defaultModel =
      opts.voice ?? opts.model ?? process.env['DEEPGRAM_MODEL'] ?? 'aura-asteria-en';
  }

  async synthesize(input: SynthesizeInput): Promise<SynthesizeOutput> {
    const model = input.voice ?? this.defaultModel;
    const url = new URL('https://api.deepgram.com/v1/speak');
    url.searchParams.set('model', model);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: input.text }),
    });

    if (!response.ok) {
      throw new Error(`DeepgramProvider: HTTP ${response.status} ${await response.text()}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const format = contentType.includes('wav') ? 'wav' : 'mp3';
    const arrayBuffer = await response.arrayBuffer();
    return { bytes: new Uint8Array(arrayBuffer), format };
  }
}
