import type { Table, Reservation, SearchRequest, RecommendRequest } from './types';

const BASE = 'http://localhost:8080/api';

export async function fetchAllTables(): Promise<Table[]> {
  const res = await fetch(`${BASE}/tables`);
  if (!res.ok) throw new Error('Laudade laadimine ebaõnnestus');
  return res.json();
}

export async function fetchAvailableTables(request: SearchRequest): Promise<Table[]> {
  const res = await fetch(`${BASE}/reservations/available-tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Vabade laudade otsing ebaõnnestus');
  return res.json();
}

export async function fetchRecommendedTables(request: RecommendRequest, limit = 5): Promise<Table[]> {
  const res = await fetch(`${BASE}/reservations/recommend-tables?limit=${limit}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Soovituste päring ebaõnnestus');
  return res.json();
}

export async function createReservation(reservation: Omit<Reservation, 'id' | 'tableNumber'>): Promise<Reservation> {
  const res = await fetch(`${BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservation),
  });
  if (!res.ok) throw new Error('Broneeringu loomine ebaõnnestus');
  return res.json();
}
