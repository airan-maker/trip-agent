/**
 * Unified Knowledge Base entry point.
 * Aggregates city data from all regions and provides search/context functions.
 */

export type { CityProfile, Area, PlaceKnowledge, FoodSpecialty, SeasonalEvent, TransportLink, NeighborLink, Season, PlaceCategory } from './types';

import { CityProfile } from './types';
import { JAPAN_CITIES } from './japan-cities';
import { SEA_CITIES } from './sea-cities';
import { US_CITIES } from './us-cities';
import { EUROPE_CITIES } from './europe-cities';

// ─── Aggregated Data ──────────────────────────────────────

export const ALL_CITIES: CityProfile[] = [
  ...JAPAN_CITIES,
  ...SEA_CITIES,
  ...US_CITIES,
  ...EUROPE_CITIES,
];

export { JAPAN_CITIES } from './japan-cities';
export { SEA_CITIES } from './sea-cities';
export { US_CITIES } from './us-cities';
export { EUROPE_CITIES } from './europe-cities';

// ─── Helper Functions ──────────────────────────────────────

export function findCity(query: string): CityProfile | undefined {
  const q = query.toLowerCase();
  return ALL_CITIES.find(
    (c) =>
      c.name.includes(query) ||
      c.nameLocal.includes(query) ||
      c.id.includes(q) ||
      c.country.includes(query) ||
      c.tags.some((t) => t.includes(query))
  );
}

export function findCitiesByTag(tag: string): CityProfile[] {
  return ALL_CITIES.filter((c) => c.tags.some((t) => t.includes(tag)));
}

export function getCityContext(cityId: string): string {
  const city = ALL_CITIES.find((c) => c.id === cityId);
  if (!city) return '';

  const lines: string[] = [
    `\n## ${city.name} (${city.nameLocal}) 정보`,
    `📍 ${city.country} | ${city.region}`,
    `💬 ${city.character}`,
    `📅 추천 체류: ${city.averageStay} | 💰 예산: ${city.budgetPerDay.mid} (중간)`,
    '',
    `### 에리어`,
  ];

  for (const area of city.areas) {
    lines.push(`**${area.name}** (${area.nameLocal}) - ${area.description} [소요: ${area.timeNeeded}]`);
    for (const place of area.places) {
      const must = place.mustVisit ? '⭐' : '';
      lines.push(`  - ${must}${place.name} (${place.nameLocal}): ${place.description} [${place.duration}${place.admission ? ', ' + place.admission : ''}]`);
      if (place.tips) lines.push(`    💡 ${place.tips}`);
    }
  }

  lines.push('', '### 맛집/음식');
  for (const food of city.foods) {
    const must = food.mustTry ? '⭐' : '';
    lines.push(`  - ${must}${food.name} (${food.nameLocal}): ${food.description} [${food.priceRange}]`);
    lines.push(`    추천: ${food.bestSpots.join(', ')}`);
  }

  if (city.transportLinks.length > 0) {
    lines.push('', '### 교통');
    for (const tl of city.transportLinks) {
      lines.push(`  ${tl.from}→: ${tl.method} ${tl.duration} (${tl.cost})`);
    }
  }

  if (city.neighborCities.length > 0) {
    lines.push('', '### 근처 도시');
    for (const nc of city.neighborCities) {
      lines.push(`  - ${nc.cityName}: ${nc.transport} ${nc.duration}${nc.dayTripViable ? ' (당일치기 가능)' : ''}`);
    }
  }

  if (city.events.length > 0) {
    lines.push('', '### 시즌 이벤트');
    for (const ev of city.events) {
      lines.push(`  - ${ev.name} (${ev.period}): ${ev.highlight}`);
    }
  }

  lines.push('', '### 여행 팁');
  for (const tip of city.travelTips) {
    lines.push(`  - ${tip}`);
  }

  return lines.join('\n');
}

export function buildKnowledgeContext(userMessage: string): string {
  const matchedCities: CityProfile[] = [];

  for (const city of ALL_CITIES) {
    const terms = [city.name, city.nameLocal, city.id, city.country];
    if (terms.some((t) => userMessage.toLowerCase().includes(t.toLowerCase()))) {
      matchedCities.push(city);
    }
  }

  // Region-level keywords
  const regionKeywords: { keywords: string[]; cities: CityProfile[] }[] = [
    { keywords: ['일본', 'japan', '소도시', '규슈', '간사이', '홋카이도', '호쿠리쿠'], cities: JAPAN_CITIES },
    { keywords: ['동남아', 'southeast asia', '태국', '베트남', '인도네시아'], cities: SEA_CITIES },
    { keywords: ['미국', 'america', 'usa', '미주', '하와이'], cities: US_CITIES },
    { keywords: ['유럽', 'europe', '프랑스', '영국', '스페인'], cities: EUROPE_CITIES },
  ];

  if (matchedCities.length === 0) {
    const lowerMsg = userMessage.toLowerCase();
    for (const rg of regionKeywords) {
      if (rg.keywords.some((k) => lowerMsg.includes(k))) {
        // Provide overview of matching region
        const seasonLabel = (s: string) => ({ spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' }[s] || s);
        return `\n## 추천 도시 목록\n${rg.cities.map(
          (c) => `- **${c.name}** (${c.nameLocal}): ${c.character} [추천 시즌: ${c.bestSeasons.map(seasonLabel).join('·')}]`
        ).join('\n')}`;
      }
    }
  }

  if (matchedCities.length > 0) {
    return matchedCities.map((c) => getCityContext(c.id)).join('\n\n---\n\n');
  }

  return '';
}
