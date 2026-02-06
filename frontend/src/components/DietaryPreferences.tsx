import React, { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';
import { auth } from '../firebase';

const DIETS = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'keto', label: 'Keto' },
    { id: 'paleo', label: 'Paleo' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'high-protein', label: 'High Protein' },
    { id: 'low-carb', label: 'Low Carb' }
];

export const DietaryPreferences: React.FC = () => {
    const [proteinTarget, setProteinTarget] = useState(150);
    const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            const res = await fetch(`http://localhost:8000/api/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.proteinTarget) setProteinTarget(data.proteinTarget);
            if (data.tags) setSelectedDiets(data.tags);
        } catch (err) {
            console.error("Failed to load preferences", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            await fetch(`http://localhost:8000/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    proteinTarget,
                    tags: selectedDiets
                })
            });

            setMessage("Preferences saved!");
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error("Failed to save", err);
            setMessage("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    const toggleDiet = (id: string) => {
        if (selectedDiets.includes(id)) {
            setSelectedDiets(selectedDiets.filter(d => d !== id));
        } else {
            setSelectedDiets([...selectedDiets, id]);
        }
    };

    if (loading) return <div className="animate-pulse h-40 bg-white/5 rounded-xl"></div>;

    return (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
            <h2 className="text-xl font-bold mb-4">Dietary Goals</h2>

            {/* Protein Slider */}
            <div className="mb-6">
                <div className="flex justify-between mb-2">
                    <span className="text-muted">Daily Protein Target</span>
                    <span className="text-primary font-bold text-lg">{proteinTarget}g <span className="text-muted text-sm font-normal">/ 250g</span></span>
                </div>
                <input
                    type="range"
                    min="30"
                    max="250"
                    value={proteinTarget}
                    onChange={(e) => setProteinTarget(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            {/* Diet Chips */}
            <div className="mb-6">
                <div className="text-muted mb-3 text-sm">Dietary Preferences</div>
                <div className="flex flex-wrap gap-2">
                    {DIETS.map(diet => (
                        <button
                            key={diet.id}
                            onClick={() => toggleDiet(diet.id)}
                            className={`btn btn-sm ${selectedDiets.includes(diet.id) ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                                borderRadius: '20px',
                                border: selectedDiets.includes(diet.id) ? 'none' : '1px solid var(--glass-border)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {diet.label}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary w-full justify-center"
            >
                {saving ? (
                    <span className="animate-spin mr-2">⏳</span>
                ) : message ? (
                    <Check size={18} className="mr-2" />
                ) : (
                    <Save size={18} className="mr-2" />
                )}
                {message || (saving ? "Saving..." : "Save Preferences")}
            </button>
        </div>
    );
};
