import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { auth } from "../firebase";
import { PantryHistoryList } from "./PantryHistoryList";

const API_BASE_URL = "http://localhost:8000";

interface CalendarData {
    manual: number;
    receipt: number;
}

export const PantryCalendar: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendar, setCalendar] = useState<Record<string, CalendarData>>({});
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadCalendar();
    }, [currentMonth]);

    const loadCalendar = async () => {
        try {
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
                console.log('Pantry Calendar Data:', data.calendar);
                setCalendar(data.calendar);
            } else {
                console.error('Failed to load calendar:', res.status);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDateClick = (dateStr: string) => {
        const activity = calendar[dateStr];
        // Only open modal if there's ACTUAL activity (manual > 0 OR receipt > 0)
        if (activity && (activity.manual > 0 || activity.receipt > 0)) {
            setSelectedDate(dateStr);
            setIsModalOpen(true);
        }
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    const renderDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const activity = calendar[dateStr];

            days.push(
                <button
                    key={dateStr}
                    onClick={() => handleDateClick(dateStr)}
                    style={{ background: activity ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', cursor: activity ? 'pointer' : 'default' }}
                    className={`
                        relative flex flex-col items-center justify-center w-9 h-9 rounded-lg transition-colors
                        ${activity ? 'hover:bg-white/10' : 'opacity-30'}
                    `}
                >
                    <span className="text-xs text-muted">{d}</span>
                    <div className="flex gap-1 mt-0.5">
                        {activity?.manual > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.8)]" />}
                        {activity?.receipt > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.8)]" />}
                    </div>
                </button>
            );
        }
        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="glass-panel h-full flex flex-col p-6 relative">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Pantry Activity</h3>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded"><ChevronLeft size={16} /></button>
                    <span className="text-sm font-medium w-32 text-center">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                    <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded"><ChevronRight size={16} /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-xs text-muted font-medium py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 flex-grow content-start">
                {renderDays()}
            </div>

            <div className="flex gap-4 mt-4 text-xs text-muted justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.8)]"></div>
                    <span>Activity</span>
                </div>
            </div>

            {/* Centered Modal (Popup Box) */}
            {isModalOpen && selectedDate && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div
                        className="bg-[#121212] w-full max-w-[360px] rounded-2xl border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden"
                        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 40px -10px rgba(0,0,0,0.8)' }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="font-semibold text-base">Activity Details</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-muted hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 max-h-[60vh] overflow-y-auto">
                            <h4 className="text-sm font-medium text-blue-400 mb-4 text-center">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </h4>
                            <PantryHistoryList selectedDate={selectedDate} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
