import { useState } from 'react';
import type { Table } from '../types';

interface Props {
  table: Table;
  onBook: (reservation: {
    tableId: number;
    reservationDate: string;
    startTime: string;
    endTime: string;
    partySize: number;
    customerName: string;
    customerPhone: string;
  }) => Promise<void>;
  onClose: () => void;
}

const ZONE_LABEL: Record<string, string> = {
  HALL: 'Saal',
  TERRACE: 'Terrass',
  PRIVATE: 'Privaatne ala',
};

const FEATURE_LABEL: Record<string, string> = {
  WINDOW: 'Akna all',
  QUIET_CORNER: 'Vaikne nurk',
  NEAR_PLAYGROUND: 'Manguala lahedal',
};

export default function BookingModal({ table, onBook, onClose }: Props) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [partySize, setPartySize] = useState('1');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(partySize) > table.seatCount) {
      setError(`Laua mahtuvus on ${table.seatCount} inimest`);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onBook({
        tableId: table.id,
        reservationDate: date,
        startTime,
        endTime,
        partySize: parseInt(partySize),
        customerName: name,
        customerPhone: phone,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Viga broneeringu loomisel');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Broneeri laud {table.tableNumber}</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>

        <div className="table-info">
          <span>{table.seatCount} kohta</span>
          <span>{ZONE_LABEL[table.zone] ?? table.zone}</span>
          {table.features.length > 0 && (
            <span>{table.features.map(f => FEATURE_LABEL[f] ?? f).join(', ')}</span>
          )}
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="field-label">
            Kuupaev
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} />
          </label>
          <label className="field-label">
            Algusaeg
            <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} />
          </label>
          <label className="field-label">
            Lopuaeg
            <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} />
          </label>
          <label className="field-label">
            Inimeste arv (max {table.seatCount})
            <input
              type="number"
              min="1"
              max={table.seatCount}
              required
              value={partySize}
              onChange={e => setPartySize(e.target.value)}
            />
          </label>
          <label className="field-label">
            Kliendi nimi
            <input type="text" required value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label className="field-label">
            Telefon
            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} />
          </label>

          <div className="modal-buttons">
            <button type="submit" className="btn-book" disabled={submitting}>
              {submitting ? 'Salvestamine...' : 'Broneeri'}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Tuhista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
