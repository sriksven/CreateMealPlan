import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { auth } from "../firebase";

const API_BASE_URL = "http://localhost:8000";

interface CalendarData {
    manual: number;
    receipt: number;
}

interface ActivityCalendarProps {
    onDateClick: (date: string) => void;
    selectedDate: string | null;
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ onDateClick, selectedDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendar, setCalendar] = useState<Record<string, CalendarData>>({});

    useEffect(() => {
        loadCalendar();
    }, [currentMonth]);

    const loadCalendar = async () => {
        try {
            // Fetch calendar data for current month
            const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

            const token = await auth.currentUser?.getIdToken();
            if (!token) return;

            const res = await fetch(
                `${API_BASE_URL}/api/history/calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.ok) {
                const data = await res.json();
                setCalendar(data.calendar);
            }
        } catch (err) {
            console.error("Failed to load calendar:", err);
        }
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const renderDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            // Create local date string explicitly correctly
            // We want YYYY-MM-DD
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            const activity = calendar[dateStr];
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toDateString() === date.toDateString();

            days.push(
                <button
                    key={dateStr}
                    onClick={() => onDateClick(dateStr)}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                >
                    <span>{d}</span>

                    <div className="activity-dots">
                        {activity?.manual > 0 && (
                            <div className="dot manual" title="Manual Add" />
                        )}
                        {activity?.receipt > 0 && (
                            <div className="dot receipt" title="Receipt Scan" />
                        )}
                    </div>
                </button>
            );
        }

        return days;
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="calendar-month-header">
                <h3 className="calendar-month-title">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <div className="calendar-nav">
                    <button onClick={prevMonth} className="calendar-nav-btn">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="calendar-nav-btn">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="calendar-grid mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="weekday-header">
                        {day}
                    </div>
                ))}
            </div>

            <div className="calendar-grid">
                {renderDays()}
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="dot manual" />
                    <span>Manual Entry</span>
                </div>
                <div className="legend-item">
                    <div className="dot receipt" />
                    <span>Receipt Scan</span>
                </div>
            </div>
        </div>
    );
};
