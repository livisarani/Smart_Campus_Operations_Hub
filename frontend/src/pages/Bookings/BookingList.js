import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../api/bookingApi';
import BookingStatusBadge from './BookingStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();
  const adminView = isAdmin();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      let data;
      if (adminView) {
        data = await bookingApi.getAllBookings({});
      } else {
        data = await bookingApi.getUserBookings(1); // In real app, get userId from user object
      }
      setBookings(data);
      setError(null);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingApi.cancelBooking(id);
        loadBookings();
      } catch (err) {
        setError('Failed to cancel booking');
      }
    }
  };

  const filteredBookings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;

      if (!query) {
        return matchesStatus;
      }

      const searchableText = [
        booking.id,
        booking.userName,
        booking.resourceName,
        booking.purpose,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && searchableText.includes(query);
    });
  }, [bookings, searchTerm, statusFilter]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="booking-page">
      <div className="booking-page-header">
        <div>
          <h1>{adminView ? 'All Bookings' : 'My Bookings'}</h1>
          <p>Manage and view campus room bookings.</p>
        </div>
        {!adminView && (
          <Link to="/bookings/new" className="new-booking-btn">
            + New Booking
          </Link>
        )}
      </div>

      <section className="booking-table-card">
        <div className="booking-toolbar">
          <div className="booking-search">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bookings by ID, User, or Room..."
            />
          </div>

          <select
            className="booking-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {filteredBookings.length === 0 ? (
          <p className="no-data">No bookings found.</p>
        ) : (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Requested By</th>
                <th>Room</th>
                <th>Date & Time</th>
                <th>Status</th>
                {!adminView && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="booking-id">BK-{booking.id}</td>
                  <td>{booking.userName || 'Campus User'}</td>
                  <td>{booking.resourceName}</td>
                  <td>
                    <div className="booking-date">{formatDate(booking.startTime)}</div>
                    <small>
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </small>
                  </td>
                  <td>
                    <BookingStatusBadge status={booking.status} />
                  </td>
                  {!adminView && (
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/bookings/${booking.id}`}
                          state={{ booking }}
                          className="btn-detail-small"
                        >
                          Detail
                        </Link>
                        {booking.status === 'APPROVED' ? (
                          <button
                            type="button"
                            className="btn-cancel-small"
                            onClick={() => handleCancel(booking.id)}
                          >
                            Cancel
                          </button>
                        ) : null}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default BookingList;