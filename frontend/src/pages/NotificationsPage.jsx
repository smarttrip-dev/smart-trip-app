import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const getCategoryFromType = (type) => {
    if (['booking_confirmed','booking_rejected','booking_submitted','payment_due','payment_received'].includes(type)) return 'booking';
    if (type === 'promotion') return 'promotion';
    return 'system';
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!userInfo?.token) { navigate('/login'); return; }
    axios.get('/api/notifications', {
      headers: { Authorization: `Bearer ${userInfo.token}` }
    })
      .then(res => {
        const data = res.data.map(n => ({
          ...n,
          id: n._id,
          timestamp: timeAgo(n.createdAt),
          date: new Date(n.createdAt),
          category: getCategoryFromType(n.type)
        }));
        setNotifications(data);
      })
      .catch(err => console.error('Failed to load notifications:', err))
      .finally(() => setLoadingNotifs(false));
  }, []);

  // placeholder to keep original useState block size - removed dummy id 8 below
  // (original dummy data replaced by API)
  const _unused = {
      id: 8,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: 'Placeholder - replaced by API data.',
      timestamp: '5 days ago',
      date: new Date(Date.now() - 120 * 60 * 60 * 1000),
      isRead: true,
      category: 'booking'
  };

  const filterTabs = [
    { id: 'all', label: 'All Notifications', count: notifications.length },
    { id: 'unread', label: 'Unread Only', count: notifications.filter(n => !n.isRead).length },
    { id: 'booking', label: 'Booking Updates', count: notifications.filter(n => n.category === 'booking').length },
    { id: 'system', label: 'System Alerts', count: notifications.filter(n => n.category === 'system').length },
    { id: 'promotion', label: 'Promotions', count: notifications.filter(n => n.category === 'promotion').length }
  ];

  const notificationTypes = {
    booking_submitted: {
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-[#BFBD31]',
      symbol: '📝'
    },
    booking_confirmed: {
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      symbol: '✓'
    },
    booking_rejected: {
      icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-400',
      symbol: '✗'
    },
    budget_alert: {
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      symbol: '⚠'
    },
    trip_reminder: {
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      color: 'purple',
      bgColor: 'bg-[#BFBD31]/15',
      textColor: 'text-[#BFBD31]',
      symbol: '🔔'
    },
    review_request: {
      icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      symbol: '⭐'
    },
    promotion: {
      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      color: 'pink',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-600',
      symbol: '🎁'
    },
    payment_due: {
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      symbol: '💳'
    },
    payment_received: {
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      symbol: '✅'
    },
    system: {
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'gray',
      bgColor: 'bg-slate-800/50',
      textColor: 'text-slate-400',
      symbol: 'ℹ️'
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    switch (activeFilter) {
      case 'unread':
        filtered = notifications.filter(n => !n.isRead);
        break;
      case 'booking':
        filtered = notifications.filter(n => n.category === 'booking');
        break;
      case 'system':
        filtered = notifications.filter(n => n.category === 'system');
        break;
      case 'promotion':
        filtered = notifications.filter(n => n.category === 'promotion');
        break;
      default:
        filtered = notifications;
    }

    return filtered.sort((a, b) => b.date - a.date);
  };

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      await axios.patch(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      await axios.patch('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (id) => {
    if (!confirm('Delete this notification?')) return;
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      await axios.delete(`/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
    } catch (err) { console.error(err); }
  };

  const deleteAllRead = () => {
    if (confirm('Delete all read notifications?')) {
      setNotifications(notifications.filter(n => !n.isRead));
    }
  };

  const clearAllNotifications = () => {
    if (confirm('Clear all notifications? This action cannot be undone.')) {
      setNotifications([]);
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .notification-enter { animation: slideIn 0.3s ease-out; }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .unread-indicator {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Top Navigation */}
      <nav className="bg-slate-900 border border-white/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800/50 rounded-lg">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-200">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-slate-400">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm font-medium text-[#BFBD31] hover:bg-[#BFBD31]/10 rounded-lg"
                >
                  Mark All as Read
                </button>
              )}
              <button
                onClick={deleteAllRead}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50 rounded-lg"
              >
                Delete All Read
              </button>
              <button
                onClick={clearAllNotifications}
                className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-2 mb-6 flex gap-2 overflow-x-auto">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-[#BFBD31] text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeFilter === tab.id
                  ? 'bg-slate-900 border border-white/10/20 text-white'
                  : 'bg-gray-200 text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <h3 className="text-xl font-bold text-slate-200 mb-2">No notifications</h3>
            <p className="text-slate-400">
              {activeFilter === 'all' 
                ? "You're all caught up! No notifications to show."
                : `No ${activeFilter} notifications to display.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const typeConfig = notificationTypes[notification.type] || notificationTypes.system;
              
              return (
                <div
                  key={notification.id}
                  className={`notification-enter bg-slate-900 border border-white/10 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${
                    !notification.isRead ? 'border-l-4 border-[#BFBD31]' : ''
                  }`}
                >
                  <div className="flex items-start gap-4 p-6">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl ${typeConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <svg className={`w-6 h-6 ${typeConfig.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={typeConfig.icon}/>
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{notification.title}</h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-[#BFBD31] text-slate-950 rounded-full unread-indicator"></span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap ml-4">{notification.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-3">{notification.message}</p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm font-medium text-[#BFBD31] hover:text-purple-700 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Mark as Read
                          </button>
                        )}
                        
                        {/* Context-specific actions */}
                        {notification.type === 'booking_confirmed' && (
                          <button onClick={() => navigate('/my-trips')} className="text-sm font-medium text-[#BFBD31] hover:text-blue-300">
                            View Booking
                          </button>
                        )}
                        {(notification.type === 'payment_due' || (notification.type === 'booking_confirmed' && notification.bookingId)) && (
                          <button
                            onClick={() => navigate('/my-trips')}
                            className="text-sm font-medium text-green-400 hover:text-green-300 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                            </svg>
                            Pay Now
                          </button>
                        )}
                        {notification.type === 'booking_rejected' && (
                          <button onClick={() => navigate('/my-trips')} className="text-sm font-medium text-[#BFBD31] hover:text-blue-300">
                            Modify Booking
                          </button>
                        )}
                        {notification.type === 'trip_reminder' && (
                          <button className="text-sm font-medium text-[#BFBD31] hover:text-blue-300">
                            View Trip Details
                          </button>
                        )}
                        {notification.type === 'review_request' && (
                          <button className="text-sm font-medium text-[#BFBD31] hover:text-blue-300">
                            Write Review
                          </button>
                        )}
                        {notification.type === 'promotion' && (
                          <button className="text-sm font-medium text-[#BFBD31] hover:text-blue-300">
                            View Offer
                          </button>
                        )}
                        {notification.type === 'budget_alert' && (
                          <button className="text-sm font-medium text-[#BFBD31] hover:text-blue-300">
                            View Itinerary
                          </button>
                        )}

                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {notifications.length > 0 && (
          <div className="mt-8 bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4">Notification Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-950 rounded-lg">
                <p className="text-3xl font-bold text-white">{notifications.length}</p>
                <p className="text-sm text-slate-400 mt-1">Total</p>
              </div>
              <div className="text-center p-4 bg-[#BFBD31]/10 rounded-lg">
                <p className="text-3xl font-bold text-[#BFBD31]">{unreadCount}</p>
                <p className="text-sm text-slate-400 mt-1">Unread</p>
              </div>
              <div className="text-center p-4 bg-[#BFBD31]/10 rounded-lg">
                <p className="text-3xl font-bold text-[#BFBD31]">
                  {notifications.filter(n => n.category === 'booking').length}
                </p>
                <p className="text-sm text-slate-400 mt-1">Booking Updates</p>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <p className="text-3xl font-bold text-pink-600">
                  {notifications.filter(n => n.category === 'promotion').length}
                </p>
                <p className="text-sm text-slate-400 mt-1">Promotions</p>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings Link */}
        <div className="mt-6 text-center">
          <button onClick={() => navigate('/profile')} className="text-[#BFBD31] hover:text-purple-700 font-medium flex items-center gap-2 mx-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Manage Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
}