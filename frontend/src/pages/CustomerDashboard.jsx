import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { api, TIME_SLOTS } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import InteractiveFloorPlan, { TABLE_METADATA } from '../components/InteractiveFloorPlan';

// Fallback time slots formatted strictly to match backend expectations
const FALLBACK_SLOTS = [
  '12:00 - 13:30',
  '13:30 - 15:00',
  '18:00 - 19:30',
  '19:30 - 21:00',
  '21:00 - 22:30',
];

// Helper to verify a valid 24-character hexadecimal MongoDB ObjectId
const isMongoId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

// Curated fallback tables if backend initial load is pending (never inject fake ObjectIds)
const DEFAULT_TABLES = [
  { tableNumber: 1, capacity: 2 },
  { tableNumber: 2, capacity: 2 },
  { tableNumber: 3, capacity: 2 },
  { tableNumber: 4, capacity: 4 },
  { tableNumber: 5, capacity: 4 },
  { tableNumber: 6, capacity: 4 },
  { tableNumber: 7, capacity: 4 },
  { tableNumber: 8, capacity: 6 },
  { tableNumber: 9, capacity: 6 },
  { tableNumber: 10, capacity: 8 },
];

// Quick suggestion chips for special dining requests
const PRESET_REQUESTS = [
  'Window seat preferred',
  'Quiet booth for conversation',
  'Sommelier wine pairing',
  'Anniversary / Romance setup',
  'Gluten-free / Food allergies',
  'Birthday surprise dessert',
];

