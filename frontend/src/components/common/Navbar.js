import React from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" className="brand-link">
          <span className="brand-badge">S</span>
          <span>Smart Campus</span>
        </Link>
      </div>

      <div className="navbar-right">
        <button type="button" className="icon-btn" aria-label="Notifications">
          <FiBell />
          <span className="notification-dot" />
        </button>

        <div className="nav-user">
          <FiUser />
          <span>{user?.name || 'Campus User'}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;