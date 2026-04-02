import React, { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiClipboard, FiClock, FiEye, FiHome, FiPlusSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../api/bookingApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import BookingStatusBadge from '../Bookings/BookingStatusBadge';
import { ROOMS } from '../../utils/constants';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserBookings();
  }, []);

  const loadUserBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getUserBookings(1);
      setBookings(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load user dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((booking) => booking.status === 'PENDING').length;
    const approvedToday = bookings.filter((booking) => {
      if (booking.status !== 'APPROVED') return false;
      const start = new Date(booking.startTime);
      const now = new Date();
      return (
        start.getFullYear() === now.getFullYear() &&
        start.getMonth() === now.getMonth() &&
        start.getDate() === now.getDate()
      );
    }).length;

    const availableRooms = ROOMS.length;

    const recentBookings = [...bookings]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 6);

    return {
      total,
      pending,
      approvedToday,
      availableRooms,
      recentBookings,
    };
  }, [bookings]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

  const formatTimeRange = (start, end) => {
    const format = (value) =>
      new Date(value).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });

    return `${format(start)} - ${format(end)}`;
  };

  const currentUser =
    localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Campus User';
  const greetingName = (currentUser || 'User').split('@')[0];

  const trendPercent = (value) =>
    value === 0 ? '0%' : `${Math.min(99, Math.max(1, value))}%`;

  const approvedTrend = bookings.length
    ? Math.round((analytics.approvedToday / bookings.length) * 100)
    : 0;

  const pendingTrend = bookings.length
    ? Math.round((analytics.pending / bookings.length) * 100)
    : 0;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="user-dashboard-page">
      <div className="user-dashboard-top">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {greetingName}. Here's what's happening today.</p>
        </div>

        <div className="user-dashboard-actions">
          <Link to="/bookings" className="user-action-btn user-action-secondary">
            <FiEye /> View Requests
          </Link>
          <Link to="/bookings/new" className="user-action-btn user-action-primary">
            <FiPlusSquare /> New Booking
          </Link>
        </div>
      </div>

      <div className="user-analytics-grid user-dashboard-cards">
        <article className="user-analytics-card user-summary-card">
          <div>
            <p>Total Bookings</p>
            <div className="metric-row">
              <h3>{analytics.total}</h3>
              <small className="trend-up">↑ {trendPercent(analytics.total)}</small>
            </div>
          </div>
          <div className="analytics-icon green"><FiClipboard /></div>
        </article>

        <article className="user-analytics-card user-summary-card">
          <div>
            <p>Pending Requests</p>
            <div className="metric-row">
              <h3>{analytics.pending}</h3>
              <small className="trend-down">↓ {trendPercent(pendingTrend)}</small>
            </div>
          </div>
          <div className="analytics-icon green"><FiClock /></div>
        </article>

        <article className="user-analytics-card user-summary-card">
          <div>
            <p>Approved Today</p>
            <div className="metric-row">
              <h3>{analytics.approvedToday}</h3>
              <small className="trend-up">↑ {trendPercent(approvedTrend)}</small>
            </div>
          </div>
          <div className="analytics-icon green"><FiCheckCircle /></div>
        </article>

        <article className="user-analytics-card user-summary-card">
          <div>
            <p>Available Rooms</p>
            <h3>{analytics.availableRooms}</h3>
          </div>
          <div className="analytics-icon green"><FiHome /></div>
        </article>
      </div>

      <section className="dashboard-requests-card user-recent-card">
        <div className="requests-header user-recent-header">
          <h3>Recent Bookings</h3>
          <Link to="/bookings" className="recent-view-link">View All →</Link>
        </div>

        {analytics.recentBookings.length === 0 ? (
          <p className="no-data">No recent bookings.</p>
        ) : (
          <table className="requests-table user-recent-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Date</th>
                <th>Time</th>
                <th>Booked By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.resourceName || '-'}</td>
                  <td>{formatDate(booking.startTime)}</td>
                  <td>{formatTimeRange(booking.startTime, booking.endTime)}</td>
                  <td>{booking.userName || currentUser}</td>
                  <td>
                    <BookingStatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;
