import { nanoid } from 'nanoid';
import { Place } from '@/types/trip';
import { getEnv } from './env';
import * as db from './db';
import { z } from 'zod';
import { buildKnowledgeContext } from './knowledge/japan-cities';

function buildBasePrompt(): string {
  const today = new Date().toISOString().split('T')[0];
  return `You are TripTalk, a friendly Korean-speaking travel planning AI agent. You help users plan their trips through natural conversation.

## Current Date
Today is ${today}. Use this to interpret relative dates like "설날", "이번 겨울", "다음 주" etc. Always plan for upcoming dates, not past ones.

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

## CRITICAL: Preserve User Input Exactly
You MUST treat user-provided information as immutable facts. NEVER alter, reinterpret, or override:
- **Dates**: If the user says "2/5~2/7", the itinerary MUST be 2/5~2/7. Do NOT shift, extend, or change dates.
- **Day-specific requests**: If the user says "토요일에 A, 일요일에 B", then A MUST be on Saturday and B MUST be on Sunday. NEVER swap them.
- **Number of travelers**: Use exact numbers given.
- **Budget/preferences**: Reflect them as stated.
Before generating the itinerary JSON, mentally verify: "Did I keep every date, day assignment, and preference exactly as the user stated?"

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
          "description": "처음 방문하는 사람을 위한 상세 설명 (3~5문장). 이 장소가 어떤 곳인지, 대표 메뉴/볼거리, 가격대, 이용 방법(주문 방식, 테이크아웃 여부 등), 분위기, 알아두면 좋은 팁 등을 포함. 체인점이면 간단히 설명하고, 독립 매장이면 특색을 살려서 작성.",
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

## Description Writing Guidelines
Each place's description should be written for a first-time visitor (3~5 sentences, 150~300자).
Include as many of these as relevant:
- What kind of place it is and what makes it special
- Signature menu items / main attractions with approximate prices
- How to order or use the place (e.g. ticket machine, counter ordering, reservation needed)
- Atmosphere and vibe (cozy, lively, scenic view, etc.)
- Practical tips (best time to visit, what to watch out for, nearby landmarks)
Do NOT write generic one-liners. Write as if explaining to a friend who has never been there.

## When modifying the itinerary
이미 일정이 있을 때 사용자가 수정을 요청하면, create_itinerary 대신 modify_itinerary 액션을 사용하세요.
현재 일정의 장소 id를 참조하여 변경 부분만 출력하세요.

\`\`\`json
{
  "action": "modify_itinerary",
  "operations": [
    { "type": "add_place", "dayIndex": 2, "afterPlaceId": "abc123", "place": { ...place fields... } },
    { "type": "remove_place", "placeId": "xyz789" },
    { "type": "update_place", "placeId": "abc123", "updates": { "name": "새 이름", "description": "새 설명" } },
    { "type": "replace_day", "dayIndex": 3, "title": "Day 3 - 새 제목", "places": [ ...full places array... ] }
  ]
}
\`\`\`

규칙:
- 장소 추가: add_place (afterPlaceId가 null이면 해당 일차 맨 앞에 추가)
- 장소 삭제: remove_place (placeId로 지정)
- 장소 수정: update_place (변경할 필드만 포함)
- 일차 전체 교체: replace_day (해당 일차를 통째로 교체, "2일차 다시 짜줘" 등)
- 수정하지 않는 장소는 건드리지 마세요
- 일정이 없을 때만 create_itinerary를 사용하세요

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
}

/**
 * Build system prompt with optional knowledge context injected.
 * Scans all recent messages + the current user message for city mentions.
 */
function buildSystemPrompt(
  userMessage: string,
  previousMessages: { role: string; content: string }[],
  existingPlaces?: Place[]
): string {
  const basePrompt = buildBasePrompt();
  // Check user message and recent messages for city mentions
  const allText = [userMessage, ...previousMessages.slice(-6).map(m => m.content)].join(' ');
  const knowledge = buildKnowledgeContext(allText);

  let prompt = basePrompt;

  if (knowledge) {
    prompt += `\n\n---\n# 목적지 참고 정보 (Knowledge Base)\n아래 정보를 참고하여 구체적이고 정확한 추천을 해주세요.\n${knowledge}`;
  }

  // Inject current itinerary for modification context
  if (existingPlaces && existingPlaces.length > 0) {
    const dayMap = new Map<number, { id: string; dayIndex: number; timeSlot: string; orderIndex: number; name: string; category: string }[]>();
    for (const p of existingPlaces) {
      const arr = dayMap.get(p.dayIndex) || [];
      arr.push({ id: p.id, dayIndex: p.dayIndex, timeSlot: p.timeSlot, orderIndex: p.orderIndex, name: p.name, category: p.category });
      dayMap.set(p.dayIndex, arr);
    }
    const days = Array.from(dayMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([dayIndex, places]) => ({ dayIndex, places }));

    prompt += `\n\n---\n## 현재 일정 (Current Itinerary)\n아래는 사용자의 현재 일정입니다. 수정 요청 시 이 일정의 id를 참조하세요.\n\`\`\`json\n${JSON.stringify({ days }, null, 2)}\n\`\`\``;
  }

  return prompt;
}

