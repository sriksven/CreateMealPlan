import React from 'react';
import { Plus, Search } from 'lucide-react';

const Dashboard: React.FC = () => {
    const pantryItems = [
        { id: 1, name: 'Pasta', quantity: '2 boxes', expiry: '2024-12-01' },
        { id: 2, name: 'Tomato Sauce', quantity: '3 jars', expiry: '2024-06-15' },
        { id: 3, name: 'Chicken Breast', quantity: '1 kg', expiry: '2024-02-10' },
        { id: 4, name: 'Rice', quantity: '5 kg', expiry: '2025-01-01' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-2xl" style={{ marginBottom: '0.5rem' }}>Pantry Inventory</h1>
                    <p className="text-muted">Manage your kitchen essentials</p>
                </div>
                <button className="btn btn-primary btn-sm">
                    <Plus size={20} />
                    Add Item
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', position: 'sticky', top: '100px', zIndex: 10 }}>
                <div style={{ position: 'relative' }}>
                    <Search className="text-muted" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="input-field"
                        style={{ paddingLeft: '3rem' }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 grid-cols-3">
                {pantryItems.map(item => (
                    <div key={item.id} className="glass-panel">
                        <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                            <h3 className="text-xl">{item.name}</h3>
                            <span className="badge" style={{ marginBottom: 0 }}>
                                {item.quantity}
                            </span>
                        </div>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Expires: {item.expiry}</p>
                    </div>
                ))}
            </div>

            <div className="text-center mt-big">
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Pro Tip: Use the mobile app to scan items via camera.</p>
            </div>
        </div>
    );
};

export default Dashboard;
