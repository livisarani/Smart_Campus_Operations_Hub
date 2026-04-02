import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiCalendar, FiFileText, FiHome, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
	const { logout, isAdmin } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<aside className="sidebar">
			<div>
				<p className="sidebar-heading">Main Menu</p>

				<nav className="sidebar-nav">
					<NavLink to={isAdmin() ? '/admin/dashboard' : '/dashboard'} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
						<FiGrid />
						<span>Dashboard</span>
					</NavLink>

					<NavLink to="/bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
						<FiCalendar />
						<span>Bookings</span>
					</NavLink>

					{isAdmin() && (
						<NavLink to="/admin/bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
							<FiFileText />
							<span>Requests</span>
						</NavLink>
					)}

					<NavLink to="/rooms" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
						<FiHome />
						<span>Rooms</span>
					</NavLink>
				</nav>
			</div>

			<div className="sidebar-footer">
				<button type="button" className="sidebar-footer-link">
					<FiSettings />
					<span>Settings</span>
				</button>

				<button type="button" className="sidebar-footer-link" onClick={handleLogout}>
					<FiLogOut />
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
