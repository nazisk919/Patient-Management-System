import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  FileText,
  Folder,
  CreditCard,
  TrendingUp,
  User,
  LogOut,
  Activity,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowed: true,
    },
    {
      to: '/patients',
      label: 'Patients',
      icon: Users,
      allowed: true,
    },
    {
      to: '/appointments',
      label: 'Appointments',
      icon: Calendar,
      allowed: true,
    },
    {
      to: '/doctors',
      label: 'Doctors',
      icon: UserCheck,
      allowed: true,
    },
    {
      to: '/prescriptions',
      label: 'Prescriptions',
      icon: FileText,
      allowed: true,
    },
    {
      to: '/medical-records',
      label: 'Medical Records',
      icon: Folder,
      allowed: true,
    },
    {
      to: '/billing',
      label: 'Billing & Payments',
      icon: CreditCard,
      allowed: true,
    },
    {
      to: '/reports',
      label: 'Reports',
      icon: TrendingUp,
      allowed: true,
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: User,
      allowed: true,
    },
  ];

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
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">
          <Activity size={22} color="#ffffff" strokeWidth={2.5} />
        </div>
        <div className="brand-text-block">
          <span className="brand-name-primary">Patient</span>
          <span className="brand-name-secondary">Management System</span>
        </div>
        {isOpen && (
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={onClose}
            style={{ marginLeft: 'auto', color: 'white' }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems
          .filter((item) => item.allowed)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onClick={onClose}
              >
                <Icon size={19} className="nav-icon" />
                <span className="nav-text">{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* Background Decorative Curve */}
      <div className="sidebar-wave-decoration" />

      {/* User Footer Profile */}
      <div className="sidebar-footer">
        <div className="user-mini-profile">
          <div className="user-avatar">{getInitials(displayName)}</div>
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-role-badge">{displayRole}</span>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-logout-btn"
          onClick={handleLogout}
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
