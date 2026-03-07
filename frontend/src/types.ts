export interface Table {
  id: number;
  tableNumber: number;
  seatCount: number;
  zone: string;
  features: string[];
}

export interface Reservation {
  id: number;
  tableId: number;
  tableNumber: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  partySize: number;
  customerName: string;
  customerPhone: string;
}

export type TableStatus = 'neutral' | 'available' | 'occupied' | 'recommended';

export interface SearchRequest {
  reservationDate?: string;
  startTime?: string;
  endTime?: string;
  minPartySize?: number;
  maxPartySize?: number;
  zone?: string;
  requiredFeatures?: string[];
  preferredFeatures?: string[];
}

export interface RecommendRequest {
  reservationDate?: string;
  startTime?: string;
  endTime?: string;
  partySize?: number;
  preferredZone?: string;
  requiredFeatures?: string[];
  preferredFeatures?: string[];
  allowOversize?: boolean;
}
