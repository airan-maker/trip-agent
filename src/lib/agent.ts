import { nanoid } from 'nanoid';
import { Place } from '@/types/trip';
import { getEnv } from './env';
import * as db from './db';
import { z } from 'zod';
import { buildKnowledgeContext } from './knowledge/japan-cities';

const SYSTEM_PROMPT = `You are TripTalk, a friendly Korean-speaking travel planning AI agent. You help users plan their trips through natural conversation.

## Your Personality
- Warm, enthusiastic, but concise
- Use casual Korean (반말/존댓말 mix, leaning friendly)
- Add relevant emoji occasionally but don't overdo it
- Feel like a knowledgeable friend who loves travel

## Conversation Flow
Guide the conversation step by step. Don't ask everything at once. Follow this order:
1. Destination & travel dates
2. Who's traveling (solo, couple, family, friends, group size)
3. Travel theme/style (relaxation, adventure, food tour, culture, etc.)
4. Must-visit places or preferences
5. Budget range & transportation preferences

## Rules
- Ask ONE question at a time (maximum two related questions)
- Use context from previous answers to inform next questions
- When you have enough info (at least destination + dates + travelers), you can start suggesting places
- When the user seems satisfied or says to create the itinerary, generate the full plan

## When generating an itinerary
When you have enough information and the user wants to see the plan, respond with a JSON block wrapped in \`\`\`json\`\`\` markers containing the itinerary. The JSON must follow this exact structure:

{
  "action": "create_itinerary",
  "trip": {
    "title": "여행 제목",
    "destination": "목적지",
    "startDate": "2025-03-01",
    "endDate": "2025-03-04",
    "travelers": "커플",
    "theme": "맛집 + 관광",
    "budget": "중간",
    "transportation": "대중교통"
  },
  "days": [
    {
      "dayIndex": 1,
      "title": "Day 1 - 도착 & 시내 탐방",
      "places": [
        {
          "timeSlot": "morning",
          "name": "장소명",
          "nameLocal": "현지어 이름 (optional)",
          "category": "관광지|맛집|카페|쇼핑|체험|숙소|이동",
          "description": "한 줄 설명",
          "address": "주소",
          "latitude": 35.6762,
          "longitude": 139.6503,
          "rating": 4.5,
          "openingHours": "09:00-18:00",
          "duration": "1시간",
          "cost": "무료"
        }
      ]
    }
  ]
}

Include 4-6 places per day across morning/lunch/afternoon/evening slots.
Always include meals (lunch, dinner at minimum).
Add realistic coordinates if you know them.

## When modifying the itinerary
If the user wants changes after seeing the itinerary:
- "너무 빡세다" → reduce places, add rest time
- "카페 추가해줘" → add a cafe to appropriate slot
- "2일차 바꿔줘" → regenerate that day
Respond with the FULL updated itinerary JSON (not just the changed parts).

## Important
- If the user hasn't provided enough info, keep conversing. Don't generate an itinerary prematurely.
- Be helpful about the destination: share tips, seasonal info, local customs.
- When mentioning search results, say things like "제가 찾아본 바로는..." or "검색해보니..."

## Knowledge Base
When you have structured knowledge about a destination, USE IT to give precise recommendations:
- Cite specific place names, hours, admission fees, tips
- Mention local food specialties with recommended restaurants
- Include transport options with costs and duration
- Reference seasonal events if relevant to travel dates
- Share insider tips from the knowledge base naturally in conversation`;

/**
 * Build system prompt with optional knowledge context injected.
 * Scans all recent messages + the current user message for city mentions.
 */
function buildSystemPrompt(userMessage: string, previousMessages: { role: string; content: string }[]): string {
  // Check user message and recent messages for city mentions
  const allText = [userMessage, ...previousMessages.slice(-6).map(m => m.content)].join(' ');
  const knowledge = buildKnowledgeContext(allText);

  if (!knowledge) return SYSTEM_PROMPT;

  return `${SYSTEM_PROMPT}\n\n---\n# 목적지 참고 정보 (Knowledge Base)\n아래 정보를 참고하여 구체적이고 정확한 추천을 해주세요.\n${knowledge}`;
}

// Zod schema for validating LLM itinerary output
const placePayloadSchema = z.object({
  timeSlot: z.enum(['morning', 'lunch', 'afternoon', 'evening']),
  name: z.string().min(1).max(200),
  nameLocal: z.string().max(200).optional(),
  category: z.string().max(50).default(''),
  description: z.string().max(500).default(''),
  address: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  rating: z.number().min(0).max(5).optional(),
  openingHours: z.string().max(100).optional(),
  duration: z.string().max(100).optional(),
  cost: z.string().max(100).optional(),
});

