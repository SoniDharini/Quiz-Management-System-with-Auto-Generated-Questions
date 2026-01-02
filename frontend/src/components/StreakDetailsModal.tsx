import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, Calendar as CalendarIcon, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { userAPI } from '../services/api';

interface StreakDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AnalyticsData {
    streak_days: number;
    longest_streak: number;
    activity_history: string[]; // YYYY-MM-DD
}

export function StreakDetailsModal({ isOpen, onClose }: StreakDetailsModalProps) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewDate, setViewDate] = useState(new Date());
    const [currentDate, setCurrentDate] = useState(new Date()); // Track real-time date

    useEffect(() => {
        if (isOpen) {
            fetchAnalytics();
            setViewDate(new Date()); // Reset to current month on open
        }
    }, [isOpen]);

    // Update current date periodically to handle date changes (e.g. midnight) while modal is open
    useEffect(() => {
        const timer = setInterval(() => setCurrentDate(new Date()), 60000); // Check every minute
        return () => clearInterval(timer);
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const analytics = await userAPI.getUserAnalytics();
            setData(analytics);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }
        return { days, firstDayWeekday: firstDay.getDay() };
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setViewDate(newDate);
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isActiveDay = (date: Date) => {
        if (!data?.activity_history) return false;
        const dateStr = formatDate(date);
        return data.activity_history.includes(dateStr);
    };

    const { days, firstDayWeekday } = getDaysInMonth(viewDate);
    const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-[#003B73]/10"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Flame className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[#003B73]">Streak Details</h2>
                                    <p className="text-[#003B73]/60">Your consistency tracker</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                type="button"
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-[#003B73]/60" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-4 border-[#003B73]/20 border-t-[#003B73] rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                        <div className="flex items-center gap-2 mb-2 text-orange-600">
                                            <Flame className="w-5 h-5" />
                                            <span className="font-semibold">Current Streak</span>
                                        </div>
                                        <div className="text-3xl font-bold text-[#003B73]">
                                            {data?.streak_days || 0}
                                            <span className="text-base font-normal text-[#003B73]/60 ml-2">days</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2 text-blue-600">
                                            <Trophy className="w-5 h-5" />
                                            <span className="font-semibold">Best Streak</span>
                                        </div>
                                        <div className="text-3xl font-bold text-[#003B73]">
                                            {data?.longest_streak || 0}
                                            <span className="text-base font-normal text-[#003B73]/60 ml-2">days</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Calendar View */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-[#003B73]">
                                            <CalendarIcon className="w-5 h-5" />
                                            <h3 className="font-semibold capitalize">{monthName}</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => changeMonth(-1)}
                                                type="button"
                                                className="p-2 hover:bg-gray-100 rounded-lg text-[#003B73] hover:text-[#0056A8] transition-colors"
                                                aria-label="Previous month"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => changeMonth(1)}
                                                type="button"
                                                className="p-2 hover:bg-gray-100 rounded-lg text-[#003B73] hover:text-[#0056A8] transition-colors"
                                                aria-label="Next month"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                                        {/* Day Headers */}
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="text-center text-xs text-[#003B73]/40 font-medium py-1">
                                                {day}
                                            </div>
                                        ))}

                                        {/* Padding for first day alignment */}
                                        {Array(firstDayWeekday).fill(null).map((_, i) => (
                                            <div key={`pad-${i}`} />
                                        ))}

                                        {/* Date Cells */}
                                        {days.map((date, i) => {
                                            const active = isActiveDay(date);
                                            // Use live currentDate state to ensure highlight updates on date change
                                            const isToday = date.getDate() === currentDate.getDate() &&
                                                date.getMonth() === currentDate.getMonth() &&
                                                date.getFullYear() === currentDate.getFullYear();

                                            return (
                                                <motion.div
                                                    key={i}
                                                    className={`
                                                        aspect-square flex items-center justify-center text-sm font-medium relative group
                                                        ${isToday
                                                            ? 'bg-[#003B73] text-white rounded-full shadow-lg z-10'
                                                            : active
                                                                ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md rounded-xl'
                                                                : 'bg-gray-50 text-[#003B73]/40 hover:bg-gray-100 rounded-xl'
                                                        }
                                                    `}
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={isToday ? {
                                                        scale: [1, 1.1, 1],
                                                        opacity: 1,
                                                        boxShadow: ["0px 0px 0px 0px rgba(0, 59, 115, 0.4)", "0px 0px 0px 4px rgba(0, 59, 115, 0)"]
                                                    } : {
                                                        scale: 1,
                                                        opacity: 1
                                                    }}
                                                    transition={isToday ? {
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        repeatType: "loop"
                                                    } : {
                                                        delay: i * 0.01
                                                    }}
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    {date.getDate()}

                                                    {/* Tooltip */}
                                                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-[#003B73] text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap pointer-events-none z-10 left-1/2 -translate-x-1/2">
                                                        {date.toLocaleDateString()}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <p className="text-center text-[#003B73]/50 text-sm">
                                    Keep your streak alive by completing at least one quiz every day!
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
