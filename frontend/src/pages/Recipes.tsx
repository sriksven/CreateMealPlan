import React from 'react';
import { ChefHat, Clock, Flame } from 'lucide-react';

const Recipes: React.FC = () => {
    const recipes = [
        { id: 1, title: 'Spicy Chicken Pasta', protein: '45g', time: '30m', image: '🍝', type: 'High Protein' },
        { id: 2, title: 'Quinoa Power Bowl', protein: '22g', time: '15m', image: '🥗', type: 'Vegetarian' },
        { id: 3, title: 'Grilled Salmon', protein: '38g', time: '25m', image: '🐟', type: 'Keto' },
        { id: 4, title: 'Egg & Avocado Toast', protein: '18g', time: '10m', image: '🥑', type: 'Breakfast' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h1 className="text-2xl">Suggested Recipes</h1>
                <span className="badge">Based on your pantry</span>
            </div>

            <div className="grid grid-cols-1 grid-cols-2">
                {recipes.map(recipe => (
                    <div key={recipe.id} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ height: '140px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                            {recipe.image}
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem' }}>
                                <h3 className="text-xl" style={{ fontSize: '1.1rem' }}>{recipe.title}</h3>
                            </div>
                            <div className="flex gap-4 text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                                <div className="flex items-center gap-2">
                                    <Flame size={16} color="var(--accent-primary)" />
                                    <span>{recipe.protein}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span>{recipe.time}</span>
                                </div>
                            </div>
                            <button className="btn btn-secondary btn-sm w-full" style={{ justifyContent: 'center' }}>
                                View Recipe
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recipes;