// Zod schema for validating LLM itinerary output
const placePayloadSchema = z.object({
  timeSlot: z.enum(['morning', 'lunch', 'afternoon', 'evening']),
  name: z.string().min(1).max(200),
  nameLocal: z.string().max(200).optional(),
  category: z.string().max(50).default(''),
  description: z.string().max(1000).default(''),
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

const modifyOperationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('add_place'),
    dayIndex: z.number().int().positive(),
    afterPlaceId: z.string().nullable().optional(),
    place: placePayloadSchema,
  }),
  z.object({
    type: z.literal('remove_place'),
    placeId: z.string(),
  }),
  z.object({
    type: z.literal('update_place'),
    placeId: z.string(),
    updates: placePayloadSchema.partial(),
  }),
  z.object({
    type: z.literal('replace_day'),
    dayIndex: z.number().int().positive(),
    title: z.string().max(200).optional(),
    places: z.array(placePayloadSchema),
  }),
]);

const modifyItinerarySchema = z.object({
  action: z.literal('modify_itinerary'),
  operations: z.array(modifyOperationSchema).min(1),
});

type ModifyItineraryPayload = z.infer<typeof modifyItinerarySchema>;
type ActionPayload = ItineraryPayload | ModifyItineraryPayload;

export interface AgentResponse {
  message: string;
  itineraryData: ItineraryPayload | null;
  modifyData: ModifyItineraryPayload | null;
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

  // Fetch existing places for modification context
  const existingPlaces = await db.getPlaces(tripId);

