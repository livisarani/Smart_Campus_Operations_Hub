import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
	FiArrowLeft,
	FiCalendar,
	FiCheckCircle,
	FiClock,
	FiFileText,
	FiMapPin,
	FiUsers,
} from 'react-icons/fi';
import { bookingApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import { ROOMS } from '../../utils/constants';
import BookingStatusBadge from './BookingStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const BookingDetails = () => {
	const { id } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const { isAdmin } = useAuth();
	const [booking, setBooking] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const bookingId = Number(id);

	useEffect(() => {
		const loadBooking = async () => {
			if (location.state?.booking) {
				setBooking(location.state.booking);
				setError(null);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const list = isAdmin()
					? await bookingApi.getAllBookings({})
					: await bookingApi.getUserBookings(1);

				const selected = (list || []).find((item) => Number(item.id) === bookingId);

				if (!selected) {
					setError('Booking not found');
					setBooking(null);
					return;
				}

				setBooking(selected);
				setError(null);
			} catch (err) {
				setError(typeof err === 'string' ? err : err?.message || 'Failed to load booking details');
			} finally {
				setLoading(false);
			}
		};

		loadBooking();
	}, [bookingId, isAdmin, location.state]);

	const room = useMemo(() => {
		if (!booking) return null;
		return ROOMS.find((r) => r.id === booking.resourceId || r.name === booking.resourceName);
	}, [booking]);

	const formatDate = (value) =>
		value
			? new Date(value).toLocaleDateString(undefined, {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
				})
			: '-';

	const formatDateLong = (value) =>
		value
			? new Date(value).toLocaleDateString(undefined, {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
				})
			: '-';

	const formatTime = (value) =>
		value
			? new Date(value).toLocaleTimeString(undefined, {
					hour: '2-digit',
					minute: '2-digit',
				})
			: '-';

	const handleCancel = async () => {
		if (!booking || booking.status !== 'APPROVED') return;
		if (!window.confirm('Are you sure you want to cancel this booking?')) return;

		try {
			await bookingApi.cancelBooking(booking.id);
			navigate('/bookings');
		} catch (err) {
			setError(err?.message || 'Failed to cancel booking');
		}
	};

	if (loading) return <LoadingSpinner />;
	if (error) return <ErrorAlert message={error} />;
	if (!booking) return <ErrorAlert message="Booking not found" />;

	return (
		<div className="booking-details-page">
			<div className="booking-details-header">
				<div>
					<Link to="/bookings" className="booking-back-link">
						<FiArrowLeft />
					</Link>
					<h1>Booking Details</h1>
					<BookingStatusBadge status={booking.status} />
					<p>
						ID: BK-{booking.id} {booking.createdAt ? `• Created on ${formatDate(booking.createdAt)}` : ''}
					</p>
				</div>

				{booking.status === 'APPROVED' && (
					<button type="button" className="btn-reject" onClick={handleCancel}>
						Cancel Booking
					</button>
				)}
			</div>

			<div className="booking-details-grid">
				<section className="booking-details-card booking-details-main">
					<h3>Information</h3>
					<div className="details-info-grid">
						<div className="details-item">
							<p>
								<FiMapPin /> Resource
							</p>
							<strong>{booking.resourceName || '-'}</strong>
							<span>{room?.type || 'Meeting Room'}</span>
						</div>

						<div className="details-item">
							<p>
								<FiFileText /> Purpose
							</p>
							<strong>{booking.purpose || '-'}</strong>
						</div>

						<div className="details-item">
							<p>
								<FiCalendar /> Date
							</p>
							<strong>{formatDateLong(booking.startTime)}</strong>
						</div>

						<div className="details-item">
							<p>
								<FiUsers /> Expected Attendees
							</p>
							<strong>{booking.expectedAttendees || '-'} people</strong>
						</div>

						<div className="details-item">
							<p>
								<FiClock /> Time
							</p>
							<strong>
								{formatTime(booking.startTime)} - {formatTime(booking.endTime)}
							</strong>
						</div>
					</div>
				</section>

				<aside className="booking-details-card booking-details-side">
					<h3>Resource Details</h3>
					<div className="details-kv">
						<span>Location</span>
						<strong>{room?.location || 'Main Campus'}</strong>
					</div>
					<div className="details-kv">
						<span>Max Capacity</span>
						<strong>{room?.capacity || '-'}</strong>
					</div>
					<div className="details-kv">
						<span>Current Status</span>
						<strong className="status-available">Available</strong>
					</div>
				</aside>

				<section className="booking-details-card booking-workflow-card">
					<h3>Workflow Status</h3>
					<ul className="workflow-list">
						<li className="done">
							<FiCheckCircle /> REQUESTED
						</li>
						<li className={booking.status === 'PENDING' ? 'active' : 'done'}>
							<FiCheckCircle /> PENDING REVIEW
						</li>
						<li className={booking.status === 'APPROVED' ? 'done' : ''}>
							<FiCheckCircle /> APPROVED
						</li>
					</ul>
				</section>

				<aside className="booking-details-card booking-decision-card">
					<h3>Admin Decision</h3>
					<div className="decision-box">
						{booking.status === 'APPROVED' && (
							<p>
								This booking has been approved. You may use the resource at the scheduled time.
							</p>
						)}
						{booking.status === 'PENDING' && <p>This booking is pending review by an administrator.</p>}
						{booking.status === 'REJECTED' && <p>This booking was rejected by an administrator.</p>}
						{booking.status === 'CANCELLED' && <p>This booking has been cancelled.</p>}
					</div>
				</aside>
			</div>
		</div>
	);
};

export default BookingDetails;
