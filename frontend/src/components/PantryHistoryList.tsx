import React, { useEffect, useState } from "react";
import { Scan, Edit3, Calendar, Package } from "lucide-react";
import { auth } from "../firebase";

const API_BASE_URL = "http://localhost:8000";

interface HistoryEntry {
    id: string;
    items: any[];
    source: 'manual' | 'receipt';
    timestamp: string;
    count: number;
}

interface PantryHistoryListProps {
    selectedDate: string | null;
}

export const PantryHistoryList: React.FC<PantryHistoryListProps> = ({ selectedDate }) => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, [selectedDate]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) return;

            let url = `${API_BASE_URL}/api/history/pantry`;

            // If date selected, fetch specifically for that date (or filter)
            if (selectedDate) {
                url = `${API_BASE_URL}/api/history/date/${selectedDate}`;
            }

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setHistory(data.history);
            }
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading history...</div>;
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 glass-panel">
                <Calendar className="mx-auto mb-2 opacity-50" size={24} />
                <p>No activity found {selectedDate ? 'on this date' : ''}</p>
            </div>
        );
    }

    return (
        <div className="history-list-container">
            {history.map(entry => {
                const date = new Date(entry.timestamp);
                const isReceipt = entry.source === 'receipt';

                return (
                    <div key={entry.id} className="history-item">
                        <div className={`history-icon-box ${isReceipt ? 'receipt' : 'manual'}`}>
                            {isReceipt ? <Scan size={20} /> : <Edit3 size={20} />}
                        </div>

                        <div className="history-content">
                            <div className="history-header">
                                <div className="history-title">
                                    {entry.count} item{entry.count !== 1 ? 's' : ''} added
                                </div>
                                <div className="history-time">
                                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <div className="history-meta">
                                via {isReceipt ? 'Receipt Scan' : 'Manual Entry'} • {date.toLocaleDateString()}
                            </div>

                            {/* Preview of items if available */}
                            {entry.items && entry.items.length > 0 && (
                                <div className="item-preview">
                                    {entry.items.slice(0, 3).map((item: any, i: number) => (
                                        <span key={i} className="preview-tag">
                                            <Package size={12} />
                                            {item.name}
                                        </span>
                                    ))}
                                    {entry.items.length > 3 && (
                                        <span className="text-xs text-gray-500 pl-1">+{entry.items.length - 3} more</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
