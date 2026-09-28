import { useEffect, useState } from 'react';
import { api, TIME_SLOTS } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function CustomerDashboard() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({
    tableId: '',
    date: todayISO(),
    timeSlot: TIME_SLOTS[0],
    guests: 2,
  });
  const [availableTableIds, setAvailableTableIds] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const loadReservations = async () => {
    setReservationsLoading(true);
    try {
      const data = await api.getMyReservations(token);
      setReservations(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setReservationsLoading(false);
    }
  };

  useEffect(() => {
    api.getTables().then((data) => {
      setTables([...data].sort((a, b) => a.tableNumber - b.tableNumber));
    });
    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!form.date || !form.timeSlot) return;
    api
      .getAvailability(form.date, form.timeSlot)
      .then((available) => {
        const set = new Set(available.map((t) => t._id));
        setAvailableTableIds(set);
        if (form.tableId && !set.has(form.tableId)) {
          setForm((f) => ({ ...f, tableId: '' }));
        }
      })
      .catch(() => setAvailableTableIds(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, form.timeSlot]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tableId) {
      setMessage({ type: 'error', text: 'Please select a table from the floor plan.' });
      return;
    }
    setMessage(null);
    setLoading(true);
    try {
      await api.createReservation({ ...form, guests: Number(form.guests) }, token);
      showToast('Reservation created! Awaiting confirmation.', 'success');
      setForm((f) => ({ ...f, tableId: '' }));
      loadReservations();
    } catch (err) {
      const text =
        err.status === 409 ? 'This table is already booked for the selected date and time slot.' :
        err.status === 403 ? 'You don\'t have permission to perform this action.' :
        err.message;
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    setCancellingId(id);
    try {
      await api.cancelReservation(id, token);
      showToast('Reservation cancelled.', 'success');
      loadReservations();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const adjustGuests = (amt) => {
    setForm((f) => ({ ...f, guests: Math.max(1, Math.min(12, f.guests + amt)) }));
  };

  const isOccupied = (t) => availableTableIds !== null && !availableTableIds.has(t._id);
  const isTooSmall = (t) => t.capacity < form.guests;
  const isSelectable = (t) => !isOccupied(t) && !isTooSmall(t);

  const active = reservations.filter((r) => r.status === 'confirmed' || r.status === 'pending');
  const past = reservations.filter((r) => r.status === 'cancelled');

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 animate-slideup">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Book a Table</h1>
      <p className="mb-8 text-sm text-gray-500">Select your date, time, and preferred table from our floor plan</p>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* LEFT: Booking Form */}
        <div>
          <form onSubmit={handleSubmit} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
            {message && (
              <div className={`rounded-lg border px-4 py-3 text-xs font-medium ${
                message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Date / Time / Party */}
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</span>
                <input
                  type="date"
                  required min={todayISO()} value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time Slot</span>
                <select
                  value={form.timeSlot}
                  onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                >
                  {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Guests</span>
                <div className="flex h-[42px] items-center rounded-lg border border-gray-200 overflow-hidden">
                  <button type="button" onClick={() => adjustGuests(-1)} disabled={form.guests <= 1}
                    className="h-full px-3 text-gray-400 hover:text-gold hover:bg-gray-50 transition-colors disabled:opacity-30">−</button>
                  <span className="flex-1 text-center text-sm font-semibold text-gray-900">{form.guests}</span>
                  <button type="button" onClick={() => adjustGuests(1)} disabled={form.guests >= 12}
                    className="h-full px-3 text-gray-400 hover:text-gold hover:bg-gray-50 transition-colors disabled:opacity-30">+</button>
                </div>
              </div>
            </div>

            {/* Time slot pills */}
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button key={slot} type="button"
                  onClick={() => setForm((f) => ({ ...f, timeSlot: slot }))}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    form.timeSlot === slot
                      ? 'bg-gold text-white'
                      : 'bg-gray-50 text-gray-600 border border-gray-100 hover:border-gray-200'
                  }`}
                >{slot}</button>
              ))}
            </div>

            {/* Floor plan */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Floor Plan</span>
                <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded border border-gray-300 bg-white inline-block"></span> Available</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-gold inline-block"></span> Selected</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-gray-200 inline-block"></span> Taken</span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                {tables.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-400">Loading floor plan…</div>
                ) : (
                  <div className="relative w-full max-w-[440px] mx-auto">
                    <svg viewBox="0 0 440 300" className="w-full h-auto select-none">
                      <rect width="440" height="300" fill="#FAFAFA" rx="8" stroke="#E5E7EB" strokeWidth="1" />
                      <line x1="220" y1="0" x2="220" y2="300" stroke="#F3F4F6" strokeDasharray="4 4" />
                      {/* Labels */}
                      <g transform="translate(390, 10)">
                        <rect width="40" height="28" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" rx="4" />
                        <text x="20" y="17" fill="#9CA3AF" fontSize="7" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">HOST</text>
                      </g>
                      <g transform="translate(10, 10)">
                        <rect width="70" height="22" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" rx="4" />
                        <text x="35" y="15" fill="#9CA3AF" fontSize="7" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">BAR</text>
                      </g>

                      {tables.map((t) => {
                        const sel = form.tableId === t._id;
                        const occ = isOccupied(t);
                        const small = isTooSmall(t);
                        const ok = isSelectable(t);

                        let fill = '#FFFFFF', stroke = '#D1D5DB', textC = '#374151', subC = '#9CA3AF', cursor = 'pointer';
                        if (sel) { fill = '#B45309'; stroke = '#B45309'; textC = '#FFFFFF'; subC = '#FED7AA'; }
                        else if (occ) { fill = '#F3F4F6'; stroke = '#E5E7EB'; textC = '#9CA3AF'; subC = '#D1D5DB'; cursor = 'not-allowed'; }
                        else if (small) { fill = '#FAFAFA'; stroke = '#E5E7EB'; textC = '#D1D5DB'; subC = '#E5E7EB'; cursor = 'not-allowed'; }

                        const click = () => ok && setForm({ ...form, tableId: t._id });
                        const common = { style: { cursor }, onClick: click };
                        const coords = {
                          1: { type: 'c', cx: 90, cy: 80, r: 28 },
                          2: { type: 'c', cx: 90, cy: 160, r: 28 },
                          3: { type: 'r', x: 50, y: 225, w: 80, h: 50 },
                          4: { type: 'r', x: 300, y: 60, w: 80, h: 50 },
                          5: { type: 'r', x: 290, y: 140, w: 100, h: 52 },
                          6: { type: 'r', x: 270, y: 220, w: 140, h: 60 },
                        }[t.tableNumber];
                        if (!coords) return null;

                        const label = t.tableNumber === 6 ? `T${t.tableNumber} (Family)` : `T${t.tableNumber}`;
                        if (coords.type === 'c') {
                          return (
                            <g key={t._id} {...common}>
                              <circle cx={coords.cx} cy={coords.cy} r={coords.r} fill={fill} stroke={stroke} strokeWidth="1.5" className="transition-colors" />
                              <text x={coords.cx} y={coords.cy + 1} fill={textC} fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">{label}</text>
                              <text x={coords.cx} y={coords.cy + 12} fill={subC} fontSize="7" textAnchor="middle">{t.capacity} seats</text>
                            </g>
                          );
                        }
                        const cx = coords.x + coords.w / 2, cy = coords.y + coords.h / 2;
                        return (
                          <g key={t._id} {...common}>
                            <rect x={coords.x} y={coords.y} width={coords.w} height={coords.h} rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" className="transition-colors" />
                            <text x={cx} y={cy + 1} fill={textC} fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">{label}</text>
                            <text x={cx} y={cy + 12} fill={subC} fontSize="7" textAnchor="middle">{t.capacity} seats</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-5">
              <p className="text-sm text-gray-500">
                {form.tableId
                  ? <>Selected: <span className="font-semibold text-gold">Table {tables.find((t) => t._id === form.tableId)?.tableNumber}</span> ({tables.find((t) => t._id === form.tableId)?.capacity} seats)</>
                  : 'Tap a table on the floor plan'}
              </p>
              <button type="submit" disabled={loading || !form.tableId}
                className="w-full sm:w-auto rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white hover:bg-gold-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Reserving…' : 'Reserve table'}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Bookings */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Reservations</h2>

            {reservationsLoading ? (
              <div className="py-10 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading…
              </div>
            ) : active.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-gray-200 rounded-lg">
                <svg className="h-8 w-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-900 mb-0.5">No reservations yet</p>
                <p className="text-xs text-gray-400">Use the floor plan to book a table</p>
              </div>
            ) : (
              <div className="space-y-3">
                {active.map((r) => (
                  <ReservationCard key={r._id} r={r} onCancel={() => handleCancel(r._id)} cancelling={cancellingId === r._id} />
                ))}
              </div>
            )}
          </div>

          {!reservationsLoading && past.length > 0 && (
            <details className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors">
                Cancelled ({past.length})
              </summary>
              <div className="mt-4 space-y-3">
                {past.map((r) => <ReservationCard key={r._id} r={r} />)}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function ReservationCard({ r, onCancel, cancelling }) {
  const statusColors = {
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
  };

  return (
    <div className="rounded-lg border border-gray-100 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-gray-900">Table {r.table?.tableNumber || '#'}</p>
          <p className="text-xs text-gray-400">{r.table?.capacity} seats</p>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[r.status] || statusColors.cancelled}`}>
          {r.status}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div><span className="text-gray-400 block">Date</span><span className="font-medium text-gray-700">{r.date}</span></div>
        <div><span className="text-gray-400 block">Time</span><span className="font-medium text-gray-700">{r.timeSlot}</span></div>
        <div><span className="text-gray-400 block">Guests</span><span className="font-medium text-gray-700">{r.guests}</span></div>
      </div>
      {r.status !== 'cancelled' && onCancel && (
        <button onClick={onCancel} disabled={cancelling}
          className="text-xs font-medium text-brick hover:underline disabled:opacity-50">
          {cancelling ? 'Cancelling…' : 'Cancel booking'}
        </button>
      )}
    </div>
  );
}
