import React, { useState, useMemo } from 'react';
import { Layers, Eye, Trees, Utensils, Crown } from 'lucide-react';

export const TABLE_METADATA = {
  1: {
    zone: 'window',
    zoneName: 'Window Alcove',
    shape: 'circle',
    image: '/images/zone_window.jpg',
    perks: ['Skyline Panoramic View', 'Candlelit Romance', 'Intimate Seating'],
    ambience: 'Floor-to-ceiling glass overlooking the evening city skyline.',
    minGuests: 1,
    maxGuests: 2,
    badge: 'Skyline View',
    pos: { top: '18%', left: '16%' },
  },
  2: {
    zone: 'window',
    zoneName: 'Window Alcove',
    shape: 'circle',
    image: '/images/zone_window.jpg',
    perks: ['Garden Window View', 'Acoustic Privacy', 'Sommelier Pairing'],
    ambience: 'Quiet corner overlooking the illuminated botanical courtyard.',
    minGuests: 1,
    maxGuests: 2,
    badge: 'Garden View',
    pos: { top: '18%', left: '38%' },
  },
  3: {
    zone: 'terrace',
    zoneName: 'Terrace Garden',
    shape: 'circle',
    image: '/images/zone_terrace.jpg',
    perks: ['Alfresco Dining', 'Heated Pergola', 'Starlight Ambiance'],
    ambience: 'Open-air teakwood veranda with jasmine fragrance & soft breeze.',
    minGuests: 1,
    maxGuests: 2,
    badge: 'Alfresco',
    pos: { top: '20%', left: '72%' },
  },
  4: {
    zone: 'terrace',
    zoneName: 'Terrace Garden',
    shape: 'rect',
    image: '/images/zone_terrace.jpg',
    perks: ['Lush Patio Lounge', 'Outdoor Fire Pit', 'Social Dining'],
    ambience: 'Spacious outdoor banquette next to ambient flame torches.',
    minGuests: 2,
    maxGuests: 4,
    badge: 'Fire Pit Patio',
    pos: { top: '56%', left: '72%' },
  },
  5: {
    zone: 'main',
    zoneName: 'Main Dining Hall',
    shape: 'rect',
    image: '/images/zone_main.jpg',
    perks: ['Center Chandelier Glow', 'Velvet Banquette', 'Vibrant Energy'],
    ambience: 'Heart of the dining room under crystal cascading chandeliers.',
    minGuests: 2,
    maxGuests: 4,
    badge: 'Chandelier Center',
    pos: { top: '48%', left: '18%' },
  },
  6: {
    zone: 'main',
    zoneName: 'Main Dining Hall',
    shape: 'rect',
    image: '/images/zone_main.jpg',
    perks: ['Wine Vault Showcase', 'Plush Booth', 'Fine Linen Service'],
    ambience: 'Adjacent to our rare vintage wine cellar showcase.',
    minGuests: 2,
    maxGuests: 4,
    badge: 'Wine Vault',
    pos: { top: '48%', left: '42%' },
  },
  7: {
    zone: 'main',
    zoneName: 'Main Dining Hall',
    shape: 'rect',
    image: '/images/zone_main.jpg',
    perks: ['Grand Alcove Seating', 'Executive Comfort', 'Cocktail Cart Access'],
    ambience: 'Spacious four-top designed for leisurely multi-course dining.',
    minGuests: 2,
    maxGuests: 4,
    badge: 'Grand Alcove',
    pos: { top: '78%', left: '22%' },
  },
  8: {
    zone: 'main',
    zoneName: 'Main Dining Hall',
    shape: 'rect-large',
    image: '/images/zone_main.jpg',
    perks: ['Celebration Banquet', 'Center Stage', 'Chef Welcome Toast'],
    ambience: 'Magnificent banquet table designed for group celebrations.',
    minGuests: 4,
    maxGuests: 6,
    badge: 'Celebration Feast',
    pos: { top: '78%', left: '46%' },
  },
  9: {
    zone: 'vip',
    zoneName: "Chef's VIP Salon",
    shape: 'rect-large',
    image: '/images/zone_chef.jpg',
    perks: ['Direct Open Kitchen View', 'Omakase Pass Access', 'Private Sommelier'],
    ambience: 'Front-row view of the brigade of chefs creating culinary art.',
    minGuests: 4,
    maxGuests: 6,
    badge: "Chef's Pass",
    pos: { top: '80%', left: '76%' },
  },
  10: {
    zone: 'vip',
    zoneName: 'Royal Presidential Suite',
    shape: 'oval',
    image: '/images/zone_chef.jpg',
    perks: ['Dedicated Butler & Captain', 'Acoustic Partition', 'Bespoke Wine Flight'],
    ambience: 'The pinnacle of private dining luxury for distinguished guests.',
    minGuests: 6,
    maxGuests: 8,
    badge: 'Presidential Suite',
    pos: { top: '24%', left: '88%' },
  },
};

