import { useState, useEffect } from 'react';
import type { Table, TableStatus, SearchRequest, RecommendRequest } from './types';
import { fetchAllTables, fetchAvailableTables, fetchRecommendedTables, createReservation } from './api';
import FloorPlan from './components/FloorPlan';
import FilterPanel from './components/FilterPanel';
import BookingModal from './components/BookingModal';
import './App.css';

export default function App() {
  const [tables, setTables] = useState<Table[]>([]);
  const [statuses, setStatuses] = useState<Map<number, TableStatus>>(new Map());
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchAllTables()
      .then(data => {
        setTables(data);
        const map = new Map<number, TableStatus>();
        data.forEach((t: Table) => map.set(t.id, 'neutral'));
        setStatuses(map);
      })
      .catch(() => setMessage({ text: 'Backendiga uhendus ebaonnestus. Veenduge, et server töötab.', type: 'error' }));
  }, []);

  const handleSearch = async (req: SearchRequest) => {
    setLoading(true);
    setMessage(null);
    try {
      const available = await fetchAvailableTables(req);
      const availableIds = new Set(available.map(t => t.id));
      const map = new Map<number, TableStatus>();
      tables.forEach(t => map.set(t.id, availableIds.has(t.id) ? 'available' : 'occupied'));
      setStatuses(map);
      setMessage({ text: `Leitud ${available.length} vaba lauda`, type: 'info' });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Viga otsinguparingus', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async (recommendReq: RecommendRequest, availableReq: SearchRequest) => {
    setLoading(true);
    setMessage(null);
    try {
      const [available, recommended] = await Promise.all([
        fetchAvailableTables(availableReq),
        fetchRecommendedTables(recommendReq),
      ]);
      const availableIds = new Set(available.map(t => t.id));
      const recommendedIds = new Set(recommended.map(t => t.id));
      const map = new Map<number, TableStatus>();
      tables.forEach(t => {
        if (recommendedIds.has(t.id)) map.set(t.id, 'recommended');
        else if (availableIds.has(t.id)) map.set(t.id, 'available');
        else map.set(t.id, 'occupied');
      });
      setStatuses(map);
      setMessage({ text: `Soovitatud ${recommended.length} lauda (kollane)`, type: 'info' });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Viga soovituste paringus', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const map = new Map<number, TableStatus>();
    tables.forEach(t => map.set(t.id, 'neutral'));
    setStatuses(map);
    setMessage(null);
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const handleBook = async (reservation: Parameters<typeof createReservation>[0]) => {
    await createReservation(reservation);
    setSelectedTable(null);
    setMessage({ text: 'Broneering edukalt loodud!', type: 'success' });
    await handleReset();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Restorani Lauabroneering</h1>
      </header>
      <div className="app-body">
        <FilterPanel
          onSearch={handleSearch}
          onRecommend={handleRecommend}
          onReset={handleReset}
          loading={loading}
        />
        <div className="plan-area">
          {loading && <div className="loading-bar">Laadimine...</div>}
          {message && (
            <div className={`message message-${message.type}`}>{message.text}</div>
          )}
          <FloorPlan
            tables={tables}
            tableStatuses={statuses}
            onTableClick={handleTableClick}
          />
        </div>
      </div>
      {selectedTable && (
        <BookingModal
          table={selectedTable}
          onBook={handleBook}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </div>
  );
}
