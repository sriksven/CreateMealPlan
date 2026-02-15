import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { auth } from "../firebase";

const API_BASE_URL = "http://localhost:8000";

interface ProteinCalendarProps {
    proteinTarget: number;
    calorieTarget: number;
}

export const ProteinCalendar: React.FC<ProteinCalendarProps> = ({ proteinTarget, calorieTarget }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [history, setHistory] = useState<Record<string, { protein: number; calories: number; recipes?: string[] }>>({});

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, [currentMonth]);

    const loadHistory = async () => {
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) return;

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
        setSelectedDate(null);
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const renderDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        const todayDate = today.getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} style={{ width: '40px', height: '40px' }} />);

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const historyEntry = history[dateStr];
            const protein = historyEntry?.protein || 0;
            const calories = historyEntry?.calories || 0;

            const proteinPct = Math.min(100, Math.max(0, (protein / proteinTarget) * 100));
            const caloriePct = Math.min(100, Math.max(0, (calories / calorieTarget) * 100));

            const isToday = isCurrentMonth && d === todayDate;
            const isSelected = selectedDate === dateStr;

            // Ring Calculators
            // Outer Ring: Calories (Radius 14)
            const r1 = 14;
            const c1 = 2 * Math.PI * r1;
            const dash1 = c1 - (caloriePct / 100) * c1;

            // Inner Ring: Protein (Radius 10)
            const r2 = 10;
            const c2 = 2 * Math.PI * r2;
            const dash2 = c2 - (proteinPct / 100) * c2;

            days.push(
                <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative flex flex-col items-center justify-center rounded-lg hover:bg-white/5 transition-colors p-0.5 ${isSelected ? 'bg-white/10' : ''} ${isToday ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}`}
                    style={{ minHeight: '42px' }}
                >
                    <div className="relative w-8 h-8 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Outer Ring Background (Calories) */}
                            <circle cx="50%" cy="50%" r={r1} stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" fill="transparent" />
                            {/* Inner Ring Background (Protein) */}
                            <circle cx="50%" cy="50%" r={r2} stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" fill="transparent" />

                            {/* Outer Ring Progress (Calories - Orange) */}
                            <circle
                                cx="50%" cy="50%" r={r1}
                                stroke="#fb923c" // Orange-400
                                strokeWidth="2.5"
                                fill="transparent"
                                strokeDasharray={c1}
                                strokeDashoffset={dash1}
                                strokeLinecap="round"
                                style={{ filter: caloriePct > 0 ? 'drop-shadow(0 0 1px rgba(251, 146, 60, 0.5))' : 'none' }}
                            />

                            {/* Inner Ring Progress (Protein - Blue) */}
                            <circle
                                cx="50%" cy="50%" r={r2}
                                stroke="#3b82f6" // Blue-500
                                strokeWidth="2.5"
                                fill="transparent"
                                strokeDasharray={c2}
                                strokeDashoffset={dash2}
                                strokeLinecap="round"
                                style={{ filter: proteinPct > 0 ? 'drop-shadow(0 0 1px rgba(59, 130, 246, 0.5))' : 'none' }}
                            />
                        </svg>
                    </div>
                    <span className={`text-[9px] leading-none font-medium text-muted mt-0.5 ${isToday ? 'text-blue-400 font-bold' : ''}`}>
                        {d}
                    </span>
                </button>
            );
        }
        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="glass-panel flex flex-col p-6 h-full min-h-0 relative">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Protein & Calorie Activity</h3>
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

            <div className="grid grid-cols-7 gap-1 content-start flex-grow">
                {renderDays()}
            </div>

            {/* Legend removed per user request */}

            {/* Recipe Details Modal */}
            {selectedDate && createPortal(
                <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        background: 'rgba(0, 0, 0, 0.8)' // Darker overlay like Recipes
                    }}
                    onClick={() => setSelectedDate(null)}
                >
                    <div
                        className="glass-panel relative overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                        style={{
                            animation: 'fadeInUp 0.3s ease-out',
                            width: '90%',
                            maxWidth: '500px', // Slightly narrower than recipe modal for list content
                            maxHeight: '85vh',
                            padding: '1.5rem'
                        }}
                    >
                        {/* Close Button - Matching Recipes style */}
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="absolute top-3 right-3 flex items-center justify-center rounded-full transition-all"
                            style={{
                                width: '30px',
                                height: '30px',
                                fontSize: '20px',
                                lineHeight: 1,
                                background: 'rgba(255, 255, 255, 0.15)',
                                color: '#fff',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            ×
                        </button>

                        <div className="mb-6 border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Daily Meals</h3>
                            <p className="text-sm text-muted mt-1">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>

                        {history[selectedDate]?.recipes && history[selectedDate].recipes!.length > 0 ? (
                            <ul className="space-y-4">
                                {history[selectedDate].recipes!.map((recipe, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-base text-gray-200 p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                        <span>{recipe}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-12 text-muted">
                                <p>No meals logged for this day.</p>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
