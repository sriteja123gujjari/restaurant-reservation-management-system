import React, { useEffect, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setError('');
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.set('date', dateFilter);
      if (statusFilter) params.set('status', statusFilter);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const data = await api.getAllReservations(token, qs);
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
    if (!window.confirm('Cancel this booking? Table will be released immediately.')) return;
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
    { label: 'Total Bookings', value: reservations.length, color: 'text-slate-900', bg: 'bg-slate-100' },
    { label: 'Confirmed Covers', value: `${totalCovers} guests`, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Pending Approval', value: pendingList.length, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Cancelled', value: cancelledList.length, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-slideup">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">
            Admin Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Reservation Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time table allocations, status updates, and party records
          </p>
        </div>

        <button
          onClick={load}
          disabled={isLoading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-district hover:bg-orange-600 transition-all"
        >
          {isLoading ? 'Updating...' : 'Sync Database'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          return (
            <div key={s.label} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  {s.label}
                </span>
              </div>
              <span className={`text-2xl font-black font-heading ${s.color}`}>{s.value}</span>
            </div>
          );
        })}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-card mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Date Filter
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-district shadow-xs"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-district shadow-xs"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          {(dateFilter || statusFilter) && (
            <button
              onClick={() => { setDateFilter(''); setStatusFilter(''); }}
              className="text-xs font-bold text-district hover:underline mb-2 px-2"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing <strong>{reservations.length}</strong> total bookings
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-orange-800 font-semibold">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200/90 bg-white shadow-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/70">
              <th className="px-6 py-4 text-left">Guest Name & Email</th>
              <th className="px-6 py-4 text-left">Table</th>
              <th className="px-6 py-4 text-left">Dining Date</th>
              <th className="px-6 py-4 text-left">Time Window</th>
              <th className="px-6 py-4 text-left">Covers</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => {
              const isEditing = editingId === r._id;

              const statusBadge = {
                confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                pending: 'bg-amber-50 text-amber-800 border-amber-200',
                cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
              }[r.status] || 'bg-slate-100 text-slate-500 border-slate-200';

              return (
                <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  {isEditing ? (
                    <>
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900">{r.user?.name}</div>
                        <div className="text-xs text-slate-400">{r.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-extrabold">T{r.table?.tableNumber}</td>
                      <td className="px-6 py-4">
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-district font-semibold"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={editForm.timeSlot}
                          onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-district font-semibold"
                        >
                          {TIME_SLOTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={editForm.guests}
                          onChange={(e) => setEditForm({ ...editForm, guests: e.target.value })}
                          className="w-16 rounded-xl border border-slate-200 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-district font-semibold"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${statusBadge}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => saveEdit(r._id)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:underline"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900">{r.user?.name}</div>
                        <div className="text-xs text-slate-400">{r.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-extrabold">
                        <div>
                          <span>Table #{r.table?.tableNumber || '#'}</span>
                        </div>
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {r.table?.capacity || 2} seats capacity
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-semibold">{r.date}</td>
                      <td className="px-6 py-4 text-slate-700 font-semibold">{r.timeSlot}</td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">{r.guests || 2}p</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${statusBadge}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {r.status !== 'cancelled' && (
                          <div className="flex justify-end items-center gap-3">
                            {r.status === 'pending' && (
                              <button
                                onClick={() => confirmReservation(r._id)}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                              >
                                Confirm
                              </button>
                            )}
                            <button
                              onClick={() => startEdit(r)}
                              className="text-xs font-bold text-slate-600 hover:text-district transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => cancelReservation(r._id)}
                              className="text-xs font-bold text-orange-600 hover:text-orange-800 transition-colors"
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
                <td colSpan={7} className="px-6 py-16 text-center">
                  <p className="text-sm font-extrabold text-slate-900 mb-0.5 font-heading">No reservations found</p>
                  <p className="text-xs text-slate-400">Try adjusting your date or status filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
