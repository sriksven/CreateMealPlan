import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Check, X, Sparkles } from 'lucide-react';

interface ShoppingItem {
    id: string;
    name: string;
    checked: boolean;
    addedAt: number;
}

interface SuggestionItem {
    id: string;
    name: string;
    reason: string;
}

const ShoppingList: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'suggestions' | 'cart'>('suggestions');
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [newItem, setNewItem] = useState('');
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([
        { id: 's1', name: 'Olive Oil', reason: 'Running Low' },
        { id: 's2', name: 'Eggs', reason: 'Frequent Purchase' },
        { id: 's3', name: 'Basmati Rice', reason: 'For Butter Chicken' },
        { id: 's4', name: 'Greek Yogurt', reason: 'High Protein Goal' },
        { id: 's5', name: 'Spinach', reason: 'Weekly Staple' },
    ]);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('shoppingList');
        if (saved) {
            setItems(JSON.parse(saved));
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('shoppingList', JSON.stringify(items));
    }, [items]);

    const addItem = (name: string) => {
        if (!name.trim()) return;
        const item: ShoppingItem = {
            id: Date.now().toString(),
            name: name.trim(),
            checked: false,
            addedAt: Date.now()
        };
        setItems([item, ...items]); // Add to top
    };

    const handleManualAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addItem(newItem);
        setNewItem('');
    };

    const toggleItem = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const deleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    // Suggestion Actions
    const acceptSuggestion = (suggestion: SuggestionItem) => {
        addItem(suggestion.name);
        setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
        // Optional: Switch to cart tab automatically?
        // setActiveTab('cart');
    };

    const dismissSuggestion = (id: string) => {
        setSuggestions(suggestions.filter(s => s.id !== id));
    };

    // Sort items: Unchecked first, then Checked (at bottom)
    const sortedItems = [...items].sort((a, b) => {
        if (a.checked === b.checked) return b.addedAt - a.addedAt; // Newest first
        return a.checked ? 1 : -1; // Checked go to bottom
    });

    return (
        <div className="page-content pb-24">
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-2xl font-bold">Smart Cart</h1>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-2 gap-4 mb-8 w-full mx-auto">
                <button
                    onClick={() => setActiveTab('suggestions')}
                    style={{ color: activeTab === 'suggestions' ? '#ffffff' : '#9ca3af' }}
                    className={`py-3 rounded-2xl text-sm font-bold transition-all duration-300 border flex items-center justify-center gap-2 ${activeTab === 'suggestions' ? 'bg-blue-600 border-transparent shadow-xl shadow-blue-900/20 scale-105' : 'bg-white/5 border-white/5 hover:text-white hover:bg-white/10 hover:border-white/10'}`}
                >
                    <Sparkles size={16} />
                    Smart Suggestions
                    {suggestions.length > 0 && (
                        <span className="bg-white text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {suggestions.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('cart')}
                    style={{ color: activeTab === 'cart' ? '#ffffff' : '#9ca3af' }}
                    className={`py-3 rounded-2xl text-sm font-bold transition-all duration-300 border flex items-center justify-center gap-2 ${activeTab === 'cart' ? 'bg-blue-600 border-transparent shadow-xl shadow-blue-900/20 scale-105' : 'bg-white/5 border-white/5 hover:text-white hover:bg-white/10 hover:border-white/10'}`}
                >
                    <ShoppingCart size={16} />
                    My Shopping List
                    {items.length > 0 && (
                        <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {items.filter(i => !i.checked).length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="max-w-xl mx-auto">

                {/* SUGGESTIONS TAB */}
                {activeTab === 'suggestions' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Manual Add in Suggestions */}
                        <form onSubmit={handleManualAdd} className="flex gap-2">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Add item manually..."
                                className="input-field flex-1"
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg px-6 transition-all shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                                disabled={!newItem.trim()}
                            >
                                <Plus size={24} strokeWidth={3} />
                            </button>
                        </form>

                        {suggestions.length === 0 ? (
                            <div className="text-center py-12 glass-panel">
                                <Sparkles size={48} className="mx-auto mb-4 text-blue-500/30" />
                                <p className="text-muted">No suggestions right now.</p>
                                <p className="text-xs text-muted mt-2">Check back after adding more recipes!</p>
                            </div>
                        ) : (
                            suggestions.map(suggestion => (
                                <div key={suggestion.id} className="glass-panel p-4 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                                    <div>
                                        <h3 className="font-semibold text-lg">{suggestion.name}</h3>
                                        <p className="text-xs text-blue-400 flex items-center gap-1 mt-1">
                                            <Sparkles size={12} />
                                            {suggestion.reason}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => dismissSuggestion(suggestion.id)}
                                            className="p-2 rounded-full hover:bg-white/10 text-muted hover:text-red-400 transition-colors"
                                            title="Dismiss"
                                        >
                                            <X size={20} />
                                        </button>
                                        <button
                                            onClick={() => acceptSuggestion(suggestion)}
                                            className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-110"
                                            title="Add to Cart"
                                        >
                                            <Check size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* CART TAB */}
                {activeTab === 'cart' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Input */}
                        <form onSubmit={handleManualAdd} className="mb-6 flex gap-2">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Add item manually..."
                                className="input-field flex-1"
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg px-6 transition-all shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                                disabled={!newItem.trim()}
                            >
                                <Plus size={24} strokeWidth={3} />
                            </button>
                        </form>

                        {/* List */}
                        <div className="space-y-3">
                            {sortedItems.length === 0 ? (
                                <div className="text-center py-12 text-muted">
                                    <p>Your cart is empty.</p>
                                </div>
                            ) : (
                                sortedItems.map(item => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${item.checked
                                            ? 'bg-white/5 border-transparent opacity-50'
                                            : 'glass-panel border-white/10'
                                            }`}
                                    >
                                        {/* Left Side: Checkbox & Name */}
                                        <div className="flex items-center gap-4 overflow-hidden flex-1">
                                            <button
                                                onClick={() => toggleItem(item.id)}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.checked
                                                    ? 'bg-blue-500 border-blue-500 text-white scale-90'
                                                    : 'border-white/30 hover:border-blue-500 hover:scale-110'
                                                    }`}
                                            >
                                                {item.checked && <Check size={14} strokeWidth={4} />}
                                            </button>
                                            <span className={`text-lg truncate transition-all ${item.checked ? 'line-through text-muted' : 'text-white'}`}>
                                                {item.name}
                                            </span>
                                        </div>

                                        {/* Right Side: Delete */}
                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            className="text-muted hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-full"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShoppingList;
