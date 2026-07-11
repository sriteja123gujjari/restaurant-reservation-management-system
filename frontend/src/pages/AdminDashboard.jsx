import { useEffect, useState } from 'react';
import { api, TIME_SLOTS } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', timeSlot: '', guests: '' });

  const load = async () => {
    setError('');
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.set('date', dateFilter);
      if (statusFilter) params.set('status', statusFilter);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const data = await api.getAllReservations(token, qs);
      setReservations(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, statusFilter]);

  const startEdit = (r) => {
    setEditingId(r._id);
    setEditForm({ date: r.date, timeSlot: r.timeSlot, guests: r.guests });
  };

  const saveEdit = async (id) => {
    try {
      await api.updateReservation(id, { ...editForm, guests: Number(editForm.guests) }, token);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelReservation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking as Admin?')) return;
    try {
      await api.updateReservation(id, { status: 'cancelled' }, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  // Compute stats metrics dynamically
  const confirmedList = reservations.filter((r) => r.status === 'confirmed');
  const totalBookings = reservations.length;
  const activeBookings = confirmedList.length;
  const totalCovers = confirmedList.reduce((acc, r) => acc + (r.guests || 0), 0);
  
  // Calculate unique tables occupied
  const uniqueTablesOccupied = new Set(confirmedList.map((r) => r.table?.tableNumber)).size;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 animate-slideup">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Management</p>
      <h1 className="mb-8 font-sans text-3xl md:text-4xl font-bold uppercase tracking-tight text-text">
        The Reservation <span className="text-gold">Ledger</span>
      </h1>

      {/* Metrics Cards Grid (UX upgrade: gives admin instant context) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-sm border border-ink-lighter bg-ink-light/20 p-5 backdrop-blur-sm">
          <span className="block font-mono text-[9px] uppercase tracking-wider text-text-muted">
            Total Bookings Listed
          </span>
          <span className="text-3xl font-sans font-bold text-text mt-1 block">
            {totalBookings}
          </span>
        </div>
        <div className="rounded-sm border border-ink-lighter bg-ink-light/20 p-5 backdrop-blur-sm">
          <span className="block font-mono text-[9px] uppercase tracking-wider text-text-muted">
            Active Confirmed
          </span>
          <span className="text-3xl font-sans font-bold text-sage mt-1 block">
            {activeBookings}
          </span>
        </div>
        <div className="rounded-sm border border-ink-lighter bg-ink-light/20 p-5 backdrop-blur-sm">
          <span className="block font-mono text-[9px] uppercase tracking-wider text-text-muted">
            Total Guest Covers
          </span>
          <span className="text-3xl font-sans font-bold text-gold mt-1 block">
            {totalCovers}
          </span>
        </div>
        <div className="rounded-sm border border-ink-lighter bg-ink-light/20 p-5 backdrop-blur-sm">
          <span className="block font-mono text-[9px] uppercase tracking-wider text-text-muted">
            Unique Tables Used
          </span>
          <span className="text-3xl font-sans font-bold text-text mt-1 block">
            {uniqueTablesOccupied} <span className="text-xs text-text-muted">/ 6</span>
          </span>
        </div>
      </div>

      {/* Filter and control layout */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-ink-lighter pb-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Filter by date</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-sm border border-ink-lighter bg-ink-light px-3 py-2 text-xs text-text outline-none focus:border-gold transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-sm border border-ink-lighter bg-ink-light px-3 py-2 text-xs text-text outline-none focus:border-gold transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          {(dateFilter || statusFilter) && (
            <button
              onClick={() => {
                setDateFilter('');
                setStatusFilter('');
              }}
              className="font-mono text-[10px] uppercase tracking-wider text-gold hover:text-gold-soft mb-2"
            >
              Clear filters
            </button>
          )}
        </div>

        <button 
          onClick={load}
          className="rounded-sm border border-gold/30 hover:border-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text hover:bg-gold/5 transition-all"
        >
          Refresh Ledger
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-sm border border-brick bg-brick/10 px-4 py-3 text-sm text-brick">
          {error}
        </div>
      )}

      {/* Modern Ledger Table */}
      <div className="overflow-x-auto rounded-sm border border-ink-lighter bg-ink-light/10 shadow-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink-lighter bg-ink-light/50 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              <th className="px-5 py-4 text-left">Guest Detail</th>
              <th className="px-5 py-4 text-left">Seating Allocation</th>
              <th className="px-5 py-4 text-left">Date</th>
              <th className="px-5 py-4 text-left">Time Slot</th>
              <th className="px-5 py-4 text-left">Party Size</th>
              <th className="px-5 py-4 text-left">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r, i) => {
              const isEditing = editingId === r._id;
              return (
                <tr
                  key={r._id}
                  className={`border-b border-ink-lighter/30 transition-colors hover:bg-ink-light/20 ${
                    i % 2 === 0 ? 'bg-transparent' : 'bg-ink-light/5'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-text">{r.user?.name}</div>
                        <div className="text-xs text-text-muted">{r.user?.email}</div>
                      </td>
                      <td className="px-5 py-3 font-mono">Table #{r.table?.tableNumber}</td>
                      <td className="px-5 py-3">
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="rounded-sm border border-ink-lighter bg-ink px-3 py-1.5 text-xs text-text outline-none focus:border-gold"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={editForm.timeSlot}
                          onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                          className="rounded-sm border border-ink-lighter bg-ink px-3 py-1.5 text-xs text-text outline-none focus:border-gold"
                        >
                          {TIME_SLOTS.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={editForm.guests}
                          onChange={(e) => setEditForm({ ...editForm, guests: e.target.value })}
                          className="w-16 rounded-sm border border-ink-lighter bg-ink px-3 py-1.5 text-xs text-text outline-none focus:border-gold"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs uppercase text-sage">{r.status}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => saveEdit(r._id)}
                          className="mr-3 font-mono text-xs uppercase font-bold text-sage hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="font-mono text-xs uppercase font-bold text-text-muted hover:underline"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-text">{r.user?.name}</div>
                        <div className="text-xs text-text-muted font-mono">{r.user?.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono font-semibold text-text">
                          Table #{r.table?.tableNumber || '#'}
                        </span>
                        <span className="text-[10px] text-text-muted block font-mono">
                          Capacity: {r.table?.capacity || 2} persons
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-text-muted">{r.date}</td>
                      <td className="px-5 py-4 font-mono text-xs text-text-muted">{r.timeSlot}</td>
                      <td className="px-5 py-4 font-semibold text-text">{r.guests} guests</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
                            r.status === 'confirmed'
                              ? 'bg-sage/10 text-sage border border-sage/20'
                              : 'bg-ink-light/50 text-text-muted border border-ink-lighter'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {r.status === 'confirmed' && (
                          <div className="flex justify-end gap-3.5">
                            <button
                              onClick={() => startEdit(r)}
                              className="font-mono text-xs uppercase tracking-wider font-bold text-gold hover:text-gold-soft hover:underline transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => cancelReservation(r._id)}
                              className="font-mono text-xs uppercase tracking-wider font-bold text-brick hover:text-brick-dim hover:underline transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}

            {reservations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-xs text-text-muted leading-relaxed">
                  No bookings found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