  // Build system prompt with knowledge context and existing itinerary
  const systemPrompt = buildSystemPrompt(userMessage, apiMessages, existingPlaces);

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
  } else if (response.modifyData) {
    await applyModifications(tripId, response.modifyData);
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

        // Fetch existing places for modification context
        const existingPlaces = await db.getPlaces(tripId);

        // Build system prompt with knowledge context and existing itinerary
        const systemPrompt = buildSystemPrompt(userMessage, apiMessages, existingPlaces);

        // Stream from LLM
        let fullText = '';

        if (env.LLM_PROVIDER === 'openai') {
          fullText = await streamOpenAI(apiMessages, apiKey, env, controller, encoder, systemPrompt);
        } else {
          fullText = await streamAnthropic(apiMessages, apiKey, env, controller, encoder, systemPrompt);
        }

        // Parse for itinerary action
        const actionData = extractActionJson(fullText);

        // Save assistant message
        const displayMessage = actionData
          ? fullText.replace(/```json[\s\S]*?```/g, '').trim() || '일정을 만들었어요! 아래에서 확인해보세요 ✈️'
          : fullText;

        await db.addMessage({
          id: nanoid(),
          tripId,
          role: 'assistant',
          content: displayMessage,
          createdAt: new Date().toISOString(),
        });

        if (actionData) {
          if (actionData.action === 'create_itinerary') {
            await saveItinerary(tripId, actionData);
          } else {
            await applyModifications(tripId, actionData);
          }
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
  systemPrompt: string = buildBasePrompt()
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
      max_tokens: 8192,
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
  systemPrompt: string = buildBasePrompt()
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
      max_tokens: 8192,
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
  systemPrompt: string = buildBasePrompt()
): Promise<AgentResponse> {
  let responseText: string;

  if (env.LLM_PROVIDER === 'openai') {
    responseText = await callOpenAI(messages, apiKey, env, systemPrompt);
  } else {
    responseText = await callAnthropic(messages, apiKey, env, systemPrompt);
  }

  const actionData = extractActionJson(responseText);

  let displayMessage = responseText;
  let itineraryData: ItineraryPayload | null = null;
  let modifyData: ModifyItineraryPayload | null = null;

  if (actionData) {
    displayMessage = responseText.replace(/```json[\s\S]*?```/g, '').trim();
    if (!displayMessage) {
      displayMessage = '일정을 만들었어요! 아래에서 확인해보세요 ✈️';
    }
    if (actionData.action === 'create_itinerary') {
      itineraryData = actionData;
    } else {
      modifyData = actionData;
    }
  }

  return { message: displayMessage, itineraryData, modifyData };
}

async function callAnthropic(
  messages: { role: string; content: string }[],
  apiKey: string,
  env: ReturnType<typeof getEnv>,
  systemPrompt: string = buildBasePrompt()
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
      max_tokens: 8192,
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
  systemPrompt: string = buildBasePrompt()
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
      max_tokens: 8192,
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

function extractActionJson(text: string): ActionPayload | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) return null;

  try {
    const raw = JSON.parse(jsonMatch[1]);

    if (raw?.action === 'modify_itinerary') {
      const parsed = modifyItinerarySchema.safeParse(raw);
      if (!parsed.success) {
        console.warn('Modify itinerary validation failed:', parsed.error.flatten());
        return null;
      }
      return parsed.data;
    }

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
        description: p.description.slice(0, 1000),
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

async function applyModifications(tripId: string, data: ModifyItineraryPayload): Promise<void> {
  const validTimeSlots = new Set(['morning', 'lunch', 'afternoon', 'evening']);

  for (const op of data.operations) {
    switch (op.type) {
      case 'add_place': {
        const existingPlaces = await db.getPlaces(tripId);
        const dayPlaces = existingPlaces
          .filter(p => p.dayIndex === op.dayIndex)
          .sort((a, b) => a.orderIndex - b.orderIndex);

        let insertIndex = 0;
        if (op.afterPlaceId) {
          const afterIdx = dayPlaces.findIndex(p => p.id === op.afterPlaceId);
          insertIndex = afterIdx >= 0 ? afterIdx + 1 : dayPlaces.length;
        }

        // Shift orderIndex for places after the insertion point
        for (let i = insertIndex; i < dayPlaces.length; i++) {
          await db.updatePlace(dayPlaces[i].id, { orderIndex: dayPlaces[i].orderIndex + 1 });
        }

        const p = op.place;
        await db.addPlace({
          id: nanoid(),
          tripId,
          dayIndex: op.dayIndex,
          timeSlot: validTimeSlots.has(p.timeSlot) ? p.timeSlot as Place['timeSlot'] : 'morning',
          orderIndex: insertIndex,
          name: p.name.slice(0, 200),
          nameLocal: p.nameLocal?.slice(0, 200) || null,
          category: p.category.slice(0, 50),
          description: p.description.slice(0, 1000),
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
        break;
      }

      case 'remove_place': {
        const allPlaces = await db.getPlaces(tripId);
        const target = allPlaces.find(p => p.id === op.placeId);
        if (target) {
          await db.deletePlace(op.placeId, tripId);
          await db.reindexDay(tripId, target.dayIndex);
        }
        break;
      }

      case 'update_place': {
        const updates: Partial<Place> = {};
        const u = op.updates;
        if (u.timeSlot !== undefined) updates.timeSlot = validTimeSlots.has(u.timeSlot) ? u.timeSlot as Place['timeSlot'] : undefined;
        if (u.name !== undefined) updates.name = u.name.slice(0, 200);
        if (u.nameLocal !== undefined) updates.nameLocal = u.nameLocal?.slice(0, 200) || null;
        if (u.category !== undefined) updates.category = u.category.slice(0, 50);
        if (u.description !== undefined) updates.description = u.description.slice(0, 1000);
        if (u.address !== undefined) updates.address = u.address?.slice(0, 500) || null;
        if (u.latitude !== undefined) updates.latitude = u.latitude ?? null;
        if (u.longitude !== undefined) updates.longitude = u.longitude ?? null;
        if (u.rating !== undefined) updates.rating = u.rating != null ? Math.min(5, Math.max(0, u.rating)) : null;
        if (u.openingHours !== undefined) updates.openingHours = u.openingHours?.slice(0, 100) || null;
        if (u.duration !== undefined) updates.duration = u.duration?.slice(0, 100) || null;
        if (u.cost !== undefined) updates.cost = u.cost?.slice(0, 100) || null;
        await db.updatePlace(op.placeId, updates);
        break;
      }

      case 'replace_day': {
        await db.deletePlacesByDay(tripId, op.dayIndex);
        const places: Place[] = op.places.map((p, i) => ({
          id: nanoid(),
          tripId,
          dayIndex: op.dayIndex,
          timeSlot: validTimeSlots.has(p.timeSlot) ? p.timeSlot as Place['timeSlot'] : 'morning',
          orderIndex: i,
          name: p.name.slice(0, 200),
          nameLocal: p.nameLocal?.slice(0, 200) || null,
          category: p.category.slice(0, 50),
          description: p.description.slice(0, 1000),
          address: p.address?.slice(0, 500) || null,
          latitude: p.latitude ?? null,
          longitude: p.longitude ?? null,
          rating: p.rating != null ? Math.min(5, Math.max(0, p.rating)) : null,
          openingHours: p.openingHours?.slice(0, 100) || null,
          duration: p.duration?.slice(0, 100) || null,
          cost: p.cost?.slice(0, 100) || null,
          imageUrl: null,
          memo: null,
        }));
        for (const place of places) {
          await db.addPlace(place);
        }
        break;
      }
    }
  }
}
