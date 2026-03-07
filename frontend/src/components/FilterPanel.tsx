import { useState } from 'react';
import type { SearchRequest, RecommendRequest } from '../types';

interface Props {
  onSearch: (req: SearchRequest) => void;
  onRecommend: (recommendReq: RecommendRequest, availableReq: SearchRequest) => void;
  onReset: () => void;
  loading: boolean;
}

const FEATURES = [
  { value: 'WINDOW', label: 'Akna all' },
  { value: 'QUIET_CORNER', label: 'Vaikne nurk / privaatsus' },
  { value: 'NEAR_PLAYGROUND', label: 'Manguala lahedal' },
];

const ZONES = [
  { value: '', label: 'Kõik tsoonid' },
  { value: 'HALL', label: 'Saal' },
  { value: 'TERRACE', label: 'Terrass' },
  { value: 'PRIVATE', label: 'Privaatne ala' },
];

export default function FilterPanel({ onSearch, onRecommend, onReset, loading }: Props) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [partySize, setPartySize] = useState('');
  const [zone, setZone] = useState('');
  const [required, setRequired] = useState<string[]>([]);
  const [preferred, setPreferred] = useState<string[]>([]);

  const toggle = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter(f => f !== value) : [...list, value]);
  };

  const buildSearchReq = (): SearchRequest => ({
    reservationDate: date || undefined,
    startTime: startTime || undefined,
    endTime: endTime || undefined,
    minPartySize: partySize ? parseInt(partySize) : undefined,
    zone: zone || undefined,
    requiredFeatures: required.length ? required : undefined,
    preferredFeatures: preferred.length ? preferred : undefined,
  });

  const buildRecommendReq = (): RecommendRequest => ({
    reservationDate: date || undefined,
    startTime: startTime || undefined,
    endTime: endTime || undefined,
    partySize: partySize ? parseInt(partySize) : undefined,
    preferredZone: zone || undefined,
    requiredFeatures: required.length ? required : undefined,
    preferredFeatures: preferred.length ? preferred : undefined,
  });

  const handleSearch = () => onSearch(buildSearchReq());

  const handleRecommend = () => {
    onRecommend(buildRecommendReq(), buildSearchReq());
  };

  const handleReset = () => {
    setDate('');
    setStartTime('');
    setEndTime('');
    setPartySize('');
    setZone('');
    setRequired([]);
    setPreferred([]);
    onReset();
  };

  return (
    <div className="filter-panel">
      <h2>Otsingufiltrid</h2>

      <label className="field-label">
        Kuupäev
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </label>

      <label className="field-label">
        Algusaeg
        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
      </label>

      <label className="field-label">
        Lõpuaeg
        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
      </label>

      <label className="field-label">
        Inimeste arv
        <input
          type="number"
          min="1"
          max="10"
          placeholder="nt 4"
          value={partySize}
          onChange={e => setPartySize(e.target.value)}
        />
      </label>

      <h2>Lisa täpsustusi:</h2>
        <label className="field-label">
        Tsoon
        <select value={zone} onChange={e => setZone(e.target.value)}>
          {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
        </select>
      </label>

      <div className="feature-group">
        <p className="feature-title">Asukoht:</p>
        {FEATURES.map(f => (
          <label key={f.value} className="check-label">
            <input
              type="checkbox"
              checked={required.includes(f.value)}
              onChange={() => toggle(f.value, required, setRequired)}
            />
            {f.label}
          </label>
        ))}
      </div>

      <div className="filter-buttons">
        <button className="btn-search" onClick={handleSearch} disabled={loading}>
          Otsi vabu laudu
        </button>
        <button className="btn-recommend" onClick={handleRecommend} disabled={loading}>
          Soovita parim laud
        </button>
        <button className="btn-reset" onClick={handleReset} disabled={loading}>
          Eemalda filtrid
        </button>
      </div>
    </div>
  );
}
