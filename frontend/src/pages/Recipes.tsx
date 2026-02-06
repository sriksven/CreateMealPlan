import React, { useState } from 'react';
import { Clock, Flame, ChefHat, AlertCircle } from 'lucide-react';
import { auth } from '../firebase';
import { DailyNutritionWidget } from '../components/DailyNutritionWidget';

const API_BASE_URL = "http://localhost:8000";

const CUISINES = [
    "Indian", "Italian", "Mexican", "Chinese", "Thai",
    "Japanese", "Mediterranean", "Greek", "French", "Spanish",
    "American", "Korean", "Vietnamese", "Middle Eastern", "Caribbean"
];

interface Recipe {
    title: string;
    time: string;
    difficulty: string;
    calories: string;
    protein: string;
    description: string;
    usedIngredients: string[];
    missingIngredients: string[];
    instructions: string[];
}

const Recipes: React.FC = () => {
    const [selectedCuisine, setSelectedCuisine] = useState<string | null>("Indian");
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!selectedCuisine) return;
        setLoading(true);
        setError(null);
        setRecipes([]);

        try {
            const user = auth.currentUser;
            if (!user) {
                setError("Please log in to generate recipes.");
                return;
            }

            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE_URL}/api/recipes/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ cuisine: selectedCuisine })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to generate recipes");
            }

            const data = await res.json();
            setRecipes(data.recipes);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content" style={{ paddingBottom: '80px' }}>
            {/* Daily Nutrition Widget */}
            <DailyNutritionWidget />

            {/* Header */}
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h1 className="text-2xl">Suggested Recipes</h1>
                <span className="badge">AI Powered</span>
            </div>


            {/* Cuisine Selector */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 className="section-title" style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
                    Select a Cuisine
                </h3>
                <div
                    className="no-scrollbar"
                    style={{
                        display: 'flex',
                        gap: '0.75rem',
                        overflowX: 'auto',
                        paddingBottom: '0.5rem',
                        maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
                    }}
                >
                    {CUISINES.map(c => (
                        <button
                            key={c}
                            onClick={() => setSelectedCuisine(c === selectedCuisine ? null : c)}
                            className={`btn ${selectedCuisine === c ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                                whiteSpace: 'nowrap',
                                padding: '0.5rem 1.25rem',
                                borderRadius: '100px',
                                border: selectedCuisine === c ? 'none' : '1px solid var(--glass-border)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Area */}
            {selectedCuisine && !loading && recipes.length === 0 && (
                <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <button
                        onClick={handleGenerate}
                        className="btn btn-primary btn-lg w-full"
                        style={{ maxWidth: '300px' }}
                    >
                        <ChefHat size={20} style={{ marginRight: '0.5rem' }} />
                        Generate {selectedCuisine} Recipes
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted animate-pulse">Consulting the AI Chef...</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="glass-panel" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: '2rem' }}>
                    <div className="flex items-center gap-2">
                        <AlertCircle size={20} />
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Recipe Results */}
            <div className="grid grid-cols-1 grid-cols-2" style={{ gap: '1.5rem' }}>
                {recipes.map((recipe, idx) => (
                    <div
                        key={idx}
                        className="glass-panel animate-fade-in-up"
                        style={{
                            padding: 0,
                            overflow: 'hidden',
                            animationDelay: `${idx * 0.1}s`,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Card Header (Title & Meta) */}
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 className="text-xl" style={{ marginBottom: '0.5rem', lineHeight: '1.3' }}>{recipe.title}</h3>
                            <div className="flex gap-4 text-muted" style={{ fontSize: '0.85rem' }}>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    <span>{recipe.time}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Flame size={14} color="var(--accent-primary)" />
                                    <span>{recipe.calories}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span style={{
                                        padding: '0.1rem 0.5rem',
                                        borderRadius: '4px',
                                        background: 'var(--bg-secondary)',
                                        fontSize: '0.75rem'
                                    }}>
                                        {recipe.difficulty}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description & Ingredients */}
                        <div style={{ padding: '1.25rem', flex: 1 }}>
                            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                                {recipe.description}
                            </p>

                            <div style={{ marginBottom: '0.5rem' }}>
                                <span className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Missing Ingredients</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {recipe.missingIngredients.length > 0 ? (
                                        recipe.missingIngredients.map((ing, i) => (
                                            <span key={i} className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: 'none' }}>
                                                {ing}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-accent" style={{ fontSize: '0.85rem' }}>None! You have everything.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                            <button className="btn btn-secondary btn-sm w-full" style={{ justifyContent: 'center' }}>
                                View Full Recipe
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Recipes;