const itineraryPayloadSchema = z.object({
  action: z.literal('create_itinerary'),
  trip: z.object({
    title: z.string().max(200).optional(),
    destination: z.string().max(200).optional(),
    startDate: z.string().max(20).optional(),
    endDate: z.string().max(20).optional(),
    travelers: z.string().max(100).optional(),
    theme: z.string().max(200).optional(),
    budget: z.string().max(100).optional(),
    transportation: z.string().max(100).optional(),
  }),
  days: z.array(
    z.object({
      dayIndex: z.number().int().positive(),
      title: z.string().max(200),
      places: z.array(placePayloadSchema),
    })
  ),
});

type ItineraryPayload = z.infer<typeof itineraryPayloadSchema>;

export interface AgentResponse {
  message: string;
  itineraryData: ItineraryPayload | null;
}

// Limit conversation context sent to LLM to avoid token overflow
const MAX_CONTEXT_MESSAGES = 40;

export async function processChat(
  tripId: string,
  userMessage: string
): Promise<AgentResponse> {
  const env = getEnv();
  const apiKey = env.LLM_PROVIDER === 'openai'
    ? env.OPENAI_API_KEY!
    : env.ANTHROPIC_API_KEY!;

  // Get conversation history (limited)
  const messages = await db.getMessages(tripId);
  const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);

  // Build messages for API (only user/assistant, skip system)
  const apiMessages = recentMessages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  apiMessages.push({ role: 'user', content: userMessage });

  // Save user message
  await db.addMessage({
    id: nanoid(),
    tripId,
    role: 'user',
    content: userMessage,
    createdAt: new Date().toISOString(),
  });

  // Build system prompt with knowledge context
  const systemPrompt = buildSystemPrompt(userMessage, apiMessages);

  // Call LLM
  const response = await callLLM(apiMessages, apiKey, env, systemPrompt);

  // Save assistant message (save the full response including JSON for history)
  await db.addMessage({
    id: nanoid(),
    tripId,
    role: 'assistant',
    content: response.message,
    createdAt: new Date().toISOString(),
  });

  // If itinerary data was generated, save it
  if (response.itineraryData) {
    await saveItinerary(tripId, response.itineraryData);
  }

  return response;
}

export function createStreamingResponse(
  tripId: string,
  userMessage: string
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const env = getEnv();
        const apiKey = env.LLM_PROVIDER === 'openai'
          ? env.OPENAI_API_KEY!
          : env.ANTHROPIC_API_KEY!;

        const messages = await db.getMessages(tripId);
        const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);

        const apiMessages = recentMessages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

        apiMessages.push({ role: 'user', content: userMessage });

        // Save user message
        await db.addMessage({
          id: nanoid(),
          tripId,
          role: 'user',
          content: userMessage,
          createdAt: new Date().toISOString(),
        });

        // Build system prompt with knowledge context
        const systemPrompt = buildSystemPrompt(userMessage, apiMessages);

        // Stream from LLM
        let fullText = '';

        if (env.LLM_PROVIDER === 'openai') {
          fullText = await streamOpenAI(apiMessages, apiKey, env, controller, encoder, systemPrompt);
        } else {
          fullText = await streamAnthropic(apiMessages, apiKey, env, controller, encoder, systemPrompt);
        }

        // Parse for itinerary
        const itineraryData = extractItineraryJson(fullText);

        // Save assistant message
        const displayMessage = itineraryData
          ? fullText.replace(/```json[\s\S]*?```/g, '').trim() || '일정을 만들었어요! 아래에서 확인해보세요 ✈️'
          : fullText;

        await db.addMessage({
          id: nanoid(),
          tripId,
          role: 'assistant',
          content: displayMessage,
          createdAt: new Date().toISOString(),
        });

        if (itineraryData) {
          await saveItinerary(tripId, itineraryData);
          // Send itinerary ready signal
          const event = `data: ${JSON.stringify({ type: 'itinerary_ready' })}\n\n`;
          controller.enqueue(encoder.encode(event));
        }

        // Send done signal
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Streaming error:', errorMsg);
        const event = `data: ${JSON.stringify({ type: 'error', message: '응답 생성 중 오류가 발생했어요.' })}\n\n`;
        controller.enqueue(encoder.encode(event));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });
}

async function streamAnthropic(
  messages: { role: string; content: string }[],
  apiKey: string,
  env: ReturnType<typeof getEnv>,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  systemPrompt: string = SYSTEM_PROMPT
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 4096,
      stream: true,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown');
    throw new Error(`Anthropic API error: ${response.status} - ${errorBody.slice(0, 200)}`);
  }

  if (!response.body) throw new Error('No response body');

  let fullText = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') continue;

      try {
        const event = JSON.parse(data);
        if (event.type === 'content_block_delta' && event.delta?.text) {
          fullText += event.delta.text;
          const sseEvent = `data: ${JSON.stringify({ type: 'text', content: event.delta.text })}\n\n`;
          controller.enqueue(encoder.encode(sseEvent));
        }
      } catch {
        // Skip malformed events
      }
    }
  }

  return fullText;
}

