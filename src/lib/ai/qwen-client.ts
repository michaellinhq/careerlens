/**
 * 通义千问 (Qwen) API Client
 *
 * Compatible with OpenAI API format.
 * Endpoint: https://dashscope.aliyuncs.com/compatible-mode/v1
 *
 * When NEXT_PUBLIC_QWEN_API_KEY is not set, falls back to mock responses.
 */

const QWEN_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const QWEN_MODEL = 'qwen-plus'; // good balance of quality and cost

function getApiKey(): string | null {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).__QWEN_API_KEY as string | null
      || process.env.NEXT_PUBLIC_QWEN_API_KEY
      || null;
  }
  return process.env.NEXT_PUBLIC_QWEN_API_KEY || null;
}

export function isAIAvailable(): boolean {
  return !!getApiKey();
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface QwenResponse {
  choices: { message: { content: string } }[];
}

export async function chatCompletion(messages: ChatMessage[], temperature = 0.3): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('QWEN_API_KEY not configured');
  }

  const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: QWEN_MODEL,
      messages,
      temperature,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Qwen API error ${response.status}: ${err}`);
  }

  const data: QwenResponse = await response.json();
  return data.choices[0].message.content;
}
