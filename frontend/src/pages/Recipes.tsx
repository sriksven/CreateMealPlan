import React, { useState, useEffect } from 'react';
import { Clock, Flame, AlertCircle } from 'lucide-react';
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
    completed?: boolean;
    completedAt?: Date;
}

const Recipes: React.FC = () => {
    const [selectedCuisine, setSelectedCuisine] = useState<string | null>("Indian");
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [completingRecipe, setCompletingRecipe] = useState<number | null>(null);
    const [nutritionRefresh, setNutritionRefresh] = useState(0);

    // Load recipes from local storage and fetch daily completion status on mount
    useEffect(() => {
        const loadSavedData = async () => {
            try {
                // 1. Load cached recipes from local storage
                const savedRecipes = localStorage.getItem('generatedRecipes');
                let currentRecipes: Recipe[] = savedRecipes ? JSON.parse(savedRecipes) : [];

                if (currentRecipes.length > 0) {
                    setRecipes(currentRecipes);
                }

                // 2. Fetch today's completed recipes from backend to sync status
                // This ensures that even if local storage is stale, we get the true "completed" state from DB
                const user = auth.currentUser;
                if (!user) return;

                const token = await user.getIdToken();
                const res = await fetch(`${API_BASE_URL}/api/nutrition/today`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    const completedTitles = new Set(data.meals?.map((m: any) => m.label) || []);

                    // Update recipes with backend completion status
                    if (currentRecipes.length > 0 && completedTitles.size > 0) {
                        const syncedRecipes = currentRecipes.map(r => ({
                            ...r,
                            completed: completedTitles.has(r.title) || r.completed,
                            completedAt: completedTitles.has(r.title) ? (r.completedAt || new Date()) : r.completedAt
                        }));
                        setRecipes(syncedRecipes);
                        localStorage.setItem('generatedRecipes', JSON.stringify(syncedRecipes));
                    }
                }
            } catch (err) {
                console.error("Error loading saved data:", err);
            }
        };

        loadSavedData();
    }, []);

    // Save recipes to local storage whenever they change
    useEffect(() => {
        if (recipes.length > 0) {
            localStorage.setItem('generatedRecipes', JSON.stringify(recipes));
        }
    }, [recipes]);

    const handleGenerate = async (cuisine: string) => {
        if (!cuisine) return;
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
                body: JSON.stringify({ cuisine })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to generate recipes");
            }

            const data = await res.json();

            // Check against today's completed logs again to be safe? 
            // For now just set fresh recipes. User can refresh to sync if needed, 
            // or we could optimistically check against a 'completedTitles' state if we kept one.
            setRecipes(data.recipes);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteRecipe = async (recipe: Recipe, index: number) => {
        if (recipe.completed) return; // Already completed

        setCompletingRecipe(index);

        try {
            const user = auth.currentUser;
            if (!user) {
                alert("Please log in to complete recipes.");
                return;
            }

            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE_URL}/api/nutrition/complete-recipe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ recipe })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to complete recipe');
            }

            await res.json();

            // Update recipe state
            const updatedRecipes = [...recipes];
            updatedRecipes[index] = {
                ...recipe,
                completed: true,
                completedAt: new Date()
            };
            setRecipes(updatedRecipes);

            // Refresh nutrition widget
            setNutritionRefresh(prev => prev + 1);

        } catch (error: any) {
            console.error('Error completing recipe:', error);
            alert(`Failed to complete recipe: ${error.message}`);
        } finally {
            setCompletingRecipe(null);
        }
    };

    // Auto-load Indian recipes on mount
    useEffect(() => {
        handleGenerate("Indian");
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="page-content" style={{ paddingBottom: '80px' }}>
            {/* Daily Nutrition Widget */}
            <DailyNutritionWidget key={nutritionRefresh} />

            {/* Header */}
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h1 className="text-2xl">Suggested Recipes</h1>
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
                            onClick={() => {
                                const newCuisine = c === selectedCuisine ? null : c;
                                setSelectedCuisine(newCuisine);
                                if (newCuisine) {
                                    handleGenerate(newCuisine);
                                } else {
                                    setRecipes([]);
                                }
                            }}
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
                        <div style={{
                            padding: '1.25rem',
                            borderBottom: '1px solid var(--glass-border)',
                            opacity: recipe.completed ? 0.6 : 1,
                            position: 'relative'
                        }}>
                            {/* Checkbox - Top Right */}
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                zIndex: 10
                            }}>
                                <input
                                    type="checkbox"
                                    checked={recipe.completed || false}
                                    onChange={() => handleCompleteRecipe(recipe, idx)}
                                    disabled={recipe.completed || completingRecipe === idx}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        cursor: recipe.completed ? 'default' : 'pointer',
                                        accentColor: 'var(--accent-primary)'
                                    }}
                                />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl" style={{
                                marginBottom: '0.5rem',
                                lineHeight: '1.3',
                                paddingRight: '3rem' // Space for checkbox
                            }}>
                                {recipe.title}
                                {recipe.completed && <span style={{ marginLeft: '0.5rem', fontSize: '1.2rem' }}>✓</span>}
                            </h3>

                            {/* Completion timestamp */}
                            {recipe.completed && recipe.completedAt && (
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    marginBottom: '0.5rem'
                                }}>
                                    Completed at {new Date(recipe.completedAt).toLocaleTimeString()}
                                </div>
                            )}
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
                            <button
                                className="btn btn-secondary btn-sm w-full"
                                style={{ justifyContent: 'center' }}
                                onClick={() => {
                                    setSelectedRecipe(recipe);
                                    setShowModal(true);
                                }}
                            >
                                View Full Recipe
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recipe Detail Modal */}
            {showModal && selectedRecipe && (
                <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        background: 'rgba(0, 0, 0, 0.8)'
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="glass-panel relative overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            animation: 'fadeInUp 0.3s ease-out',
                            width: '80%',
                            maxWidth: '800px',
                            maxHeight: '85vh'
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 flex items-center justify-center rounded-full transition-all"
                            style={{
                                width: '36px',
                                height: '36px',
                                fontSize: '28px',
                                lineHeight: 1,
                                background: 'rgba(255, 255, 255, 0.15)',
                                color: '#fff',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            ×
                        </button>

                        {/* Recipe Header */}
                        <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                            <h2 className="text-2xl font-bold mb-3">{selectedRecipe.title}</h2>
                            <div className="flex gap-4 text-muted" style={{ fontSize: '0.9rem' }}>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={16} />
                                    <span>{selectedRecipe.time}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Flame size={16} color="var(--accent-primary)" />
                                    <span>{selectedRecipe.calories}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '4px',
                                        background: 'var(--bg-secondary)',
                                        fontSize: '0.8rem'
                                    }}>
                                        {selectedRecipe.difficulty}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 className="text-lg font-bold mb-2">Description</h3>
                            <p className="text-muted" style={{ lineHeight: '1.6' }}>{selectedRecipe.description}</p>
                        </div>

                        {/* Ingredients */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 className="text-lg font-bold mb-3">Ingredients</h3>

                            {selectedRecipe.usedIngredients.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 className="text-sm text-muted uppercase tracking-wider mb-2">You Have</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRecipe.usedIngredients.map((ing, i) => (
                                            <span key={i} className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'none' }}>
                                                ✓ {ing}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedRecipe.missingIngredients.length > 0 && (
                                <div>
                                    <h4 className="text-sm text-muted uppercase tracking-wider mb-2">You Need</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRecipe.missingIngredients.map((ing, i) => (
                                            <span key={i} className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: 'none' }}>
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Instructions */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">Instructions</h3>
                            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                                {selectedRecipe.instructions.map((step, i) => (
                                    <li key={i} className="text-muted mb-3" style={{ paddingLeft: '0.5rem' }}>
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Recipes;
