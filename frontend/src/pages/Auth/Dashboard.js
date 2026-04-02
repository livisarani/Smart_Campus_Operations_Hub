import React, { useEffect, useMemo, useState } from 'react';
import { FiClipboard, FiClock, FiCheckCircle, FiCheck, FiX, FiEye } from 'react-icons/fi';
import { bookingApi } from '../../api/bookingApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import BookingStatusBadge from '../Bookings/BookingStatusBadge';

const Dashboard = () => {
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadDashboardBookings();
	}, []);

	const loadDashboardBookings = async () => {
		try {
			setLoading(true);
			const data = await bookingApi.getAllBookings({});
			setBookings(Array.isArray(data) ? data : []);
			setError(null);
		} catch (err) {
			setError('Failed to load dashboard data');
		} finally {
			setLoading(false);
		}
	};

	const stats = useMemo(() => {
		const total = bookings.length;
		const pending = bookings.filter((booking) => booking.status === 'PENDING').length;
		const approved = bookings.filter((booking) => booking.status === 'APPROVED').length;
		return { total, pending, approved };
	}, [bookings]);

	const trendPercent = (value) => (value === 0 ? '0%' : `${Math.min(99, Math.max(1, value))}%`);
	const pendingTrend = stats.total ? Math.round((stats.pending / stats.total) * 100) : 0;
	const approvedTrend = stats.total ? Math.round((stats.approved / stats.total) * 100) : 0;

	const recentBookings = useMemo(() => {
		return [...bookings]
			.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
			.slice(0, 8);
	}, [bookings]);

	const formatDate = (dateString) =>
		new Date(dateString).toLocaleDateString(undefined, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		});

	const formatTime = (dateString) =>
		new Date(dateString).toLocaleTimeString(undefined, {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		});

	const handleApprove = async (id) => {
		try {
			await bookingApi.approveBooking(id, 'Approved from admin dashboard');
			loadDashboardBookings();
		} catch (err) {
			setError('Failed to approve booking');
		}
	};

	const handleReject = async (id) => {
		const reason = window.prompt('Enter rejection reason');
		if (!reason) {
			return;
		}

		try {
			await bookingApi.rejectBooking(id, reason);
			loadDashboardBookings();
		} catch (err) {
			setError('Failed to reject booking');
		}
	};

	const handleView = (booking) => {
		window.alert(
			`Booking: ${booking.resourceName}\nRequested by: ${booking.userName}\nPurpose: ${booking.purpose}\nStatus: ${booking.status}`
		);
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return <ErrorAlert message={error} />;
	}

	return (
		<div className="admin-dashboard">
			<div className="dashboard-header">
				<h1>Admin Approval Dashboard</h1>
				<p>Manage campus resource requests and view system statistics.</p>
			</div>

			<div className="stats-grid">
				<article className="stat-card">
					<div>
						<p className="stat-label">Total Requests</p>
						<div className="metric-row">
							<h2>{stats.total}</h2>
							<small className="trend-up">↑ {trendPercent(stats.total)}</small>
						</div>
					</div>
					<div className="stat-icon icon-blue">
						<FiClipboard />
					</div>
				</article>

				<article className="stat-card">
					<div>
						<p className="stat-label">Pending Approvals</p>
						<div className="metric-row">
							<h2>{stats.pending}</h2>
							<small className="trend-down">↓ {trendPercent(pendingTrend)}</small>
						</div>
					</div>
					<div className="stat-icon icon-amber">
						<FiClock />
					</div>
				</article>

				<article className="stat-card">
					<div>
						<p className="stat-label">Approved Bookings</p>
						<div className="metric-row">
							<h2>{stats.approved}</h2>
							<small className="trend-up">↑ {trendPercent(approvedTrend)}</small>
						</div>
					</div>
					<div className="stat-icon icon-green">
						<FiCheckCircle />
					</div>
				</article>
			</div>

			<section className="dashboard-requests-card">
				<div className="requests-header">
					<h3>Recent Requests</h3>
					<span className="action-required-pill">{stats.pending} Action Required</span>
				</div>

				<table className="requests-table">
					<thead>
						<tr>
							<th>User</th>
							<th>Resource</th>
							<th>Date & Time</th>
							<th>Purpose</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{recentBookings.map((booking) => (
							<tr key={booking.id}>
								<td>{booking.userName || 'Campus User'}</td>
								<td>
									<strong>{booking.resourceName}</strong>
									<br />
									<small>{booking.expectedAttendees || 0} attendees</small>
								</td>
								<td>
									{formatDate(booking.startTime)}
									<br />
									<small>
										{formatTime(booking.startTime)} - {formatTime(booking.endTime)}
									</small>
								</td>
								<td>{booking.purpose}</td>
								<td>
									<BookingStatusBadge status={booking.status} />
								</td>
								<td>
									<div className="admin-action-buttons">
										{booking.status === 'PENDING' && (
											<>
												<button
													type="button"
													className="icon-action-btn approve-icon-btn"
													onClick={() => handleApprove(booking.id)}
													aria-label="Approve"
												>
													<FiCheck />
												</button>
												<button
													type="button"
													className="icon-action-btn reject-icon-btn"
													onClick={() => handleReject(booking.id)}
													aria-label="Reject"
												>
													<FiX />
												</button>
											</>
										)}

										<button
											type="button"
											className="icon-action-btn view-icon-btn"
											onClick={() => handleView(booking)}
											aria-label="View"
										>
											<FiEye />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>
		</div>
	);
};

export default Dashboard;