async function streamOpenAI(
  messages: { role: string; content: string }[],
  apiKey: string,
  env: ReturnType<typeof getEnv>,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  systemPrompt: string = SYSTEM_PROMPT
): Promise<string> {
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      messages: allMessages,
      max_tokens: 4096,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown');
    throw new Error(`OpenAI API error: ${response.status} - ${errorBody.slice(0, 200)}`);
  }

  if (!response.body) throw new Error('No response body');

  let fullText = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') continue;

      try {
        const event = JSON.parse(data);
        const content = event.choices?.[0]?.delta?.content;
        if (content) {
          fullText += content;
          const sseEvent = `data: ${JSON.stringify({ type: 'text', content })}\n\n`;
          controller.enqueue(encoder.encode(sseEvent));
        }
      } catch {
        // Skip malformed events
      }
    }
  }

  return fullText;
}

// Non-streaming version (fallback)
async function callLLM(
  messages: { role: string; content: string }[],
  apiKey: string,
  env: ReturnType<typeof getEnv>,
  systemPrompt: string = SYSTEM_PROMPT
): Promise<AgentResponse> {
  let responseText: string;

  if (env.LLM_PROVIDER === 'openai') {
    responseText = await callOpenAI(messages, apiKey, env, systemPrompt);
  } else {
    responseText = await callAnthropic(messages, apiKey, env, systemPrompt);
  }

  const itineraryData = extractItineraryJson(responseText);

  let displayMessage = responseText;
  if (itineraryData) {
    displayMessage = responseText.replace(/```json[\s\S]*?```/g, '').trim();
    if (!displayMessage) {
      displayMessage = '일정을 만들었어요! 아래에서 확인해보세요 ✈️';
    }
  }

  return { message: displayMessage, itineraryData };
}

async function callAnthropic(
  messages: { role: string; content: string }[],
  apiKey: string,
  env: ReturnType<typeof getEnv>,
  systemPrompt: string = SYSTEM_PROMPT
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown');
    throw new Error(`LLM API error (${response.status})`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from LLM');
  return text;
}

async function callOpenAI(
  messages: { role: string; content: string }[],
  apiKey: string,
  env: ReturnType<typeof getEnv>,
  systemPrompt: string = SYSTEM_PROMPT
): Promise<string> {
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      messages: allMessages,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error (${response.status})`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from LLM');
  return text;
}

function extractItineraryJson(text: string): ItineraryPayload | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) return null;

  try {
    const raw = JSON.parse(jsonMatch[1]);
    const parsed = itineraryPayloadSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('Itinerary validation failed:', parsed.error.flatten());
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.warn('Failed to parse itinerary JSON:', err);
    return null;
  }
}

async function saveItinerary(tripId: string, data: ItineraryPayload): Promise<void> {
  await db.updateTrip(tripId, {
    title: data.trip.title || '',
    destination: data.trip.destination || '',
    startDate: data.trip.startDate || null,
    endDate: data.trip.endDate || null,
    travelers: data.trip.travelers || null,
    theme: data.trip.theme || null,
    budget: data.trip.budget || null,
    transportation: data.trip.transportation || null,
    status: 'complete',
  });

  const validTimeSlots = new Set(['morning', 'lunch', 'afternoon', 'evening']);

  const places: Place[] = [];
  for (const day of data.days) {
    for (let i = 0; i < day.places.length; i++) {
      const p = day.places[i];
      places.push({
        id: nanoid(),
        tripId,
        dayIndex: day.dayIndex,
        timeSlot: validTimeSlots.has(p.timeSlot) ? p.timeSlot as Place['timeSlot'] : 'morning',
        orderIndex: i,
        name: p.name.slice(0, 200),
        nameLocal: p.nameLocal?.slice(0, 200) || null,
        category: p.category.slice(0, 50),
        description: p.description.slice(0, 500),
        address: p.address?.slice(0, 500) || null,
        latitude: p.latitude ?? null,
        longitude: p.longitude ?? null,
        rating: p.rating != null ? Math.min(5, Math.max(0, p.rating)) : null,
        openingHours: p.openingHours?.slice(0, 100) || null,
        duration: p.duration?.slice(0, 100) || null,
        cost: p.cost?.slice(0, 100) || null,
        imageUrl: null,
        memo: null,
      });
    }
  }

  await db.setPlaces(tripId, places);
}
