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
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.updateReservation(id, { status: 'cancelled' }, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmReservation = async (id) => {
    try {
      await api.updateReservation(id, { status: 'confirmed' }, token);
      load();
    } catch (err) {
      const text =
        err.status === 409
          ? 'Cannot confirm: This table is already booked for this date and time slot.'
          : err.message;
      setError(text);
    }
  };

  const confirmedList = reservations.filter((r) => r.status === 'confirmed');
  const pendingList = reservations.filter((r) => r.status === 'pending');
  const cancelledList = reservations.filter((r) => r.status === 'cancelled');
  const totalCovers = confirmedList.reduce((acc, r) => acc + (r.guests || 0), 0);

  const stats = [
    { label: 'Total Bookings', value: reservations.length, color: 'text-gray-900' },
    { label: 'Confirmed', value: confirmedList.length, color: 'text-emerald-600' },
    { label: 'Pending', value: pendingList.length, color: 'text-amber-600' },
    { label: 'Cancelled', value: cancelledList.length, color: 'text-red-500' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 animate-slideup">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Reservations Dashboard</h1>
      <p className="mb-8 text-sm text-gray-500">Manage all bookings, update status, and track guest covers</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{s.label}</span>
            <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</span>
          <input
            type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
          <select
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
          >
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        {(dateFilter || statusFilter) && (
          <button onClick={() => { setDateFilter(''); setStatusFilter(''); }}
            className="text-xs font-medium text-gold hover:underline mb-0.5">
            Clear filters
          </button>
        )}
        <div className="ml-auto">
          <button onClick={load}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="px-5 py-3.5 text-left">Guest</th>
              <th className="px-5 py-3.5 text-left">Table</th>
              <th className="px-5 py-3.5 text-left">Date</th>
              <th className="px-5 py-3.5 text-left">Time</th>
              <th className="px-5 py-3.5 text-left">Guests</th>
              <th className="px-5 py-3.5 text-left">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => {
              const isEditing = editingId === r._id;

              const statusBadge = {
                confirmed: 'bg-green-50 text-green-700 border-green-200',
                pending: 'bg-amber-50 text-amber-700 border-amber-200',
                cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
              }[r.status] || 'bg-gray-50 text-gray-500 border-gray-200';

              return (
                <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  {isEditing ? (
                    <>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-gray-900">{r.user?.name}</div>
                        <div className="text-xs text-gray-400">{r.user?.email}</div>
                      </td>
                      <td className="px-5 py-3 text-gray-700 font-medium">T{r.table?.tableNumber}</td>
                      <td className="px-5 py-3">
                        <input type="date" value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-gold" />
                      </td>
                      <td className="px-5 py-3">
                        <select value={editForm.timeSlot}
                          onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                          className="rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-gold">
                          {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <input type="number" min={1} max={12} value={editForm.guests}
                          onChange={(e) => setEditForm({ ...editForm, guests: e.target.value })}
                          className="w-14 rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-gold" />
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge}`}>{r.status}</span>
                      </td>
                      <td className="px-5 py-3 text-right space-x-2">
                        <button onClick={() => saveEdit(r._id)} className="text-xs font-medium text-emerald-600 hover:underline">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs font-medium text-gray-400 hover:underline">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-gray-900">{r.user?.name}</div>
                        <div className="text-xs text-gray-400">{r.user?.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 font-medium">
                        T{r.table?.tableNumber || '#'}
                        <span className="block text-[10px] text-gray-400">{r.table?.capacity} seats</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{r.date}</td>
                      <td className="px-5 py-3.5 text-gray-600">{r.timeSlot}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">{r.guests}</td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {r.status !== 'cancelled' && (
                          <div className="flex justify-end gap-3">
                            {r.status === 'pending' && (
                              <button onClick={() => confirmReservation(r._id)} className="text-xs font-semibold text-emerald-600 hover:underline">
                                Confirm
                              </button>
                            )}
                            <button onClick={() => startEdit(r)} className="text-xs font-medium text-gold hover:underline">Edit</button>
                            <button onClick={() => cancelReservation(r._id)} className="text-xs font-medium text-brick hover:underline">Cancel</button>
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
                <td colSpan={7} className="px-5 py-16 text-center">
                  <svg className="h-8 w-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 mb-0.5">No reservations found</p>
                  <p className="text-xs text-gray-400">Try adjusting your filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
