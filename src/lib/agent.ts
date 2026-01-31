import { nanoid } from 'nanoid';
import { Trip, Place } from '@/types/trip';
import * as db from './db';

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
- When mentioning search results, say things like "제가 찾아본 바로는..." or "검색해보니..."`;

interface AgentResponse {
  message: string;
  itineraryData: ItineraryPayload | null;
}

interface ItineraryPayload {
  action: string;
  trip: Partial<Trip>;
  days: {
    dayIndex: number;
    title: string;
    places: {
      timeSlot: string;
      name: string;
      nameLocal?: string;
      category: string;
      description: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      rating?: number;
      openingHours?: string;
      duration?: string;
      cost?: string;
    }[];
  }[];
}

export async function processChat(
  tripId: string,
  userMessage: string,
  apiKey: string
): Promise<AgentResponse> {
  // Get conversation history
  const messages = db.getMessages(tripId);

  // Build messages for API
  const apiMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // Add new user message
  apiMessages.push({ role: 'user', content: userMessage });

  // Save user message
  db.addMessage({
    id: nanoid(),
    tripId,
    role: 'user',
    content: userMessage,
    createdAt: new Date().toISOString(),
  });

  // Call LLM
  const response = await callLLM(apiMessages, apiKey);

  // Save assistant message
  db.addMessage({
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

async function callLLM(
  messages: { role: string; content: string }[],
  apiKey: string
): Promise<AgentResponse> {
  const provider = process.env.LLM_PROVIDER || 'anthropic';

  let responseText: string;

  if (provider === 'openai') {
    responseText = await callOpenAI(messages, apiKey);
  } else {
    responseText = await callAnthropic(messages, apiKey);
  }

  // Parse response for itinerary JSON
  const itineraryData = extractItineraryJson(responseText);

  // Clean message (remove JSON block for display)
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
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callOpenAI(
  messages: { role: string; content: string }[],
  apiKey: string
): Promise<string> {
  const allMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: allMessages,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function extractItineraryJson(text: string): ItineraryPayload | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    if (parsed.action === 'create_itinerary' && parsed.days) {
      return parsed as ItineraryPayload;
    }
    return null;
  } catch {
    return null;
  }
}

async function saveItinerary(tripId: string, data: ItineraryPayload): Promise<void> {
  // Update trip info
  db.updateTrip(tripId, {
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

  // Save places
  const places: Place[] = [];
  for (const day of data.days) {
    for (let i = 0; i < day.places.length; i++) {
      const p = day.places[i];
      places.push({
        id: nanoid(),
        tripId,
        dayIndex: day.dayIndex,
        timeSlot: p.timeSlot as Place['timeSlot'],
        orderIndex: i,
        name: p.name,
        nameLocal: p.nameLocal || null,
        category: p.category || '',
        description: p.description || '',
        address: p.address || null,
        latitude: p.latitude || null,
        longitude: p.longitude || null,
        rating: p.rating || null,
        openingHours: p.openingHours || null,
        duration: p.duration || null,
        cost: p.cost || null,
        imageUrl: null,
        memo: null,
      });
    }
  }

  db.setPlaces(tripId, places);
}
