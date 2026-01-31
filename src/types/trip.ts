export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  travelers: string | null;
  theme: string | null;
  budget: string | null;
  transportation: string | null;
  preferences: string | null;
  status: 'planning' | 'draft' | 'complete';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  tripId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface Place {
  id: string;
  tripId: string;
  dayIndex: number;
  timeSlot: 'morning' | 'lunch' | 'afternoon' | 'evening';
  orderIndex: number;
  name: string;
  nameLocal: string | null;
  category: string;
  description: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  openingHours: string | null;
  duration: string | null;
  cost: string | null;
  imageUrl: string | null;
  memo: string | null;
}

export interface Itinerary {
  trip: Trip;
  days: ItineraryDay[];
}

export interface ItineraryDay {
  dayIndex: number;
  date: string | null;
  title: string;
  places: Place[];
}

export interface ChatRequest {
  tripId: string;
  message: string;
}

export interface ChatResponse {
  message: string;
  tripUpdated: boolean;
  itineraryReady: boolean;
}
