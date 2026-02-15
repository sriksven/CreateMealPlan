import React, { useEffect, useState } from 'react';
import { Flame, Activity, Clock } from 'lucide-react';
import { auth } from '../firebase';

const API_BASE_URL = "http://localhost:8000";

export const DailyNutritionWidget: React.FC = () => {
    const [stats, setStats] = useState({ calories: 0, protein: 0 });
    const [targets, setTargets] = useState({ calories: 2000, protein: 150 });
    const [tags, setTags] = useState<string[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Clock timer
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);

        loadDailyStats();
        loadTargets();

        return () => clearInterval(timer);
    }, []);

    const loadTargets = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.proteinTarget) setTargets(prev => ({ ...prev, protein: data.proteinTarget }));
            if (data.calorieTarget) setTargets(prev => ({ ...prev, calories: data.calorieTarget }));
            if (data.tags) setTags(data.tags);
        } catch (e) {
            console.error(e);
        }
    };

    const loadDailyStats = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE_URL}/api/nutrition/today`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setStats(data);
        } catch (e) {
            console.error(e);
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(date);
    };

    return (
        <div className="glass-panel" style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
        }}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Activity size={18} className="text-primary" />
                        Daily Nutrition
                    </h3>
                    <div className="text-muted text-sm flex items-center gap-2 mt-1">
                        <Clock size={12} />
                        <span>{formatDate(currentTime)} • {formatTime(currentTime)}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Protein Bar */}
                <div className="relative">
                    <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="flex items-center gap-2 text-blue-300">
                            <Flame size={14} className="text-blue-500" />
                            Protein
                        </span>
                        <span>{Math.round(stats.protein)} <span className="text-muted">/ {targets.protein}g</span></span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                        {/* Background Stripes */}
                        <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }}>
                        </div>
                        {/* Progress */}
                        <div
                            className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                            style={{
                                width: `${Math.min((stats.protein / targets.protein) * 100, 100)}%`,
                                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                            }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Calories Bar */}
                <div className="relative">
                    <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="flex items-center gap-2 text-orange-300">
                            <Activity size={14} className="text-orange-500" />
                            Calories
                        </span>
                        <span>{Math.round(stats.calories)} <span className="text-muted">/ {targets.calories}</span></span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                        {/* Background Stripes */}
                        <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }}>
                        </div>
                        {/* Progress */}
                        <div
                            className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                            style={{
                                width: `${Math.min((stats.calories / targets.calories) * 100, 100)}%`,
                                background: 'linear-gradient(90deg, #f97316, #fbbf24)'
                            }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Dietary Preferences */}
                {tags.length > 0 && (
                    <div className="pt-4 border-t border-white/5">
                        <div className="text-xs text-muted uppercase tracking-wider mb-3 font-semibold">
                            Dietary Preferences
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                                    style={{
                                        background: 'rgba(59, 130, 246, 0.2)',
                                        color: '#60a5fa',
                                        border: '1px solid rgba(59, 130, 246, 0.3)'
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