const ZONES = [
  { id: 'all', name: 'All Zones', icon: Layers },
  { id: 'window', name: 'Window Alcove', icon: Eye },
  { id: 'terrace', name: 'Terrace Garden', icon: Trees },
  { id: 'main', name: 'Main Dining', icon: Utensils },
  { id: 'vip', name: "Chef's VIP", icon: Crown },
];

export default function InteractiveFloorPlan({
  tables = [],
  selectedTable,
  onSelectTable,
  isLoading,
  selectedDate,
  selectedTimeSlot,
}) {
  const [viewMode, setViewMode] = useState('blueprint'); // 'blueprint' | 'grid'
  const [activeZone, setActiveZone] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [hoveredTable, setHoveredTable] = useState(null);

  // Filtered tables based on zone and capacity
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const num = table.tableNumber || table.number || 1;
      const meta = TABLE_METADATA[num] || { zone: 'main' };
      const cap = Number(table.capacity) || 2;

      // Zone filter
      if (activeZone !== 'all' && meta.zone !== activeZone) {
        return false;
      }

      // Capacity filter
      if (capacityFilter === '2' && cap !== 2) return false;
      if (capacityFilter === '4' && cap !== 4) return false;
      if (capacityFilter === '6+' && cap < 6) return false;

      return true;
    });
  }, [tables, activeZone, capacityFilter]);

  // Counts
  const availableCount = useMemo(() => {
    return tables.filter((t) => t.isFree).length;
  }, [tables]);

  const handleResetFilters = () => {
    setActiveZone('all');
    setCapacityFilter('all');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden transition-all">
      {/* Top Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight font-heading text-slate-900">
              Interactive Seating Plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Seating for</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{selectedDate}</span>
              <span>at</span>
              <span className="font-bold text-district bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">{selectedTimeSlot}</span>
            </p>
          </div>

          {/* View Mode Toggle & Status Count */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-xs font-bold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{availableCount} of {tables.length} Tables Open</span>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setViewMode('blueprint')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  viewMode === 'blueprint'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                Floor Map
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                Grid View
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Row: Zone tabs + Capacity selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
          {/* Zone Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {ZONES.map((zone) => {
              const isActive = activeZone === zone.id;
              const Icon = zone.icon;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setActiveZone(zone.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-district text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 opacity-80" />}
                  <span>{zone.name}</span>
                </button>
              );
            })}
          </div>

          {/* Capacity Filter Chips */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCapacityFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                capacityFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              All Seats
            </button>
            <button
              type="button"
              onClick={() => setCapacityFilter('2')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                capacityFilter === '2'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              2 Guests
            </button>
            <button
              type="button"
              onClick={() => setCapacityFilter('4')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                capacityFilter === '4'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              4 Guests
            </button>
            <button
              type="button"
              onClick={() => setCapacityFilter('6+')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                capacityFilter === '6+'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              6+ Guests
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 text-xs font-semibold pt-4 mt-3 text-slate-600 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-md bg-emerald-500 shadow-xs"></span>
            <span>Available Table</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-md bg-district ring-2 ring-orange-300 shadow-xs animate-pulse"></span>
            <span className="text-district font-bold">Your Selected Table</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-md bg-slate-300 opacity-60"></span>
            <span className="text-slate-400">Reserved / Unavailable</span>
          </div>
        </div>
      </div>

      {/* Main Content: Map or Grid */}
      <div className="p-4 sm:p-6 bg-stone-50/50">
        {filteredTables.length === 0 ? (
          <div className="py-16 px-4 rounded-2xl border-2 border-dashed border-stone-200 text-center bg-white my-4">
            <h3 className="text-base font-bold text-stone-900 font-heading">
              No tables found in this section
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              No dining tables match your active combination of zone and capacity filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-district hover:bg-orange-600 transition-all shadow-sm"
            >
              Reset Seating Filters
            </button>
          </div>
        ) : viewMode === 'blueprint' ? (
          /* =============================================================== */
          /* ARCHITECTURAL BLUEPRINT MAP VIEW                                */
          /* =============================================================== */
          <div className="relative w-full rounded-2xl overflow-hidden border border-stone-800/80 shadow-2xl floor-blueprint min-h-[520px] sm:min-h-[580px] p-4 select-none">
            {/* Architectural Demarcation Labels */}
            {/* 1. Window Alcove Zone (Top Left & Center) */}
            <div className="absolute top-2 left-4 right-1/3 flex items-center justify-between border-b border-sky-400/20 pb-1.5 px-2">
              <div className="text-[11px] font-mono tracking-wider uppercase text-sky-300/80 font-bold">
                • PANORAMA SKYLINE WINDOWS (DOUBLE-HEIGHT GLASS)
              </div>
              <span className="text-[10px] text-sky-400/50 font-mono">NORTH FACING</span>
            </div>

            {/* 2. Terrace Garden Zone (Top Right) */}
            <div className="absolute top-2 right-4 w-72 sm:w-80 border-b border-emerald-400/20 pb-1.5 px-2 text-right">
              <div className="text-[11px] font-mono tracking-wider uppercase text-emerald-300/80 font-bold">
                • VERANDA GARDEN TERRACE (ALFRESCO)
              </div>
            </div>

            {/* 3. Main Dining Hall Zone (Center-Left) */}
            <div className="absolute top-36 left-4 text-[10px] font-mono tracking-widest uppercase text-amber-400/40">
              • GRAND MAIN HALL (CRYSTAL CHANDELIER SECTOR) •
            </div>

            {/* 4. Wine Showcase Partition */}
            <div className="hidden sm:flex absolute top-40 left-1/2 -translate-x-1/2 flex-col items-center gap-1 border-x border-dashed border-amber-500/20 px-3 py-6 rounded text-center">
              <span className="text-[9px] font-mono tracking-widest uppercase text-amber-400/50 font-bold">
                VINTAGE CELLAR
              </span>
            </div>

            {/* 5. Chef's VIP Kitchen Pass (Bottom Right) */}
            <div className="absolute bottom-3 right-4 flex items-center gap-2 border-t border-amber-400/20 pt-1.5 px-2">
              <span className="text-[11px] font-mono tracking-wider uppercase text-amber-300/80 font-bold">
                • CHEF'S OPEN EXPO KITCHEN & SOMMELIER PASS
              </span>
            </div>

            {/* 6. Host Entrance Podium (Bottom Left) */}
            <div className="absolute bottom-3 left-4 flex items-center gap-2 border-t border-stone-600/40 pt-1.5 px-2">
              <span className="text-[11px] font-mono tracking-wider uppercase text-stone-400 font-bold">
                • MAIN ENTRANCE & CONCIERGE FOYER
              </span>
            </div>

            {/* Tables Laid Out in the Architectural Floor Plan */}
            <div className="relative w-full h-[450px] sm:h-[490px] mt-6">
              {filteredTables.map((table) => {
                const num = table.tableNumber || table.number || 1;
                const meta = TABLE_METADATA[num] || {
                  zone: 'main',
                  zoneName: 'Main Dining',
                  shape: 'rect',
                  badge: 'Dining Table',
                  ambience: 'Comfortable luxury seating',
                  pos: { top: '50%', left: '50%' },
                };
                const capacity = Number(table.capacity) || 2;
                const isFree = table.isFree;
                const isSelected =
                  selectedTable &&
                  (selectedTable._id || selectedTable.id)?.toString() ===
                    (table._id || table.id)?.toString();

                const isVip = meta.zone === 'vip';
                const isTerrace = meta.zone === 'terrace';

                return (
                  <div
                    key={table._id || table.id}
                    style={{
                      position: 'absolute',
                      top: meta.pos.top,
                      left: meta.pos.left,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseEnter={() => setHoveredTable({ ...table, meta })}
                    onMouseLeave={() => setHoveredTable(null)}
                    onClick={() => isFree && onSelectTable(table)}
                    className={`group cursor-pointer select-none transition-all duration-300 ${
                      !isFree ? 'cursor-not-allowed opacity-40' : ''
                    }`}
                  >
                    {/* Visual Table Unit with Chairs Around It */}
                    <div className="relative flex items-center justify-center">
                      {/* Top Chairs */}
                      <div className="absolute -top-3 flex items-center gap-2 pointer-events-none">
                        {Array.from({ length: Math.min(Math.ceil(capacity / 2), 4) }).map((_, i) => (
                          <div
                            key={`top-chair-${i}`}
                            className={`h-2 w-4 rounded-t-sm transition-all duration-200 ${
                              isSelected
                                ? 'bg-orange-400 shadow-sm shadow-orange-400/80 scale-105'
                                : isFree
                                ? 'bg-slate-500/80 group-hover:bg-orange-400/90'
                                : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Bottom Chairs */}
                      <div className="absolute -bottom-3 flex items-center gap-2 pointer-events-none">
                        {Array.from({ length: Math.min(Math.floor(capacity / 2), 4) }).map((_, i) => (
                          <div
                            key={`bottom-chair-${i}`}
                            className={`h-2 w-4 rounded-b-sm transition-all duration-200 ${
                              isSelected
                                ? 'bg-orange-400 shadow-sm shadow-orange-400/80 scale-105'
                                : isFree
                                ? 'bg-slate-500/80 group-hover:bg-orange-400/90'
                                : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Main Table Body */}
                      <div
                        className={`relative flex flex-col items-center justify-center p-2.5 transition-all duration-300 ${
                          meta.shape === 'circle'
                            ? 'h-16 w-16 sm:h-20 sm:w-20 rounded-full'
                            : meta.shape === 'rect-large'
                            ? 'h-16 w-28 sm:h-20 sm:w-32 rounded-2xl'
                            : meta.shape === 'oval'
                            ? 'h-16 w-28 sm:h-20 sm:w-32 rounded-full'
                            : 'h-16 w-20 sm:h-20 sm:w-24 rounded-xl'
                        } ${
                          isSelected
                            ? 'bg-gradient-to-br from-district to-amber-600 text-white shadow-xl shadow-district/50 border-2 border-orange-300 scale-110 z-30 pulse-coral'
                            : isFree
                            ? isVip
                              ? 'bg-slate-900/90 text-amber-200 border-2 border-amber-500/60 shadow-lg shadow-amber-950/40 group-hover:border-orange-400 group-hover:scale-105 group-hover:bg-slate-800'
                              : isTerrace
                              ? 'bg-emerald-950/80 text-emerald-200 border-2 border-emerald-500/60 shadow-lg group-hover:border-emerald-400 group-hover:scale-105 group-hover:bg-emerald-900'
                              : 'bg-slate-800/90 text-slate-100 border-2 border-slate-600/70 shadow-lg group-hover:border-orange-400/80 group-hover:scale-105 group-hover:bg-slate-800'
                            : 'bg-slate-900/70 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {/* Table Number & Status Check */}
                        <div className="flex items-center gap-1">
                          {isVip && (
                            <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider">VIP</span>
                          )}
                          <span className="font-extrabold text-xs sm:text-sm font-heading tracking-tight">
                            T-{num < 10 ? `0${num}` : num}
                          </span>
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-white ml-0.5 inline-block" />
                          )}
                        </div>

                        {/* Guest Capacity */}
                        <div className="mt-0.5 text-[10px] font-medium opacity-90 font-mono">
                          {capacity}p
                        </div>

                        {/* Small Zone Tag */}
                        <span className="text-[8px] font-mono tracking-widest uppercase mt-0.5 opacity-70">
                          {meta.zone}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hover Tooltip / Live Inspector HUD at Bottom */}
            {hoveredTable && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md border border-orange-500/40 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-4 animate-slideup pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-orange-500/20 text-orange-300 flex items-center justify-center font-bold text-xs">
                    T{hoveredTable.tableNumber || hoveredTable.number}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{hoveredTable.meta?.zoneName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 font-mono">
                        {hoveredTable.meta?.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Up to {hoveredTable.capacity} guests • {hoveredTable.isFree ? 'Available' : 'Reserved'}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block text-xs text-slate-300 italic border-l border-slate-700 pl-3 max-w-xs">
                  "{hoveredTable.meta?.ambience}"
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =============================================================== */
          /* CARD GRID VIEW                                                  */
          /* =============================================================== */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTables.map((table) => {
              const num = table.tableNumber || table.number || 1;
              const meta = TABLE_METADATA[num] || {
                zone: 'main',
                zoneName: 'Main Dining Hall',
                badge: 'Dining Table',
                perks: ['Standard Seating'],
                ambience: 'Fine dining seating',
              };
              const capacity = Number(table.capacity) || 2;
              const isFree = table.isFree;
              const isSelected =
                selectedTable &&
                (selectedTable._id || selectedTable.id)?.toString() ===
                  (table._id || table.id)?.toString();

              return (
                <div
                  key={table._id || table.id}
                  onClick={() => isFree && onSelectTable(table)}
                  className={`group rounded-2xl p-5 transition-all duration-300 border select-none ${
                    isSelected
                      ? 'bg-gradient-to-br from-orange-50 to-amber-50/40 border-2 border-district shadow-district/20 transform -translate-y-1'
                      : isFree
                      ? 'bg-white border-slate-200 hover:border-district/60 hover:shadow-district/10 hover:-translate-y-1 cursor-pointer'
                      : 'bg-slate-50 border-slate-200/60 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* Subtle Zone Atmosphere Thumbnail */}
                  {meta.image && (
                    <div className="h-28 -mx-5 -mt-5 mb-4 overflow-hidden relative rounded-t-2xl">
                      <img
                        src={meta.image}
                        alt={meta.zoneName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
                      <span className="absolute bottom-2 left-3 text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                        {meta.zoneName}
                      </span>
                    </div>
                  )}

                  {/* Top Badge & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider ${
                        isSelected
                          ? 'bg-gradient-to-r from-district to-district-accent text-white shadow-xs'
                          : isFree
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isSelected ? 'Your Selection' : isFree ? 'Available' : 'Reserved'}
                    </span>

                    <span className="text-xs font-semibold text-slate-500">
                      {capacity} Guests
                    </span>
                  </div>

                  {/* Table Title & Zone */}
                  <div className="flex items-baseline justify-between mb-1.5">
                    <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                      Table #{num}
                    </h3>
                    <span className="text-xs font-semibold text-district bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                      {meta.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3 font-medium">
                    {meta.zoneName}
                  </p>

                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                    "{meta.ambience}"
                  </p>

                  {/* Perks Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {meta.perks.slice(0, 2).map((perk) => (
                      <span
                        key={perk}
                        className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full"
                      >
                        {perk}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Action CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    {isSelected ? (
                      <span className="text-district">
                        Selected Table
                      </span>
                    ) : isFree ? (
                      <span className="text-slate-700 group-hover:text-district transition-colors">
                        Click to Select Table →
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Booked for this time slot
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Table Summary Banner Footer */}
      {selectedTable && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-district via-orange-600 to-amber-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-base border border-white/30">
              T{selectedTable.tableNumber || selectedTable.number}
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>Table #{selectedTable.tableNumber || selectedTable.number} Selected</span>
                <span className="text-xs font-normal opacity-90 px-2 py-0.5 rounded bg-white/15">
                  {TABLE_METADATA[selectedTable.tableNumber || selectedTable.number]?.zoneName || 'Main Dining'}
                </span>
              </div>
              <div className="text-xs opacity-90">
                Accommodates up to {selectedTable.capacity} guests • {selectedDate} ({selectedTimeSlot})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => onSelectTable(null)}
              className="text-xs text-white/80 hover:text-white px-3 py-1.5 rounded-lg bg-black/15 hover:bg-black/25 transition-all"
            >
              Clear Choice
            </button>
            <a
              href="#booking-form"
              className="text-xs font-bold text-district bg-white hover:bg-orange-50 px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Proceed to Guest Details ↓
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
