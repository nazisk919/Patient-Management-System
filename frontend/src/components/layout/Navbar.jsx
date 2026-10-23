import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Calendar,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim().toLowerCase();
    // Smart routing based on keyword
    if (q.includes('doc')) {
      navigate(`/doctors?search=${encodeURIComponent(q)}`);
    } else if (q.includes('appoint')) {
      navigate(`/appointments?search=${encodeURIComponent(q)}`);
    } else if (q.includes('bill') || q.includes('pay')) {
      navigate('/billing');
    } else {
      navigate(`/patients?search=${encodeURIComponent(q)}`);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'NK';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = user?.name || 'Najis Khan';
  const displayRole = user?.role === 'ADMIN' ? 'Doctor/Admin' : (user?.role || 'Doctor/Admin');

  return (
    <header className="app-navbar">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="navbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
        >
          <Menu size={22} />
        </button>

        <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search patients, doctors, appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Right: Notifications & Profile Dropdown */}
      <div className="navbar-right">
        {/* Notification Bell */}
        <div className="notification-bell-btn" title="Notifications">
          <Bell size={20} color="var(--color-slate-600)" />
          <span className="bell-badge-dot" />
        </div>

        {/* User Profile Pill */}
        <div className="navbar-user-chip-wrapper">
          <button
            type="button"
            className="navbar-user-chip"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            aria-expanded={profileDropdownOpen}
          >
            <div className="user-avatar-circle">
              {getInitials(displayName)}
            </div>
            <div className="user-meta-text">
              <span className="user-meta-name">{displayName}</span>
              <span className="user-meta-role">{displayRole}</span>
            </div>
            <ChevronDown size={15} color="var(--color-slate-400)" className="user-meta-chevron" />
          </button>

          {profileDropdownOpen && (
            <>
              <div
                className="dropdown-overlay"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="navbar-dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-user-name">{displayName}</div>
                  <div className="dropdown-user-email">
                    {user?.email || 'admin@hospital.com'}
                  </div>
                </div>

                <div className="dropdown-body">
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/appointments"
                    className="dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <Calendar size={16} />
                    <span>My Schedule</span>
                  </Link>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-item dropdown-logout"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