// Dining Occasions
const OCCASIONS = [
  { id: 'romantic', label: 'Romantic Date', desc: 'Candlelit & intimate' },
  { id: 'anniversary', label: 'Anniversary', desc: 'Celebration setup' },
  { id: 'business', label: 'Business Dinner', desc: 'Quiet & acoustic privacy' },
  { id: 'birthday', label: 'Birthday Feast', desc: 'Complimentary dessert' },
  { id: 'casual', label: 'Chef Tasting', desc: 'Multi-course culinary journey' },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  // Safely extract toast notifier with defensive fallback
  const toastCtx = useToast ? useToast() : null;
  const notify = useCallback(
    (message, type = 'info') => {
      if (toastCtx?.showToast) {
        toastCtx.showToast(message, type);
      } else if (toastCtx?.addToast) {
        toastCtx.addToast(message, type);
      } else {
        console.log(`[Toast ${type}]:`, message);
      }
    },
    [toastCtx]
  );

  // Tab state: 'reserve' or 'bookings'
  const [activeTab, setActiveTab] = useState(
    location.pathname === '/dashboard' ? 'bookings' : 'reserve'
  );

  // Core Data States
  const [allTables, setAllTables] = useState(DEFAULT_TABLES);
  const [availableTables, setAvailableTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);

  // Booking Form States
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(
    TIME_SLOTS?.[0] || FALLBACK_SLOTS[0]
  );
  const [selectedTable, setSelectedTable] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [selectedOccasion, setSelectedOccasion] = useState('romantic');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & UI States
  const [cancellationTarget, setCancellationTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingFilterTab, setBookingFilterTab] = useState('all');

  const activeTimeSlots = TIME_SLOTS && TIME_SLOTS.length > 0 ? TIME_SLOTS : FALLBACK_SLOTS;

  const parseTableList = (res) => {
    if (Array.isArray(res) && res.length > 0) return res;
    if (Array.isArray(res?.tables) && res.tables.length > 0) return res.tables;
    if (Array.isArray(res?.data) && res.data.length > 0) return res.data;
    return [];
  };

  const parseReservationList = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.reservations)) return res.reservations;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };

  const fetchAllTables = useCallback(async () => {
    try {
      if (api.getTables) {
        const raw = await api.getTables();
        const list = parseTableList(raw);
        if (list.length > 0) {
          setAllTables(list);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch full table floor plan, using fallback tables:', err);
    }
  }, []);

  const fetchAvailability = useCallback(async () => {
    setIsLoadingTables(true);
    try {
      if (api.getAvailableTables) {
        const raw = await api.getAvailableTables(selectedDate, selectedTimeSlot);
        const list = parseTableList(raw);
        setAvailableTables(list);
        if (list.length > 0) {
          // Sync real DB documents into allTables so all tables have genuine ObjectIds
          setAllTables((prev) => {
            const map = new Map(list.map((t) => [Number(t.tableNumber || t.number), t]));
            return prev.map((t) => {
              const num = Number(t.tableNumber || t.number);
              return map.has(num) ? { ...t, ...map.get(num) } : t;
            });
          });
        }
      } else {
        setAvailableTables(allTables);
      }
    } catch (err) {
      console.warn('Live availability fetch failed, showing available tables:', err);
      setAvailableTables(allTables);
    } finally {
      setIsLoadingTables(false);
    }
  }, [selectedDate, selectedTimeSlot, allTables]);

  const fetchReservations = useCallback(async () => {
    setIsLoadingReservations(true);
    try {
      if (api.getReservations) {
        const raw = await api.getReservations();
        const list = parseReservationList(raw);
        setReservations(list);
      }
    } catch (err) {
      console.error('Failed to load user reservations:', err);
    } finally {
      setIsLoadingReservations(false);
    }
  }, []);

  useEffect(() => {
    fetchAllTables();
    fetchReservations();
  }, [fetchAllTables, fetchReservations]);

  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      fetchAvailability();
    }
  }, [selectedDate, selectedTimeSlot, fetchAvailability]);

  useEffect(() => {
    if (selectedTable && availableTables.length > 0) {
      const selectedId = (selectedTable._id || selectedTable.id)?.toString();
      const selectedNum = (selectedTable.tableNumber || selectedTable.number)?.toString();
      const stillAvailable = availableTables.some(
        (t) =>
          (t._id || t.id)?.toString() === selectedId ||
          (t.tableNumber || t.number)?.toString() === selectedNum
      );
      if (!stillAvailable) {
        setSelectedTable(null);
      }
    }
  }, [availableTables, selectedTable]);

  const availableTableIdSet = useMemo(() => {
    const set = new Set();
    const list = availableTables.length > 0 ? availableTables : allTables;
    list.forEach((t) => {
      const id = (t._id || t.id)?.toString();
      if (id) set.add(id);
      const num = (t.tableNumber || t.number)?.toString();
      if (num) set.add(num);
    });
    return set;
  }, [availableTables, allTables]);

  const floorPlanTables = useMemo(() => {
    const baseList = allTables.length > 0 ? allTables : DEFAULT_TABLES;
    return baseList.map((table) => {
      const num = Number(table.tableNumber || table.number);
      // Prefer real MongoDB document from availableTables or allTables
      const dbMatch =
        availableTables.find((t) => Number(t.tableNumber || t.number) === num && isMongoId(t._id || t.id)) ||
        allTables.find((t) => Number(t.tableNumber || t.number) === num && isMongoId(t._id || t.id));

      const effectiveTable = dbMatch ? { ...table, ...dbMatch } : table;
      const id = (effectiveTable._id || effectiveTable.id)?.toString();
      const numStr = String(num);

      const isFree =
        availableTables.length === 0
          ? true
          : availableTableIdSet.has(id) || availableTableIdSet.has(numStr);

      const isSelected =
        selectedTable &&
        ((selectedTable._id && (selectedTable._id === id || selectedTable.id === id)) ||
          Number(selectedTable.tableNumber || selectedTable.number) === num);

      return {
        ...effectiveTable,
        isFree,
        isSelected,
      };
    });
  }, [allTables, availableTables, availableTableIdSet, selectedTable]);

  const handleSelectTable = (table) => {
    if (!table) {
      setSelectedTable(null);
      return;
    }
    if (!table.isFree) {
      notify(`Table #${table.tableNumber || table.number} is already booked for this slot.`, 'info');
      return;
    }

    const num = Number(table.tableNumber || table.number);
    const dbMatch =
      availableTables.find((t) => Number(t.tableNumber || t.number) === num && isMongoId(t._id || t.id)) ||
      allTables.find((t) => Number(t.tableNumber || t.number) === num && isMongoId(t._id || t.id));

    const targetTable = dbMatch ? { ...table, ...dbMatch } : table;
    setSelectedTable(targetTable);
    if (Number(partySize) > (targetTable.capacity || 2)) {
      setPartySize(targetTable.capacity || 2);
    }
    notify(`Table #${targetTable.tableNumber || targetTable.number} selected.`, 'info');
  };

  const handleAppendRequest = (chip) => {
    setSpecialRequests((prev) => {
      if (!prev.trim()) return chip;
      if (prev.includes(chip)) return prev;
      return `${prev.trim()}, ${chip}`;
    });
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();

    if (!selectedTable) {
      notify('Please select a table on the floor plan.', 'error');
      return;
    }

    const maxCap = selectedTable.capacity || 2;
    if (Number(partySize) > maxCap) {
      notify(`Table #${selectedTable.tableNumber || selectedTable.number} only accommodates up to ${maxCap} guests.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const occasionObj = OCCASIONS.find((o) => o.id === selectedOccasion);
      const combinedNotes = [
        occasionObj ? `Occasion: ${occasionObj.label}` : '',
        specialRequests.trim(),
      ]
        .filter(Boolean)
        .join(' | ');

      // Resolve genuine MongoDB ObjectId, falling back to tableNumber if needed
      let finalTableId = selectedTable._id || selectedTable.id;
      if (!isMongoId(finalTableId)) {
        const num = Number(selectedTable.tableNumber || selectedTable.number);
        const match =
          availableTables.find((t) => Number(t.tableNumber || t.number) === num && isMongoId(t._id || t.id)) ||
          allTables.find((t) => Number(t.tableNumber || t.number) === num && isMongoId(t._id || t.id));
        finalTableId = match?._id || num;
      }

      const payload = {
        tableId: finalTableId,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        guests: Number(partySize),
        partySize: Number(partySize),
        specialRequests: combinedNotes,
      };

      await api.createReservation(payload);

      notify('Reservation confirmed.', 'success');
      setSelectedTable(null);
      setSpecialRequests('');

      await Promise.all([fetchAvailability(), fetchReservations()]);
      setActiveTab('bookings');
    } catch (err) {
      console.error('Reservation creation error:', err);
      const msg =
        err.status === 409
          ? 'This table was just reserved by another guest. Please choose another table.'
          : err.message || 'Failed to complete reservation. Please try again.';
      notify(msg, 'error');
      fetchAvailability();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellationTarget) return;

    setIsCancelling(true);
    try {
      const targetId = cancellationTarget._id || cancellationTarget.id;
      await api.cancelReservation(targetId);

      notify('Reservation cancelled.', 'info');
      setCancellationTarget(null);

      await Promise.all([fetchReservations(), fetchAvailability()]);
    } catch (err) {
      console.error('Cancellation error:', err);
      notify(err.message || 'Could not cancel reservation.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const displayedReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (bookingFilterTab === 'all') return true;
      if (bookingFilterTab === 'confirmed') return r.status === 'confirmed';
      if (bookingFilterTab === 'cancelled') return r.status === 'cancelled';
      return true;
    });
  }, [reservations, bookingFilterTab]);

  const activeReservationsCount = useMemo(() => {
    return reservations.filter((r) => r.status === 'confirmed').length;
  }, [reservations]);

  const handleSetDatePreset = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-slideup">
      {/* 1. CLEAN RESTAURANT HEADER CARD */}
      <section className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden mb-8 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 relative">
          <div className="max-w-2xl relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                4.9 Rating (1.4k+ reviews)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-district text-xs font-bold border border-orange-200">
                ReservePrime
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                Downtown Skyline
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900">
              Welcome, {user?.name || user?.email?.split('@')[0] || 'Guest'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed font-sans">
              Choose your table on the interactive floor plan. Instant confirmation with zero deposit required.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
              <span>Modern European & Pan-Asian</span>
              <span>•</span>
              <span>Sommelier Bar</span>
              <span>•</span>
              <span>10 Curated Tables</span>
              <span>•</span>
              <span className="text-district font-semibold">Prime Seating Guarantee</span>
            </div>
          </div>

          {/* Quick Status Pill */}
          <div className="flex sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Active Bookings
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-slate-900 font-heading">
                    {activeReservationsCount}
                  </span>
                  {activeReservationsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs font-bold text-district hover:underline"
                    >
                      View Details →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MINIMALIST TAB SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('reserve')}
            className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
              activeTab === 'reserve'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reserve a Table
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 ${
              activeTab === 'bookings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>My Bookings</span>
            {activeReservationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-orange-100 text-district">
                {activeReservationsCount}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchAvailability();
            fetchReservations();
            notify('Refreshed availability', 'info');
          }}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
        >
          {isLoadingTables ? 'Updating...' : 'Refresh Availability'}
        </button>
      </div>

      {/* 3. TAB 1: RESERVATION & FLOOR PLAN */}
      {activeTab === 'reserve' && (
        <div className="space-y-6">
          {/* Schedule Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-heading">
                Step 1: Dining Date & Time
              </h2>
              <span className="text-xs font-semibold text-emerald-700">
                Instant Confirmation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
              {/* Date Input */}
              <div className="md:col-span-5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Date
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetDatePreset(0)}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetDatePreset(1)}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetDatePreset(2)}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      +2 Days
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-district focus:border-transparent font-medium transition-all"
                  required
                />
              </div>

              {/* Time Slot Select */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Seating Window
                </label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-district focus:border-transparent font-medium transition-all cursor-pointer"
                >
                  {activeTimeSlots.map((slot) => {
                    const isDinner = slot.startsWith('18') || slot.startsWith('19') || slot.startsWith('21');
                    return (
                      <option key={slot} value={slot}>
                        {slot} {isDinner ? '(Dinner)' : '(Lunch)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Party Size */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Party Size
                </label>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {[1, 2, 4, 6, 8].map((size) => {
                    const isCurrent = partySize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPartySize(size)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-district text-white shadow-xs'
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        {size}p
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Floor Plan */}
          <InteractiveFloorPlan
            tables={floorPlanTables}
            selectedTable={selectedTable}
            onSelectTable={handleSelectTable}
            isLoading={isLoadingTables}
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
          />

          {/* Reservation Confirmation Section */}
          <div id="booking-form" className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-card">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-heading">
                Step 2: Table & Guest Details
              </h2>
              {selectedTable && (
                <button
                  type="button"
                  onClick={() => setSelectedTable(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-district"
                >
                  Change Table
                </button>
              )}
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-6">
              {/* Selected Table Callout */}
              {selectedTable ? (
                <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {TABLE_METADATA[selectedTable.tableNumber || selectedTable.number]?.image && (
                      <img
                        src={TABLE_METADATA[selectedTable.tableNumber || selectedTable.number]?.image}
                        alt="Selected Zone"
                        className="h-16 w-20 rounded-lg object-cover border border-orange-200/80 shrink-0 shadow-xs"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-slate-900 font-heading">
                          Table #{selectedTable.tableNumber || selectedTable.number}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white text-district border border-orange-200">
                          {TABLE_METADATA[selectedTable.tableNumber || selectedTable.number]?.zoneName || 'Main Dining'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {selectedDate} • {selectedTimeSlot} • Accommodates up to {selectedTable.capacity} guests max
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md self-start sm:self-auto shrink-0">
                    Table Available
                  </span>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center sm:text-left">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    No Table Selected
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any available green table on the floor plan above to proceed.
                  </p>
                </div>
              )}

              {/* Guest Party Stepper */}
              {selectedTable && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Guests
                    </label>
                    <span className="text-xs text-slate-500">
                      Limit: {selectedTable.capacity} guests
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => {
                      const isCurrent = partySize === size;
                      const exceedsTable = size > (selectedTable.capacity || 2);

                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={exceedsTable}
                          onClick={() => setPartySize(size)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            isCurrent
                              ? 'bg-district text-white border-district shadow-xs'
                              : exceedsTable
                              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-40'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {size}p
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dining Occasion Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Occasion
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {OCCASIONS.map((occ) => {
                    const isSelected = selectedOccasion === occ.id;
                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => setSelectedOccasion(occ.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-orange-50 border-district text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">{occ.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{occ.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Special Requests <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Window booth preferred, sommelier pairing, food allergies..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-district focus:border-transparent font-medium transition-all resize-none"
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PRESET_REQUESTS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleAppendRequest(chip)}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedTable}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all duration-200 ${
                    isSubmitting || !selectedTable
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-district hover:bg-orange-600 active:scale-[0.99] shadow-sm'
                  }`}
                >
                  {isSubmitting
                    ? 'Confirming Reservation...'
                    : selectedTable
                    ? `Confirm Table #${selectedTable.tableNumber || selectedTable.number} Reservation`
                    : 'Select a Table on Floor Plan to Reserve'}
                </button>
                <div className="flex items-center justify-center gap-3 mt-2.5 text-xs text-slate-400">
                  <span>Zero cancellation fee</span>
                  <span>•</span>
                  <span>Instant confirmation</span>
                  <span>•</span>
                  <span>Prime Priority Seating Guarantee</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. TAB 2: MY RESERVATIONS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-card">
            {/* Header & Status Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">
                  My Bookings
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Present booking details upon arrival at the host stand
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setBookingFilterTab('all')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    bookingFilterTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  All ({reservations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingFilterTab('confirmed')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    bookingFilterTab === 'confirmed'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Active ({reservations.filter((r) => r.status === 'confirmed').length})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingFilterTab('cancelled')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    bookingFilterTab === 'cancelled'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Cancelled ({reservations.filter((r) => r.status === 'cancelled').length})
                </button>
              </div>
            </div>

            {/* Bookings List */}
            {isLoadingReservations ? (
              <div className="py-20 text-center text-sm font-semibold text-slate-500">
                Loading reservations...
              </div>
            ) : displayedReservations.length === 0 ? (
              <div className="py-16 px-4 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800">
                  No reservations found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {bookingFilterTab === 'all'
                    ? "You haven't made any reservations yet. Use the floor plan to book a table."
                    : `No ${bookingFilterTab} reservations in your dining history.`}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('reserve')}
                  className="mt-4 px-4 py-2 rounded-lg text-xs font-bold text-white bg-district hover:bg-orange-600 transition-all"
                >
                  Go to Floor Plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedReservations.map((res) => {
                  const resId = res._id || res.id;
                  const tableNumber = res.table?.tableNumber || res.tableNumber || res.table?.number || 1;
                  const isConfirmed = res.status === 'confirmed';
                  const meta = TABLE_METADATA[tableNumber] || {
                    zoneName: 'Main Dining Hall',
                  };

                  return (
                    <div
                      key={resId}
                      className={`rounded-2xl border p-5 transition-all ${
                        isConfirmed
                          ? 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                          : 'border-slate-200 bg-slate-50 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-base">
                              Table #{tableNumber}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {meta.zoneName}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Pass #{resId?.slice(-6).toUpperCase()}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            isConfirmed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {res.status || 'Confirmed'}
                        </span>
                      </div>

                      <div className="py-3 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="block text-[10px] uppercase font-semibold text-slate-400">Date</span>
                          <span className="font-semibold text-slate-800">{res.date}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-semibold text-slate-400">Time</span>
                          <span className="font-semibold text-slate-800">{res.timeSlot}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-semibold text-slate-400">Guests</span>
                          <span className="font-semibold text-slate-800">{res.guests || res.partySize || 2} People</span>
                        </div>
                      </div>

                      {res.specialRequests && (
                        <div className="text-xs bg-slate-50 text-slate-600 p-2.5 rounded-lg border border-slate-100 mb-3 italic">
                          "{res.specialRequests}"
                        </div>
                      )}

                      {isConfirmed && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-emerald-700 font-medium">
                            Table Guaranteed
                          </span>

                          <button
                            type="button"
                            onClick={() => setCancellationTarget(res)}
                            className="text-xs font-semibold text-slate-400 hover:text-orange-600 hover:underline transition-colors py-1 px-2 rounded"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. CANCELLATION MODAL */}
      {cancellationTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadein">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Cancel Table Reservation?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to cancel your reservation for{' '}
              <strong className="text-slate-900">
                Table #{cancellationTarget.table?.tableNumber || cancellationTarget.tableNumber}
              </strong>{' '}
              on <strong>{cancellationTarget.date}</strong> at{' '}
              <strong>{cancellationTarget.timeSlot}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancellationTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}