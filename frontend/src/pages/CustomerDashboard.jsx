import { useEffect, useState } from 'react';
import { api, TIME_SLOTS } from '../api/client';
import { useAuth } from '../context/AuthContext';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function CustomerDashboard() {
  const { token } = useAuth();
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({
    tableId: '',
    date: todayISO(),
    timeSlot: TIME_SLOTS[0],
    guests: 2,
  });
  const [availableTableIds, setAvailableTableIds] = useState(null);
  const [message, setMessage] = useState(null); // { type: 'error' | 'success', text }
  const [loading, setLoading] = useState(false);

  const loadReservations = async () => {
    const data = await api.getMyReservations(token);
    setReservations(data);
  };

  useEffect(() => {
    api.getTables().then((data) => {
      // Sort tables by tableNumber so visual map coordinates line up predictably
      const sorted = [...data].sort((a, b) => a.tableNumber - b.tableNumber);
      setTables(sorted);
    });
    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check availability whenever date or time slot changes,
  // so the table map and selector only show genuinely bookable tables.
  useEffect(() => {
    if (!form.date || !form.timeSlot) return;
    api
      .getAvailability(form.date, form.timeSlot)
      .then((available) => {
        const availableSet = new Set(available.map((t) => t._id));
        setAvailableTableIds(availableSet);
        
        // Reset selected table if it's no longer available under the new slot/date
        if (form.tableId && !availableSet.has(form.tableId)) {
          setForm((f) => ({ ...f, tableId: '' }));
        }
      })
      .catch(() => setAvailableTableIds(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, form.timeSlot]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tableId) {
      setMessage({ type: 'error', text: 'Please select a table from the map.' });
      return;
    }

    setMessage(null);
    setLoading(true);
    try {
      await api.createReservation(
        { ...form, guests: Number(form.guests) },
        token
      );
      setMessage({ type: 'success', text: 'Table reserved. Your ticket has been registered.' });
      setForm((f) => ({ ...f, tableId: '' }));
      loadReservations();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.cancelReservation(id, token);
      loadReservations();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const adjustGuests = (amount) => {
    const val = Math.max(1, Math.min(12, form.guests + amount));
    setForm((f) => ({ ...f, guests: val }));
  };

  // Status checkers for tables
  const isTableOccupied = (t) => availableTableIds !== null && !availableTableIds.has(t._id);
  const isTableTooSmall = (t) => t.capacity < form.guests;
  const isTableSelectable = (t) => !isTableOccupied(t) && !isTableTooSmall(t);

  const activeReservations = reservations.filter((r) => r.status === 'confirmed');
  const pastReservations = reservations.filter((r) => r.status !== 'confirmed');

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 animate-slideup">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Book a Table</p>
      <h1 className="mb-10 font-sans text-3xl md:text-4xl font-bold uppercase tracking-tight text-text">
        Reserve <span className="text-gold">your evening</span>
      </h1>

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        {/* Reservation Planner (Left) */}
        <div className="flex flex-col gap-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-sm border border-ink-lighter bg-ink-light/30 p-6 backdrop-blur-sm">
            {message && (
              <div
                className={`rounded-sm border px-4 py-3 text-sm ${
                  message.type === 'error'
                    ? 'border-brick bg-brick/10 text-brick'
                    : 'border-sage bg-sage/10 text-sage'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* DateTime and Party Selection */}
            <div className="grid gap-6 sm:grid-cols-3">
              {/* Date */}
              <label className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-text-muted">Date</span>
                <input
                  type="date"
                  required
                  min={todayISO()}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-sm border border-ink-lighter bg-ink px-4 py-2.5 text-sm text-text outline-none focus:border-gold transition-colors"
                />
              </label>

              {/* Time Slot Selector as dropdown */}
              <label className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-text-muted">Time slot</span>
                <select
                  value={form.timeSlot}
                  onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                  className="w-full rounded-sm border border-ink-lighter bg-ink px-4 py-2.5 text-sm text-text outline-none focus:border-gold transition-colors"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>

              {/* Guests Selector with custom plus/minus stepper buttons */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-text-muted">Party Size</span>
                <div className="flex h-[42px] items-center rounded-sm border border-ink-lighter bg-ink overflow-hidden">
                  <button
                    type="button"
                    onClick={() => adjustGuests(-1)}
                    disabled={form.guests <= 1}
                    className="h-full px-4 text-text-muted hover:text-gold hover:bg-ink-light transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    —
                  </button>
                  <span className="flex-1 text-center text-sm font-semibold text-text">
                    {form.guests} {form.guests === 1 ? 'Guest' : 'Guests'}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustGuests(1)}
                    disabled={form.guests >= 12}
                    className="h-full px-4 text-text-muted hover:text-gold hover:bg-ink-light transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Time Slot Pill Row (UX upgrade: quick slot visual check) */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-text-muted">Time Slot Pills</span>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isSel = form.timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, timeSlot: slot }))}
                      className={`rounded-sm border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                        isSel
                          ? 'border-gold bg-gold text-ink shadow-md shadow-gold/20'
                          : 'border-ink-lighter bg-ink/65 text-text hover:border-gold/50'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Floor Plan Seating Map */}
            <div className="flex flex-col gap-2 border-t border-ink-lighter/50 pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
                  Interactive Floor Plan
                </span>
                <span className="text-[10px] text-gold-soft font-mono">
                  Select an available table below
                </span>
              </div>

              {/* Map Legend */}
              <div className="flex flex-wrap items-center gap-4 mb-4 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full border border-sage/60 bg-transparent"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full border border-gold bg-gold"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-brick/40 border border-brick/40"></div>
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full border border-dashed border-ink-lighter bg-ink-light/20"></div>
                  <span>Too Small</span>
                </div>
              </div>

              {/* Floor Plan Box */}
              <div className="flex justify-center rounded-sm border border-ink-lighter bg-ink/80 p-4">
                {tables.length === 0 ? (
                  <div className="py-12 text-center text-xs text-text-muted">Loading seating chart...</div>
                ) : (
                  <div className="relative w-full max-w-[440px]">
                    <svg
                      viewBox="0 0 440 300"
                      className="w-full h-auto text-text select-none"
                    >
                      {/* Grid/Floor styling */}
                      <rect width="440" height="300" fill="#1b2b30" rx="3" stroke="#22383f" strokeWidth="1" />
                      <line x1="220" y1="0" x2="220" y2="300" stroke="#22383f" strokeDasharray="4 4" />
                      
                      {/* Room Features */}
                      {/* Host Stand */}
                      <g transform="translate(390, 10)">
                        <rect width="40" height="30" fill="#2c444c" stroke="#5c7a66" strokeWidth="1" rx="2" />
                        <text x="20" y="18" fill="#EDE7D9" fontSize="8" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">HOST</text>
                      </g>
                      
                      {/* Kitchen wall */}
                      <g transform="translate(10, 10)">
                        <rect width="80" height="25" fill="#2c444c" stroke="#8a701c" strokeWidth="1" rx="2" />
                        <text x="40" y="16" fill="#EDE7D9" fontSize="8" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">BAR</text>
                      </g>

                      {/* Tables Seating layout mapping */}
                      {tables.map((t) => {
                        const isSel = form.tableId === t._id;
                        const isOcc = isTableOccupied(t);
                        const isSmall = isTableTooSmall(t);
                        const isSelect = isTableSelectable(t);

                        let colorClass = "fill-transparent stroke-sage/70 hover:stroke-sage hover:fill-sage/5 hover:cursor-pointer";
                        let ringColor = "stroke-sage/40";
                        if (isSel) {
                          colorClass = "fill-gold stroke-gold hover:cursor-pointer shadow-md";
                          ringColor = "stroke-gold/50";
                        } else if (isOcc) {
                          colorClass = "fill-brick/20 stroke-brick/40 opacity-60 cursor-not-allowed";
                          ringColor = "stroke-brick/20";
                        } else if (isSmall) {
                          colorClass = "fill-ink-light/20 stroke-ink-lighter stroke-dasharray-[4 4] cursor-not-allowed";
                          ringColor = "stroke-ink-lighter/20";
                        }

                        // Coordinates mapping for exactly 6 tables
                        if (t.tableNumber === 1) {
                          // Table 1: Seats 2, Circle
                          return (
                            <g key={t._id} onClick={() => isSelect && setForm({ ...form, tableId: t._id })}>
                              <circle cx="90" cy="80" r="28" className={`transition-all duration-300 ${colorClass}`} strokeWidth="2" />
                              <text x="90" y="83" fill={isSel ? "#17262B" : "#EDE7D9"} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">T1</text>
                              <text x="90" y="93" fill={isSel ? "#17262B" : "#9FB0AF"} fontSize="7" textAnchor="middle">2 seats</text>
                            </g>
                          );
                        }
                        if (t.tableNumber === 2) {
                          // Table 2: Seats 2, Circle
                          return (
                            <g key={t._id} onClick={() => isSelect && setForm({ ...form, tableId: t._id })}>
                              <circle cx="90" cy="160" r="28" className={`transition-all duration-300 ${colorClass}`} strokeWidth="2" />
                              <text x="90" y="163" fill={isSel ? "#17262B" : "#EDE7D9"} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">T2</text>
                              <text x="90" y="173" fill={isSel ? "#17262B" : "#9FB0AF"} fontSize="7" textAnchor="middle">2 seats</text>
                            </g>
                          );
                        }
                        if (t.tableNumber === 3) {
                          // Table 3: Seats 4, Rect
                          return (
                            <g key={t._id} onClick={() => isSelect && setForm({ ...form, tableId: t._id })}>
                              <rect x="50" y="225" width="80" height="50" rx="4" className={`transition-all duration-300 ${colorClass}`} strokeWidth="2" />
                              <text x="90" y="252" fill={isSel ? "#17262B" : "#EDE7D9"} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">T3</text>
                              <text x="90" y="262" fill={isSel ? "#17262B" : "#9FB0AF"} fontSize="7" textAnchor="middle">4 seats</text>
                            </g>
                          );
                        }
                        if (t.tableNumber === 4) {
                          // Table 4: Seats 4, Rect
                          return (
                            <g key={t._id} onClick={() => isSelect && setForm({ ...form, tableId: t._id })}>
                              <rect x="300" y="60" width="80" height="50" rx="4" className={`transition-all duration-300 ${colorClass}`} strokeWidth="2" />
                              <text x="340" y="87" fill={isSel ? "#17262B" : "#EDE7D9"} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">T4</text>
                              <text x="340" y="97" fill={isSel ? "#17262B" : "#9FB0AF"} fontSize="7" textAnchor="middle">4 seats</text>
                            </g>
                          );
                        }
                        if (t.tableNumber === 5) {
                          // Table 5: Seats 6, Rect
                          return (
                            <g key={t._id} onClick={() => isSelect && setForm({ ...form, tableId: t._id })}>
                              <rect x="290" y="140" width="100" height="52" rx="4" className={`transition-all duration-300 ${colorClass}`} strokeWidth="2" />
                              <text x="340" y="168" fill={isSel ? "#17262B" : "#EDE7D9"} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">T5</text>
                              <text x="340" y="178" fill={isSel ? "#17262B" : "#9FB0AF"} fontSize="7" textAnchor="middle">6 seats</text>
                            </g>
                          );
                        }
                        if (t.tableNumber === 6) {
                          // Table 6: Seats 8, Large Rect
                          return (
                            <g key={t._id} onClick={() => isSelect && setForm({ ...form, tableId: t._id })}>
                              <rect x="270" y="220" width="140" height="60" rx="4" className={`transition-all duration-300 ${colorClass}`} strokeWidth="2" />
                              <text x="340" y="250" fill={isSel ? "#17262B" : "#EDE7D9"} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">T6 (Family Table)</text>
                              <text x="340" y="262" fill={isSel ? "#17262B" : "#9FB0AF"} fontSize="7" textAnchor="middle">8 seats</text>
                            </g>
                          );
                        }
                        return null;
                      })}
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Selected summary & submit button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-ink-lighter/50 pt-6">
              <div>
                {form.tableId ? (
                  <p className="text-sm text-text">
                    Ready to book:{' '}
                    <span className="font-semibold text-gold">
                      Table {tables.find((t) => t._id === form.tableId)?.tableNumber}
                    </span>{' '}
                    ({tables.find((t) => t._id === form.tableId)?.capacity} seats)
                  </p>
                ) : (
                  <p className="text-sm text-text-muted">
                    No table selected yet. Tap one on the layout.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !form.tableId}
                className="w-full sm:w-auto rounded-sm bg-gold px-8 py-3 text-xs font-bold uppercase tracking-wider text-ink transition-all duration-300 hover:bg-gold-soft hover:shadow-lg hover:shadow-gold/25 disabled:opacity-40 disabled:hover:shadow-none disabled:cursor-not-allowed"
              >
                {loading ? 'Reserving…' : 'Lock in reservation'}
              </button>
            </div>
          </form>
        </div>

        {/* Tickets and Cancelled Lists (Right) */}
        <div className="flex flex-col gap-6">
          <div className="rounded-sm border border-ink-lighter bg-ink-light/20 p-6 backdrop-blur-sm">
            <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-text-muted border-b border-ink-lighter pb-3">
              Your active reservation stubs
            </h2>

            {activeReservations.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted leading-relaxed">
                No active bookings.<br />Create one using the planner.
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {activeReservations.map((r) => (
                  <TicketCard key={r._id} reservation={r} onCancel={() => handleCancel(r._id)} />
                ))}
              </div>
            )}
          </div>

          {pastReservations.length > 0 && (
            <div className="rounded-sm border border-ink-lighter bg-ink-light/10 p-6 opacity-60">
              <details>
                <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-text-muted hover:text-gold transition-colors">
                  Archived / Cancelled ({pastReservations.length})
                </summary>
                <div className="mt-4 flex flex-col gap-4">
                  {pastReservations.map((r) => (
                    <TicketCard key={r._id} reservation={r} cancelled />
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component: Skeuomorphic ticket card
function TicketCard({ reservation, onCancel, cancelled }) {
  return (
    <div className="relative overflow-hidden rounded-sm bg-paper text-ink shadow-lg transition-transform duration-300 hover:-translate-y-0.5">
      {/* Top Perforation Tear Details */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-ink/5"></div>
      
      <div className="flex items-start justify-between px-5 pt-6 pb-4">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-ink/50 block mb-1">
            Seating Assignment
          </span>
          <h4 className="font-sans text-xl font-bold tracking-tight text-ink/90">
            Table {reservation.table?.tableNumber || '#'}
          </h4>
          <span className="text-[10px] text-ink/60 font-mono block">
            Capacity: {reservation.table?.capacity || 2} persons
          </span>
        </div>
        
        {/* Status Stamp */}
        <span 
          className={`stamp inline-block rounded-sm border-2 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest ${
            cancelled 
              ? 'border-brick/50 text-brick' 
              : 'border-sage-dim text-sage-dim'
          }`}
        >
          {cancelled ? 'Cancelled' : 'Confirmed'}
        </span>
      </div>

      {/* Perforated Split Line */}
      <div className="ticket-edge relative my-1 h-px bg-ink/10"></div>

      {/* Card Details Body */}
      <div className="px-5 py-4 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-mono text-ink/55 uppercase tracking-wider">Date</span>
          <span className="font-semibold text-ink/90 font-mono">{reservation.date}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="font-mono text-ink/55 uppercase tracking-wider">Time window</span>
          <span className="font-semibold text-ink/90 font-mono">{reservation.timeSlot}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="font-mono text-ink/55 uppercase tracking-wider">Party size</span>
          <span className="font-semibold text-ink/90">{reservation.guests} Guests</span>
        </div>
      </div>

      {/* Ticket Base Tear stub */}
      <div className="ticket-edge-bottom bg-ink/[0.03] px-5 py-3.5 flex items-center justify-between text-xs border-t border-ink/[0.05]">
        <span className="font-mono text-[8px] uppercase tracking-widest text-ink/40">
          ATELIER DINING stub
        </span>
        {!cancelled && (
          <button
            onClick={onCancel}
            className="font-mono text-[10px] uppercase tracking-wider font-bold text-brick hover:text-brick-dim hover:underline transition-colors"
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}
