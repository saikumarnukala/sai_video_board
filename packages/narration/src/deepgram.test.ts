import { describe, expect, it, vi } from 'vitest';
import { DeepgramProvider } from './deepgram.js';
import { resolveTTSProvider } from './resolve.js';

describe('DeepgramProvider', () => {
  it('throws if no API key is provided', () => {
    const originalEnv = process.env['DEEPGRAM_API_KEY'];
    delete process.env['DEEPGRAM_API_KEY'];
    try {
      expect(() => new DeepgramProvider()).toThrow('DEEPGRAM_API_KEY not set');
    } finally {
      if (originalEnv) process.env['DEEPGRAM_API_KEY'] = originalEnv;
    }
  });

  it('synthesizes speech via fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'audio/mpeg' }),
      arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
    });
    vi.stubGlobal('fetch', mockFetch);

    try {
      const provider = new DeepgramProvider({ apiKey: 'test-key', voice: 'aura-asteria-en' });
      const res = await provider.synthesize({ text: 'Hello world', language: 'en' });

      expect(res.format).toBe('mp3');
      expect(res.bytes).toEqual(new Uint8Array([1, 2, 3]));
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.deepgram.com/v1/speak?model=aura-asteria-en',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Token test-key',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ text: 'Hello world' }),
        }),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('resolves deepgram provider from config', () => {
    const provider = resolveTTSProvider({ kind: 'deepgram', apiKey: 'test-key' });
    expect(provider.name).toBe('deepgram');
  });
});
