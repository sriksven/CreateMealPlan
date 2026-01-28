import React, { useState } from 'react';
import { Plus, Search, ChevronDown, ChevronRight } from 'lucide-react';

const MyPantry: React.FC = () => {
    const [categories, setCategories] = useState({
        produce: {
            expanded: true, items: [
                { id: 1, name: 'Tomatoes', qty: '4', expiry: '3 days' },
                { id: 2, name: 'Spinach', qty: '1 bag', expiry: '2 days' },
            ]
        },
        cereal: {
            expanded: true, items: [
                { id: 3, name: 'Oats', qty: '500g', expiry: '3 mos' },
                { id: 4, name: 'Granola', qty: '1 box', expiry: '1 mo' },
            ]
        },
        other: {
            expanded: true, items: [
                { id: 5, name: 'Pasta', qty: '2 boxes', expiry: '1 yr' },
                { id: 6, name: 'Olive Oil', qty: '1 btl', expiry: '6 mos' },
            ]
        }
    });

    const toggleCategory = (key: keyof typeof categories) => {
        setCategories(prev => ({
            ...prev,
            [key]: { ...prev[key], expanded: !prev[key].expanded }
        }));
    };

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h1 className="text-2xl">My Pantry</h1>
                <button className="btn btn-primary btn-sm">
                    <Plus size={18} />
                    Manual Add
                </button>
            </div>

            {/* Simple Search */}
            <div className="glass-panel" style={{ padding: '0.8rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Search className="text-muted" size={20} />
                    <input type="text" placeholder="Search ingredients..." className="input-field" style={{ border: 'none', background: 'transparent', padding: 0 }} />
                </div>
            </div>

            {/* Categorized List */}
            <div className="flex flex-col gap-4">
                {(Object.entries(categories) as [keyof typeof categories, any][]).map(([key, data]) => (
                    <div key={key} className="glass-panel" style={{ padding: '0' }}>
                        <div
                            onClick={() => toggleCategory(key)}
                            style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: data.expanded ? '1px solid var(--glass-border)' : 'none' }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xl" style={{ textTransform: 'capitalize' }}>{key}</span>
                                <span className="badge" style={{ margin: 0, fontSize: '0.75rem' }}>{data.items.length}</span>
                            </div>
                            {data.expanded ? <ChevronDown size={20} className="text-muted" /> : <ChevronRight size={20} className="text-muted" />}
                        </div>

                        {data.expanded && (
                            <div>
                                {data.items.map((item: any) => (
                                    <div key={item.id} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{item.name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Expires: {item.expiry}</div>
                                        </div>
                                        <div style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                                            {item.qty}
                                        </div>
                                    </div>
                                ))}
                                <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                                    + Add to {key}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyPantry;
