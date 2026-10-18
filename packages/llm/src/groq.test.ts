import { describe, expect, it } from 'vitest';
import { GroqProvider } from './groq.js';
import { resolveLLMProvider } from './resolve.js';

describe('GroqProvider', () => {
  it('throws if no API key is provided', () => {
    const originalEnv = process.env['GROQ_API_KEY'];
    delete process.env['GROQ_API_KEY'];
    try {
      expect(() => new GroqProvider()).toThrow('GROQ_API_KEY not set');
    } finally {
      if (originalEnv) process.env['GROQ_API_KEY'] = originalEnv;
    }
  });

  it('instantiates and resolves groq provider correctly', () => {
    const provider = resolveLLMProvider({ kind: 'groq', apiKey: 'test-key' });
    expect(provider.name).toBe('groq');
  });
});
