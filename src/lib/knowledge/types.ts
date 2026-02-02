/**
 * Shared types for the travel knowledge base.
 * Covers all regions: Japan, Southeast Asia, Americas, Europe.
 */

// ─── Entity Types ──────────────────────────────────────

export interface CityProfile {
  id: string;
  name: string;
  nameLocal: string;
  country: string;
  region: string;
  description: string;
  character: string; // one-line vibe
  bestSeasons: Season[];
  averageStay: string; // e.g. "1~2일"
  budgetPerDay: { economy: string; mid: string; premium: string };
  areas: Area[];
  foods: FoodSpecialty[];
  events: SeasonalEvent[];
  transportLinks: TransportLink[];
  neighborCities: NeighborLink[];
  travelTips: string[];
  tags: string[];
}

export interface Area {
  name: string;
  nameLocal: string;
  description: string;
  walkable: boolean;
  timeNeeded: string;
  places: PlaceKnowledge[];
}

export interface PlaceKnowledge {
  name: string;
  nameLocal: string;
  category: PlaceCategory;
  description: string;
  mustVisit: boolean;
  hours?: string;
  closedDay?: string;
  admission?: string;
  duration: string;
  bestTime?: string;
  latitude: number;
  longitude: number;
  rating: number;
  tips?: string;
}

export interface FoodSpecialty {
  name: string;
  nameLocal: string;
  description: string;
  priceRange: string;
  mustTry: boolean;
  bestSpots: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'any';
}

export interface SeasonalEvent {
  name: string;
  nameLocal: string;
  period: string;
  description: string;
  highlight: string;
}

export interface TransportLink {
  from: string;
  method: string;
  duration: string;
  cost: string;
  tips?: string;
}

export interface NeighborLink {
  cityId: string;
  cityName: string;
  transport: string;
  duration: string;
  dayTripViable: boolean;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type PlaceCategory = '관광지' | '맛집' | '카페' | '쇼핑' | '체험' | '숙소' | '이동' | '자연' | '신사/사찰' | '비치' | '공원';
