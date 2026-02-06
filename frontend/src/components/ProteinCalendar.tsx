import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { auth } from "../firebase";

const API_BASE_URL = "http://localhost:8000";

interface ProteinCalendarProps {
    target: number;
}

export const ProteinCalendar: React.FC<ProteinCalendarProps> = ({ target }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [history, setHistory] = useState<Record<string, { protein: number }>>({});

    useEffect(() => {
        loadHistory();
    }, [currentMonth]);

    const loadHistory = async () => {
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) return;

            // Fetch history (endpoint gives 30 days, we might need to adjust endpoint later for specific month, 
            // but for now let's use what we have or just fetch all logic if needed. 
            // The existing endpoint is /api/nutrition/history which works relative to "now".
            // Ideally we should pass dates. But let's check if the generic history endpoint is enough or if we should add date range support.
            // For now, let's use the existing endpoint and map it.

            const res = await fetch(`${API_BASE_URL}/api/nutrition/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setHistory(data.history);
            }
        } catch (err) {
            console.error(err);
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
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const protein = history[dateStr]?.protein || 0;
            const percentage = Math.min(100, Math.max(0, (protein / target) * 100));

            // Ring Calc
            const radius = 10;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            days.push(
                <div key={dateStr} className="relative flex items-center justify-center h-8 w-8">
                    {/* Background Ring */}
                    <svg className="absolute w-full h-full transform -rotate-90" style={{ padding: '2px' }}>
                        <circle
                            cx="50%" cy="50%" r={radius}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="3.5"
                            fill="transparent"
                        />
                        <circle
                            cx="50%" cy="50%" r={radius}
                            stroke="#3b82f6"
                            strokeWidth="3.5"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{ filter: percentage > 0 ? 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))' : 'none' }}
                        />
                    </svg>
                    <span className="text-xs z-10 font-medium text-muted">{d}</span>
                </div>
            );
        }
        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="glass-panel h-full flex flex-col p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Protein Activity</h3>
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
                    <div className="w-3 h-3 rounded-full border-2 border-accent-primary"></div>
                    <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-success"></div>
                    <span>Goal Met</span>
                </div>
            </div>
        </div>
    );
};
