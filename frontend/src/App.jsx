import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  // ── Week 1 State ──
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    date: '', time: '', guests: 1,
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [availableTables, setAvailableTables] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Week 2 State ──
  const [activeTab, setActiveTab] = useState('book'); // book | manage | history | admin
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [updateData, setUpdateData] = useState({ date: '', time: '', guests: '', table_id: '' });
  const [historyEmail, setHistoryEmail] = useState('');
  const [historyResults, setHistoryResults] = useState(null);
  const [adminBookings, setAdminBookings] = useState(null);
  const [adminFilters, setAdminFilters] = useState({ date: '', status: '' });
  const [alternateSlots, setAlternateSlots] = useState(null);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);

  const clearFeedback = () => setMessage({ type: '', text: '' });

  // ── Week 1 Handlers (unchanged) ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setAvailableTables(null);
    setSelectedTableId(null);
    setAlternateSlots(null);
    setShowWaitlistForm(false);
    clearFeedback();
  };

  const checkAvailability = async () => {
    if (!formData.date || !formData.time || !formData.guests) {
      setMessage({ type: 'error', text: 'Please fill in date, time, and guest count.' });
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (formData.date < today) {
      setMessage({ type: 'error', text: 'Cannot book a table in the past.' });
      return;
    }
    setLoading(true);
    clearFeedback();
    setSelectedTableId(null);
    setAlternateSlots(null);
    setShowWaitlistForm(false);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/availability`, {
        params: { booking_date: formData.date, booking_time: formData.time, guest_count: formData.guests },
      });
      if (data.length > 0) {
        setAvailableTables(data);
        setMessage({ type: 'success', text: `${data.length} table(s) available for your booking.` });
      } else {
        setAvailableTables([]);
        setMessage({ type: 'error', text: 'No tables available for this date, time, and guest count.' });
        setShowWaitlistForm(true);
        // Fetch alternate slots
        try {
          const altRes = await axios.get(`${API_BASE_URL}/availability/alternatives`, {
            params: { booking_date: formData.date, booking_time: formData.time, guest_count: formData.guests },
          });
          if (altRes.data.available_alternatives.length > 0) {
            setAlternateSlots(altRes.data.available_alternatives);
          }
        } catch (_) {}
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Error checking availability.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!availableTables || availableTables.length === 0) {
      setMessage({ type: 'error', text: 'Please check availability first.' });
      return;
    }
    if (!selectedTableId) {
      setMessage({ type: 'error', text: 'Please select a table to book.' });
      return;
    }
    setLoading(true);
    clearFeedback();
    try {
      const { data } = await axios.post(`${API_BASE_URL}/bookings`, {
        user: { name: formData.name, email: formData.email, phone: formData.phone },
        booking_date: formData.date,
        booking_time: formData.time,
        guest_count: parseInt(formData.guests),
        table_id: selectedTableId,
      });
      setMessage({
        type: 'success',
        text: `🎉 Confirmed! ID: ${String(data.booking_id).substring(0, 8).toUpperCase()} | Table: ${data.table_name} | Guests: ${data.guest_count}`,
      });
      setFormData({ name: '', email: '', phone: '', date: '', time: '', guests: 1 });
      setAvailableTables(null);
      setSelectedTableId(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to create booking.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Week 2 Handlers ──
  const lookupBooking = async () => {
    if (!lookupId.trim()) { setMessage({ type: 'error', text: 'Enter a Booking ID.' }); return; }
    setLoading(true); clearFeedback(); setLookupResult(null);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/bookings/${lookupId.trim()}`);
      setLookupResult(data);
      setUpdateData({
        date: data.booking_date, time: data.booking_time,
        guests: data.guest_count, table_id: data.table_id,
      });
      setMessage({ type: 'success', text: 'Booking found.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Booking not found.' });
    } finally { setLoading(false); }
  };

  const handleUpdateBooking = async () => {
    if (!lookupResult) return;
    setLoading(true); clearFeedback();
    const payload = {};
    if (updateData.date) payload.booking_date = updateData.date;
    if (updateData.time) payload.booking_time = updateData.time;
    if (updateData.guests) payload.guest_count = parseInt(updateData.guests);
    if (updateData.table_id) payload.table_id = updateData.table_id;
    try {
      const { data } = await axios.put(`${API_BASE_URL}/bookings/${lookupResult.id}`, payload);
      setMessage({ type: 'success', text: `✅ ${data.message}! Table: ${data.table_name} | Guests: ${data.guest_count}` });
      setLookupResult(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Update failed.' });
    } finally { setLoading(false); }
  };

  const handleCancelBooking = async () => {
    if (!lookupResult) return;
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setLoading(true); clearFeedback();
    try {
      const { data } = await axios.patch(`${API_BASE_URL}/bookings/${lookupResult.id}/cancel`);
      setMessage({ type: 'success', text: `🚫 ${data.message}` });
      setLookupResult(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Cancel failed.' });
    } finally { setLoading(false); }
  };

  const fetchHistory = async () => {
    if (!historyEmail.trim()) { setMessage({ type: 'error', text: 'Enter your email.' }); return; }
    setLoading(true); clearFeedback(); setHistoryResults(null);
    try {
      // First find user by email via bookings list
      const { data: allBookings } = await axios.get(`${API_BASE_URL}/bookings`);
      const userBooking = allBookings.find(b => true); // We need user_id
      // Get all bookings and find user_id by checking booking details
      let userId = null;
      for (const b of allBookings.slice(0, 10)) {
        try {
          const { data: detail } = await axios.get(`${API_BASE_URL}/bookings/${b.id}`);
          if (detail.user?.email === historyEmail.trim()) { userId = detail.user_id; break; }
        } catch (_) {}
      }
      if (!userId) {
        setMessage({ type: 'error', text: 'No bookings found for this email.' });
        setLoading(false); return;
      }
      const { data } = await axios.get(`${API_BASE_URL}/users/${userId}/bookings`);
      setHistoryResults(data);
      setMessage({ type: 'success', text: `Found ${data.length} booking(s).` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to fetch history.' });
    } finally { setLoading(false); }
  };

  const handleWaitlistSubmit = async () => {
    if (!formData.name || !formData.email) {
      setMessage({ type: 'error', text: 'Name and email are required for waitlist.' }); return;
    }
    setLoading(true); clearFeedback();
    try {
      await axios.post(`${API_BASE_URL}/waitlist`, {
        name: formData.name, email: formData.email,
        guest_count: parseInt(formData.guests),
        booking_date: formData.date, booking_time: formData.time,
      });
      setMessage({ type: 'success', text: '📋 Added to waitlist! We\'ll notify you when a table opens.' });
      setShowWaitlistForm(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to join waitlist.' });
    } finally { setLoading(false); }
  };

  const fetchAdminBookings = async () => {
    setLoading(true); clearFeedback(); setAdminBookings(null);
    const params = {};
    if (adminFilters.date) params.filter_date = adminFilters.date;
    if (adminFilters.status) params.filter_status = adminFilters.status;
    try {
      const { data } = await axios.get(`${API_BASE_URL}/admin/bookings`, { params });
      setAdminBookings(data);
      setMessage({ type: 'success', text: `${data.length} booking(s) found.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to load bookings.' });
    } finally { setLoading(false); }
  };

  // ── Render ──
  return (
    <div className="page-bg">
      <div className="page-center">

        {/* Header */}
        <div className="header">
          <div className="header-icon">🍽️</div>
          <h1 className="header-title">Reserve Your Table</h1>
          <p className="header-sub">Book your perfect dining experience in seconds</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-nav">
          {[
            ['book', '📝 Book'], ['manage', '✏️ Manage'], ['history', '📜 History'], ['admin', '🔧 Admin']
          ].map(([key, label]) => (
            <button key={key} className={`tab-btn ${activeTab === key ? 'tab-btn--active' : ''}`}
              onClick={() => { setActiveTab(key); clearFeedback(); }}>
              {label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="card">

          {/* ═══════ TAB: BOOK ═══════ */}
          {activeTab === 'book' && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="section-heading"><span className="section-dot" /> Guest Information</div>
              <div className="field">
                <label className="field-label">Full Name</label>
                <input className="field-input" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Jane Doe" />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label">Email Address</label>
                  <input className="field-input" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
                </div>
                <div className="field">
                  <label className="field-label">Phone Number</label>
                  <input className="field-input" type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 9876543210" />
                </div>
              </div>

              <div className="section-heading section-heading--spaced"><span className="section-dot" /> Reservation Details</div>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label">Date</label>
                  <input className="field-input" type="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label className="field-label">Time</label>
                  <input className="field-input" type="time" name="time" value={formData.time} onChange={handleChange} required />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Number of Guests</label>
                <input className="field-input" type="number" name="guests" min="1" max="10" value={formData.guests} onChange={handleChange} required />
              </div>

              <button type="button" className="btn btn--secondary" onClick={checkAvailability} disabled={loading}>
                {loading ? (<><span className="spinner" /> Checking…</>) : '🔍  Check Availability'}
              </button>

              {/* Available Tables */}
              {availableTables && availableTables.length > 0 && (
                <div className="availability-box">
                  <p className="availability-title">Available Tables</p>
                  <div className="badge-row">
                    {availableTables.map((t) => (
                      <span key={t.id} className={`badge ${selectedTableId === t.id ? 'badge--selected' : ''}`}
                        onClick={() => setSelectedTableId(t.id)}>
                        🪑 {t.table_name} &bull; {t.capacity} seats
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternate Slot Suggestions */}
              {alternateSlots && alternateSlots.length > 0 && (
                <div className="alt-slots-box">
                  <p className="alt-slots-title">💡 Suggested Alternate Times</p>
                  <div className="badge-row">
                    {alternateSlots.map((slot) => (
                      <span key={slot} className="badge badge--alt"
                        onClick={() => { setFormData(p => ({ ...p, time: slot })); setAlternateSlots(null); setAvailableTables(null); setShowWaitlistForm(false); clearFeedback(); }}>
                        🕐 {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Waitlist */}
              {showWaitlistForm && (
                <div className="waitlist-box">
                  <p className="waitlist-title">📋 No tables? Join the Waitlist</p>
                  <p className="waitlist-sub">We'll let you know when a spot opens up.</p>
                  <button type="button" className="btn btn--waitlist" onClick={handleWaitlistSubmit} disabled={loading}>
                    {loading ? 'Joining…' : '🔔 Join Waitlist'}
                  </button>
                </div>
              )}

              {availableTables && availableTables.length > 0 && (
                <button type="submit" className="btn btn--primary" disabled={loading || !selectedTableId}>
                  {loading ? 'Confirming…' : '✅  Confirm Reservation'}
                </button>
              )}

              {message.text && <div className={`feedback feedback--${message.type}`}>{message.text}</div>}
            </form>
          )}

          {/* ═══════ TAB: MANAGE ═══════ */}
          {activeTab === 'manage' && (
            <div>
              <div className="section-heading"><span className="section-dot" /> Manage Booking</div>
              <div className="field">
                <label className="field-label">Booking ID</label>
                <input className="field-input" type="text" placeholder="Enter booking ID" value={lookupId}
                  onChange={e => { setLookupId(e.target.value); setLookupResult(null); clearFeedback(); }} />
              </div>
              <button className="btn btn--secondary" onClick={lookupBooking} disabled={loading}>
                {loading ? (<><span className="spinner" /> Searching…</>) : '🔍 Look Up Booking'}
              </button>

              {lookupResult && (
                <div className="manage-result">
                  <div className="manage-info">
                    <p><strong>Status:</strong> <span className={`status-badge status-badge--${lookupResult.status}`}>{lookupResult.status}</span></p>
                    <p><strong>Date:</strong> {lookupResult.booking_date} &nbsp;|&nbsp; <strong>Time:</strong> {lookupResult.booking_time}</p>
                    <p><strong>Guests:</strong> {lookupResult.guest_count}</p>
                  </div>

                  {lookupResult.status === 'confirmed' && (
                    <>
                      <div className="section-heading section-heading--spaced"><span className="section-dot" /> Update Details</div>
                      <div className="grid-2">
                        <div className="field">
                          <label className="field-label">New Date</label>
                          <input className="field-input" type="date" value={updateData.date}
                            onChange={e => setUpdateData(p => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div className="field">
                          <label className="field-label">New Time</label>
                          <input className="field-input" type="time" value={updateData.time}
                            onChange={e => setUpdateData(p => ({ ...p, time: e.target.value }))} />
                        </div>
                      </div>
                      <div className="field">
                        <label className="field-label">New Guest Count</label>
                        <input className="field-input" type="number" min="1" value={updateData.guests}
                          onChange={e => setUpdateData(p => ({ ...p, guests: e.target.value }))} />
                      </div>
                      <div className="btn-row">
                        <button className="btn btn--primary" onClick={handleUpdateBooking} disabled={loading}>
                          {loading ? 'Updating…' : '✏️ Update Booking'}
                        </button>
                        <button className="btn btn--danger" onClick={handleCancelBooking} disabled={loading}>
                          {loading ? 'Cancelling…' : '🚫 Cancel Booking'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {message.text && <div className={`feedback feedback--${message.type}`}>{message.text}</div>}
            </div>
          )}

          {/* ═══════ TAB: HISTORY ═══════ */}
          {activeTab === 'history' && (
            <div>
              <div className="section-heading"><span className="section-dot" /> Booking History</div>
              <div className="field">
                <label className="field-label">Your Email</label>
                <input className="field-input" type="email" placeholder="you@example.com" value={historyEmail}
                  onChange={e => { setHistoryEmail(e.target.value); setHistoryResults(null); clearFeedback(); }} />
              </div>
              <button className="btn btn--secondary" onClick={fetchHistory} disabled={loading}>
                {loading ? (<><span className="spinner" /> Loading…</>) : '📜 View History'}
              </button>

              {historyResults && historyResults.length > 0 && (
                <div className="history-list">
                  {historyResults.map((b) => (
                    <div key={b.booking_id} className="history-card">
                      <div className="history-card-header">
                        <span className="history-table">{b.table_name}</span>
                        <span className={`status-badge status-badge--${b.booking_status}`}>{b.booking_status}</span>
                      </div>
                      <p className="history-detail">📅 {b.booking_date} &nbsp;|&nbsp; 🕐 {b.booking_time} &nbsp;|&nbsp; 👥 {b.guest_count}</p>
                      <p className="history-id">ID: {String(b.booking_id).substring(0, 8).toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              )}
              {historyResults && historyResults.length === 0 && (
                <div className="feedback feedback--error">No bookings found.</div>
              )}

              {message.text && <div className={`feedback feedback--${message.type}`}>{message.text}</div>}
            </div>
          )}

          {/* ═══════ TAB: ADMIN ═══════ */}
          {activeTab === 'admin' && (
            <div>
              <div className="section-heading"><span className="section-dot" /> Admin — All Bookings</div>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label">Filter by Date</label>
                  <input className="field-input" type="date" value={adminFilters.date}
                    onChange={e => setAdminFilters(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Filter by Status</label>
                  <select className="field-input" value={adminFilters.status}
                    onChange={e => setAdminFilters(p => ({ ...p, status: e.target.value }))}>
                    <option value="">All</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <button className="btn btn--secondary" onClick={fetchAdminBookings} disabled={loading}>
                {loading ? (<><span className="spinner" /> Loading…</>) : '📊 Load Bookings'}
              </button>

              {adminBookings && adminBookings.length > 0 && (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Customer</th><th>Table</th><th>Date</th><th>Time</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {adminBookings.map((b) => (
                        <tr key={b.booking_id}>
                          <td>{b.customer_name}</td>
                          <td>{b.table_name}</td>
                          <td>{b.booking_date}</td>
                          <td>{b.booking_time}</td>
                          <td><span className={`status-badge status-badge--${b.status}`}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {adminBookings && adminBookings.length === 0 && (
                <div className="feedback feedback--error">No bookings found with these filters.</div>
              )}

              {message.text && <div className={`feedback feedback--${message.type}`}>{message.text}</div>}
            </div>
          )}

        </div>

        <p className="footer-note">Powered by FastAPI + Supabase</p>
      </div>
    </div>
  );
}

export default App;
