import type { Table, TableStatus } from '../types';

interface Props {
  tables: Table[];
  tableStatuses: Map<number, TableStatus>;
  onTableClick: (table: Table) => void;
}

const STATUS_COLOR: Record<TableStatus, string> = {
  neutral: '#b0bec5',
  available: '#4caf50',
  occupied: '#e53935',
  recommended: '#fb8c00',
};

const ZONE_LABEL: Record<string, string> = {
  TERRACE: 'Terrass',
  HALL: 'Saal',
  PRIVATE: 'Privaatne ala',
};

const ZONE_ORDER = ['TERRACE', 'HALL', 'PRIVATE'];

const FEATURE_ICONS: Record<string, string> = {
  WINDOW: 'W',
  QUIET_CORNER: 'Q',
  NEAR_PLAYGROUND: 'P',
};

const FEATURE_LABEL: Record<string, string> = {
  WINDOW: 'Aken',
  QUIET_CORNER: 'Vaikne nurk',
  NEAR_PLAYGROUND: 'Manguala lahedal',
};

export default function FloorPlan({ tables, tableStatuses, onTableClick }: Props) {
  const byZone: Record<string, Table[]> = {};
  for (const zone of ZONE_ORDER) {
    byZone[zone] = tables.filter(t => t.zone === zone).sort((a, b) => a.tableNumber - b.tableNumber);
  }

  const renderTable = (table: Table) => {
    const status = tableStatuses.get(table.id) ?? 'neutral';
    const clickable = status !== 'occupied';
    const tooltipFeatures = table.features.map(f => FEATURE_LABEL[f] ?? f).join(', ');
    const tooltip = `Laud ${table.tableNumber} | ${table.seatCount} kohta${tooltipFeatures ? ` | ${tooltipFeatures}` : ''}`;

    return (
      <div
        key={table.id}
        className={`table-square${clickable ? ' table-clickable' : ''}`}
        style={{ backgroundColor: STATUS_COLOR[status] }}
        onClick={() => clickable && onTableClick(table)}
        title={tooltip}
      >
        <span className="table-num">#{table.tableNumber}</span>
        <span className="table-seats">{table.seatCount} kohta</span>
        {table.features.length > 0 && (
          <span className="table-features">
            {table.features.map(f => FEATURE_ICONS[f] ?? f[0]).join('')}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="floor-plan">
      <div className="floor-plan-inner">
        {ZONE_ORDER.map(zone => (
          <div key={zone} className={`zone zone-${zone.toLowerCase()}`}>
            <div className="zone-label">{ZONE_LABEL[zone]}</div>
            <div className="tables-grid">
              {byZone[zone].map(renderTable)}
            </div>
          </div>
        ))}
      </div>
      <div className="legend">
        <span className="legend-item" style={{ backgroundColor: STATUS_COLOR.neutral }}>Kõik</span>
        <span className="legend-item" style={{ backgroundColor: STATUS_COLOR.available }}>Vabad</span>
        <span className="legend-item" style={{ backgroundColor: STATUS_COLOR.occupied }}>Hõivatud</span>
        <span className="legend-item" style={{ backgroundColor: STATUS_COLOR.recommended }}>Soovitatud</span>
      </div>
      <div className="feature-key">
        <strong>Tähistused:</strong> W = Window, Q = Quiet, P = Playground
      </div>
    </div>
  );
}
