import { useEffect, useState } from 'react';
import { api, TIME_SLOTS } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEFAULT_SLOTS = [
  '12:00-13:30',
  '13:30-15:00',
  '18:00-19:30',
  '19:30-21:00',
  '21:00-22:30',
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Form States
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState((TIME_SLOTS || DEFAULT_SLOTS)[0]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableSlots = TIME_SLOTS || DEFAULT_SLOTS;

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedTimeSlot]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tableRes, resRes] = await Promise.allSettled([
        api.getTables ? api.getTables() : Promise.resolve([]),
        api.getReservations ? api.getReservations() : Promise.resolve([])
      ]);

      if (tableRes.status === 'fulfilled') {
        const val = tableRes.value;
        const list = Array.isArray(val) ? val : (val?.tables || val?.data || []);
        setTables(list);
      }

      if (resRes.status === 'fulfilled') {
        const val = resRes.value;
        const list = Array.isArray(val) ? val : (val?.reservations || val?.data || []);
        setReservations(list);
      }
    } catch (err) {
      if (addToast) addToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      if (addToast) addToast('Please select a table on the floor plan', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createReservation({
        tableId: selectedTable._id || selectedTable.id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        partySize: Number(partySize),
        specialRequests,
      });

      if (addToast) addToast('Reservation booked successfully!', 'success');
      setSelectedTable(null);
      setSpecialRequests('');
      fetchData();
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to create reservation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      if (api.cancelReservation) {
        await api.cancelReservation(id);
      }
      if (addToast) addToast('Reservation cancelled', 'info');
      fetchData();
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to cancel reservation', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#111827' }}>
          Welcome back, {user?.name || 'Valued Guest'}! 👋
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
          Select your date and preferred time slot to view available tables and place a reservation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Interactive Booking & Floor Plan */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem', color: '#111827' }}>
            Book a Table
          </h2>

          <form onSubmit={handleCreateReservation}>
            {/* Date & Time Slot Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#374151' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#374151' }}>
                  Time Slot
                </label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Table Selection Floor Plan */}
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
              Select an Available Table
            </label>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading tables...</div>
            ) : (tables || []).length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280', border: '1px dashed #d1d5db', borderRadius: '6px' }}>
                No tables found in system.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {(tables || []).map((table) => {
                  const isSelected = selectedTable?.(_id || selectedTable?.id) === (table._id || table.id);
                  return (
                    <div
                      key={table._id || table.id}
                      onClick={() => setSelectedTable(table)}
                      style={{
                        padding: '1rem 0.5rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid #b34700' : '1px solid #e5e7eb',
                        backgroundColor: isSelected ? '#fff7ed' : '#f9fafb',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: isSelected ? '#b34700' : '#111827' }}>
                        Table #{table.number || table.tableNumber}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        Cap: {table.capacity} guests
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Party Size & Special Requests */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#374151' }}>
                Party Size (Guests)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#374151' }}>
                Special Requests (Optional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="High chair, window seat, allergy notes..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', minHeight: '60px' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedTable}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: !selectedTable ? '#9ca3af' : '#b34700',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: !selectedTable ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Confirming...' : selectedTable ? `Confirm Reservation for Table #${selectedTable.number || selectedTable.tableNumber}` : 'Select a Table Above'}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Bookings List */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem', color: '#111827' }}>
            My Active Reservations
          </h2>

          {(reservations || []).length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', border: '1px dashed #d1d5db', borderRadius: '6px' }}>
              You have no active reservations yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(reservations || []).map((res) => (
                <div
                  key={res._id || res.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#111827' }}>
                      Table #{res.table?.number || res.tableNumber || 'N/A'} — {res.date}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '0.25rem' }}>
                      Slot: {res.timeSlot} | Guests: {res.partySize || res.guests || 2}
                    </div>
                    {res.specialRequests && (
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic', marginTop: '0.25rem' }}>
                        "{res.specialRequests}"
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleCancelReservation(res._id || res.id)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}