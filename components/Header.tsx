"use client";

import { AlignJustify, Radar, X, LogOut } from "lucide-react"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Session } from '@supabase/supabase-js';

interface Notification {
  id: number;
  message: string;
  type: 'tip' | 'info';
  timestamp: Date;
}

interface Tip {
  title: string;
  description: string;
}

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('01');
  const [selectedDay, setSelectedDay] = useState<string>('01');
  const [selectedDate, setSelectedDate] = useState<string>('2024-01-01');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDataSubmenu = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setIsDataOpen(!isDataOpen);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setShowLogoutConfirm(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Simulate getting optimization tips (since we don't have the API endpoint)
  const handleDateSelect = async (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
    
    try {
      // Since we don't have the API endpoint, we'll simulate with static tips
      // In a real app, you'd call your optimization tips logic here
      const staticTips = [
        {
          title: "Energy Optimization",
          description: `💡 For ${format(date, 'MMM d')}: Consider shifting high-power appliance usage to peak solar hours (10:00-14:00).`
        },
        {
          title: "Battery Management", 
          description: `🔋 Battery tip for ${format(date, 'MMM d')}: Monitor your battery levels during evening hours to optimize usage.`
        }
      ];
      
      const newNotifications = staticTips.map((tip: Tip, index: number) => ({
        id: Date.now() + index,
        message: tip.description,
        type: 'tip' as const,
        timestamp: new Date()
      }));
      
      setNotifications(prev => [...newNotifications, ...prev]);
      
      // Auto-remove notifications after 15 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => !newNotifications.find((newN: Notification) => newN.id === n.id)));
      }, 15000);
      
    } catch (error) {
      console.error('Error fetching tips:', error);
      // Show error notification
      const errorNotification = {
        id: Date.now(),
        message: 'Failed to fetch optimization tips. Please try again.',
        type: 'info' as const,
        timestamp: new Date()
      };
      setNotifications(prev => [errorNotification, ...prev]);
    }
  };

  const handleConfirmDate = () => {
    const date = new Date(`2024-${selectedMonth}-${selectedDay}`);
    handleDateSelect(date);
  };

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const getDaysInMonth = (month: string) => {
    const daysInMonth = new Date(2024, parseInt(month), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = (i + 1).toString().padStart(2, '0');
      return { value: day, label: day };
    });
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) {
    return (
      <header className="flex px-16 max-md:px-5 justify-between w-full text-2xl text-white max-w-[1336px] max-md:max-w-full">
        <div className="flex text-center justify-between w-full">
          <div className="flex gap-2">
            <Radar size={30} />
            <h1>SolarView</h1>
          </div>
          <div className="animate-pulse bg-gray-700 h-6 w-20 rounded ml-auto md:hidden"></div>
        </div>
        <nav className="flex items-center gap-10 max-md:hidden">
          <div className="animate-pulse bg-gray-700 h-6 w-16 rounded"></div>
          <div className="animate-pulse bg-gray-700 h-6 w-20 rounded"></div>
          <div className="animate-pulse bg-gray-700 h-6 w-12 rounded"></div>
        </nav>
      </header>
    );
  }

  return (
    <>
      <header className="flex px-16 max-md:px-5 justify-between w-full text-2xl text-white max-w-[1336px] max-md:max-w-full">
        <div className="flex text-center justify-between w-full">
          <div className="flex gap-2">
            <Radar size={30} />
            <Link href="/" className="hover:text-yellow-300 transition-colors">
              <h1>SolarView</h1>
            </Link>
          </div>
          <AlignJustify className="ml-auto md:hidden cursor-pointer" onClick={toggleMenu} />
        </div>
        <nav className="flex items-center gap-10 max-md:hidden">
          <Link href="/" className="hover:text-yellow-300 transition-colors">
            Home
          </Link>
          {user ? (
            <>
              <Link href="/data/Settings/ManageSystemAppliances" className="hover:text-yellow-300 transition-colors">
                Settings
              </Link>
              <div className="relative group">
                <button onClick={toggleDataSubmenu} className="hover:text-yellow-300 transition-colors">
                  Data
                </button>
                {isDataOpen && (
                  <div className="absolute right-0 top-full w-48 bg-gray-800 rounded shadow-lg z-50">
                    <Link href="/data/Energygenerated" className="block px-4 py-3 hover:bg-gray-700 text-sm">
                      Energy Generated
                    </Link>
                    <Link href="/data/Energyusage" className="block px-4 py-3 hover:bg-gray-700 text-sm">
                      Energy Usage
                    </Link>
                    <Link href="/data/Batterystatus" className="block px-4 py-3 hover:bg-gray-700 text-sm">
                      Battery Status
                    </Link>
                    <Link href="/data/Optimizationtips" className="block px-4 py-3 hover:bg-gray-700 text-sm">
                      Optimization Tips
                    </Link>
                    <div className="border-t border-gray-700">
                      <div className="px-4 py-3 hover:bg-gray-700">
                        <div className="text-gray-400 text-xs mb-2">Quick Tips</div>
                        <div className="space-y-2">
                          <select
                            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                          >
                            {months.map(month => (
                              <option key={month.value} value={month.value}>
                                {month.label}
                              </option>
                            ))}
                          </select>
                          <select
                            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                          >
                            {getDaysInMonth(selectedMonth).map(day => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleConfirmDate}
                            className="w-full bg-yellow-300 text-gray-800 px-2 py-1 rounded text-sm hover:bg-yellow-400 transition-colors"
                          >
                            Get Tips
                          </button>
                          {selectedDate && (
                            <div className="text-xs text-yellow-300 mt-2">
                              Selected: {format(new Date(selectedDate), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-700">
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full text-left px-4 py-3 text-red-500 hover:bg-gray-700 flex items-center gap-2 text-sm"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-yellow-300 transition-colors text-sm">
                Sign In
              </Link>
              <Link href="/auth/signup" className="bg-yellow-300 text-gray-800 px-4 py-2 rounded hover:bg-yellow-400 transition-colors text-sm">
                Sign Up
              </Link>
            </>
          )}
        </nav>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 md:hidden">
            <div className="flex justify-end p-5">
              <X className="text-white cursor-pointer" onClick={toggleMenu} />
            </div>
            <div className="flex flex-col items-center gap-8 mt-10 text-2xl">
              <Link href="/" className="hover:text-yellow-300 transition-colors" onClick={toggleMenu}>
                Home
              </Link>
              {user ? (
                <>
                  <Link href="/data/Settings/ManageSystemAppliances" className="hover:text-yellow-300 transition-colors" onClick={toggleMenu}>
                    Settings
                  </Link>
                  <div className="relative">
                    <button 
                      onClick={toggleDataSubmenu}
                      className="hover:text-yellow-300 transition-colors"
                    >
                      Data
                    </button>
                    {isDataOpen && (
                      <div className="mt-4 flex flex-col gap-4 text-lg">
                        <Link href="/energy-generated" className="hover:text-yellow-300 transition-colors" onClick={toggleMenu}>
                          Energy Generated
                        </Link>
                        <Link href="/energy-usage" className="hover:text-yellow-300 transition-colors" onClick={toggleMenu}>
                          Energy Usage
                        </Link>
                        <Link href="/battery-status" className="hover:text-yellow-300 transition-colors" onClick={toggleMenu}>
                          Battery Status
                        </Link>
                        <Link href="/optimization-tips" className="hover:text-yellow-300 transition-colors" onClick={toggleMenu}>
                          Optimization Tips
                        </Link>
                        <div className="border-t border-gray-700 pt-4">
                          <div className="text-gray-400 text-sm mb-2">Quick Tips</div>
                          <div className="space-y-2">
                            <select
                              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                              value={selectedMonth}
                              onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                              {months.map(month => (
                                <option key={month.value} value={month.value}>
                                  {month.label}
                                </option>
                              ))}
                            </select>
                            <select
                              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                              value={selectedDay}
                              onChange={(e) => setSelectedDay(e.target.value)}
                            >
                              {getDaysInMonth(selectedMonth).map(day => (
                                <option key={day.value} value={day.value}>
                                  {day.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                handleConfirmDate();
                                toggleMenu();
                              }}
                              className="w-full bg-yellow-300 text-gray-800 px-3 py-2 rounded hover:bg-yellow-400 transition-colors"
                            >
                              Get Tips
                            </button>
                            {selectedDate && (
                              <div className="text-sm text-yellow-300 mt-2">
                                Selected: {format(new Date(selectedDate), 'MMM d, yyyy')}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowLogoutConfirm(true);
                            toggleMenu();
                          }}
                          className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-2"
                        >
                          <LogOut size={20} />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="hover:text-yellow-300 transition-colors" onClick={toggleMenu}>
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="bg-yellow-300 text-gray-800 px-6 py-3 rounded hover:bg-yellow-400 transition-colors" onClick={toggleMenu}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Logout</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out relative cursor-pointer"
            style={{
              animation: 'slideIn 0.3s ease-out'
            }}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="pr-6">
              {notification.message}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
            <div className="text-xs text-gray-400 mt-1">
              {format(notification.timestamp, 'HH:mm')}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};