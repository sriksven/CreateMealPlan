import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, ChevronRight, Trash2, Edit2, X, Check } from 'lucide-react';
import { auth } from '../firebase';
import { API_BASE_URL } from '../config';

interface PantryItem {
    id: string;
    name: string;
    quantity: string;
    unit: string;
    count?: string;
    category?: string;
    expiryDate?: string;
    addedDate: string;
}

interface CategorizedItems {
    [key: string]: {
        expanded: boolean;
        items: PantryItem[];
    };
}

const MyPantry: React.FC = () => {
    const [categories, setCategories] = useState<CategorizedItems>({
        produce: { expanded: true, items: [] },
        dairy: { expanded: true, items: [] },
        meat: { expanded: true, items: [] },
        grains: { expanded: true, items: [] },
        snacks: { expanded: true, items: [] },
        beverages: { expanded: true, items: [] },
        other: { expanded: true, items: [] },
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<PantryItem>>({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '',
        quantity: '',
        unit: '',
        count: '',
    });
    const [addError, setAddError] = useState('');

    useEffect(() => {
        fetchPantryItems();
    }, []);

    const fetchPantryItems = async () => {
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error('Not authenticated');

            const res = await fetch(`${API_BASE_URL}/api/pantry`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Failed to fetch pantry items');

            const data = await res.json();
            organizePantryItems(data.items);
        } catch (error) {
            console.error('Error fetching pantry:', error);
        } finally {
            setLoading(false);
        }
    };

    const organizePantryItems = (items: PantryItem[]) => {
        const organized: CategorizedItems = {
            produce: { expanded: true, items: [] },
            dairy: { expanded: true, items: [] },
            meat: { expanded: true, items: [] },
            grains: { expanded: true, items: [] },
            snacks: { expanded: true, items: [] },
            beverages: { expanded: true, items: [] },
            other: { expanded: true, items: [] },
        };

        items.forEach(item => {
            const category = item.category || 'other';
            if (organized[category]) {
                organized[category].items.push(item);
            } else {
                organized.other.items.push(item);
            }
        });

        setCategories(organized);
    };

    const deleteItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error('Not authenticated');

            const res = await fetch(`${API_BASE_URL}/api/pantry/items/${itemId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Failed to delete item');

            // Refresh the list
            fetchPantryItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item');
        }
    };

    const startEditing = (item: PantryItem) => {
        setEditingItem(item.id);
        setEditForm(item);
    };

    const cancelEditing = () => {
        setEditingItem(null);
        setEditForm({});
    };

    const saveEdit = async () => {
        if (!editingItem) return;

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error('Not authenticated');

            const res = await fetch(`${API_BASE_URL}/api/pantry/items/${editingItem}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });

            if (!res.ok) throw new Error('Failed to update item');

            cancelEditing();
            fetchPantryItems();
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item');
        }
    };

    const toggleCategory = (key: string) => {
        setCategories(prev => ({
            ...prev,
            [key]: { ...prev[key], expanded: !prev[key].expanded }
        }));
    };

    const handleAddItem = async () => {
        // Validation
        if (!addForm.name.trim()) {
            setAddError('Item name is required');
            return;
        }
        
        if (!addForm.quantity && !addForm.count) {
            setAddError('Please enter either quantity or count');
            return;
        }

        if (addForm.quantity && !addForm.unit) {
            setAddError('Please specify a unit (kg, lbs, oz, etc.)');
            return;
        }

        setLoading(true);
        setAddError('');

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error('Not authenticated');

            const payload: any = {
                name: addForm.name,
                quantity: addForm.quantity || addForm.count,
                unit: addForm.unit || (addForm.count ? 'count' : 'item'),
            };

            if (addForm.count) {
                payload.count = addForm.count;
            }

            const res = await fetch(`${API_BASE_URL}/api/pantry/item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to add item');

            // Reset form and close modal
            setAddForm({ name: '', quantity: '', unit: '', count: '' });
            setShowAddModal(false);
            
            // Refresh pantry items
            fetchPantryItems();
        } catch (error) {
            console.error('Error adding item:', error);
            setAddError('Failed to add item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = Object.entries(categories).reduce((acc, [key, data]) => {
        const filteredItems = data.items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filteredItems.length > 0) {
            acc[key] = { ...data, items: filteredItems };
        }
        return acc;
    }, {} as CategorizedItems);

    const totalItems = Object.values(categories).reduce((sum, cat) => sum + cat.items.length, 0);

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-2xl">My Pantry</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        {totalItems} items in your pantry
                    </p>
                </div>
                <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={18} />
                    Manual Add
                </button>
            </div>

            {/* Search */}
            <div className="glass-panel" style={{ padding: '0.8rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Search className="text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search ingredients..."
                        className="input-field"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', padding: 0 }}
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p className="text-muted">Loading your pantry...</p>
                </div>
            ) : totalItems === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p className="text-muted" style={{ marginBottom: '1rem' }}>
                        Your pantry is empty. Start by scanning a receipt!
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {Object.entries(filteredCategories).map(([key, data]) => (
                        <div key={key} className="glass-panel" style={{ padding: '0' }}>
                            <div
                                onClick={() => toggleCategory(key)}
                                style={{
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    borderBottom: data.expanded ? '1px solid var(--glass-border)' : 'none'
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xl" style={{ textTransform: 'capitalize' }}>{key}</span>
                                    <span className="badge" style={{ margin: 0, fontSize: '0.75rem' }}>{data.items.length}</span>
                                </div>
                                {data.expanded ? <ChevronDown size={20} className="text-muted" /> : <ChevronRight size={20} className="text-muted" />}
                            </div>

                            {data.expanded && (
                                <div>
                                    {data.items.map((item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                padding: '1rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                borderBottom: '1px solid var(--glass-border)'
                                            }}
                                        >
                                            {editingItem === item.id ? (
                                                <>
                                                    <div style={{ flex: 1, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        <input
                                                            type="text"
                                                            value={editForm.name || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            className="input-field"
                                                            style={{ flex: '1 1 150px', minWidth: '150px' }}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editForm.quantity || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                                                            className="input-field"
                                                            style={{ width: '80px' }}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editForm.unit || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                                                            className="input-field"
                                                            style={{ width: '80px' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
                                                        <button
                                                            onClick={saveEdit}
                                                            className="btn btn-sm"
                                                            style={{
                                                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                                color: 'var(--success)',
                                                                padding: '0.5rem'
                                                            }}
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="btn btn-sm"
                                                            style={{ padding: '0.5rem' }}
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                            Added: {new Date(item.addedDate).toLocaleDateString()}
                                                            {item.expiryDate && ` • Expires: ${new Date(item.expiryDate).toLocaleDateString()}`}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                                                            {item.quantity} {item.unit}
                                                            {item.count && ` (${item.count})`}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => startEditing(item)}
                                                                className="btn btn-sm"
                                                                style={{ padding: '0.5rem' }}
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteItem(item.id)}
                                                                className="btn btn-sm"
                                                                style={{
                                                                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                    color: 'var(--danger)',
                                                                    padding: '0.5rem'
                                                                }}
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Item Modal */}
            {showAddModal && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem',
                    }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div 
                        className="glass-panel"
                        style={{
                            maxWidth: '500px',
                            width: '100%',
                            padding: '2rem',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 className="text-xl">Add New Item</h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setAddForm({ name: '', quantity: '', unit: '', count: '' });
                                    setAddError('');
                                }}
                                className="btn btn-sm"
                                style={{ padding: '0.5rem' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Item Name */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                    Item Name *
                                </label>
                                <input
                                    type="text"
                                    value={addForm.name}
                                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g., Tomatoes, Chicken Breast"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            {/* Quantity and Unit */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                    Quantity & Unit
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={addForm.quantity}
                                        onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                                        className="input-field"
                                        placeholder="1.5"
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        type="text"
                                        value={addForm.unit}
                                        onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
                                        className="input-field"
                                        placeholder="kg, lbs, oz"
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </div>

                            {/* OR Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', flex: 1 }}></div>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>OR</span>
                                <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', flex: 1 }}></div>
                            </div>

                            {/* Count */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                    Count
                                </label>
                                <input
                                    type="text"
                                    value={addForm.count}
                                    onChange={(e) => setAddForm({ ...addForm, count: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g., 5 items"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            {/* Error Message */}
                            {addError && (
                                <div 
                                    className="glass-panel"
                                    style={{ 
                                        padding: '0.75rem', 
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        borderColor: 'rgba(239, 68, 68, 0.2)',
                                        color: 'var(--danger)',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {addError}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    onClick={handleAddItem}
                                    disabled={loading}
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Adding...' : 'Add Item'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setAddForm({ name: '', quantity: '', unit: '', count: '' });
                                        setAddError('');
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPantry;
