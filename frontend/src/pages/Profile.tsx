import React, { useEffect, useState } from "react";
import { User, Settings, Award } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ActivityCalendar } from "../components/ActivityCalendar";
import { PantryHistoryList } from "../components/PantryHistoryList";
import "./Profile.css";

const API_BASE_URL = "http://localhost:8000";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [proteinTarget, setProteinTarget] = useState<number>(140);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // 🔥 Load profile from backend
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken();

        const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setProteinTarget(data?.proteinTarget ?? 140);
        setTags(data?.tags ?? []);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proteinTarget,
          tags,
        }),
      });
      // Optional: show success toast
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header-card">
          <div className="avatar-circle">
            {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl">{user?.displayName || "User"}</h1>
            <p className="text-muted">{user?.email}</p>
          </div>
        </div>

        {/* Dietary Goals */}
        <section className="mb-8">
          <h2 className="text-xl mb-4">Dietary Goals</h2>
          <div className="glass-panel">
            <div className="flex justify-between mb-2">
              <label className="text-muted">Daily Protein Target</label>
              <div className="flex items-center gap-2">
                <span className="text-xl text-gradient">{proteinTarget}g</span>
                <span className="text-sm text-muted">/ 250g</span>
              </div>
            </div>

            {/* Progress Bar styled Range Input */}
            <input
              type="range"
              min="50"
              max="250"
              step="5"
              value={proteinTarget}
              onChange={(e) => setProteinTarget(parseInt(e.target.value))}
              style={{
                '--value': `${((proteinTarget - 50) / (250 - 50)) * 100}%`
              } as React.CSSProperties}
              className="progress-range"
            />

            <div className="my-6">
              <label className="block text-muted mb-3 text-center">Dietary Preferences</label>
              <div className="flex flex-wrap gap-4 justify-center">
                {["Vegetarian", "Vegan", "Keto", "Paleo", "Gluten-Free", "High Protein"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`pref-tag ${tags.includes(tag) ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn btn-primary btn-lg"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        </section>

        {/* Pantry Activity History */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">Pantry Activity</h2>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm text-accent hover:underline"
                style={{ color: 'var(--accent-primary)' }}
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="grid-cols-2">
            <div>
              <ActivityCalendar
                selectedDate={selectedDate}
                onDateClick={(date) => setSelectedDate(date === selectedDate ? null : date)}
              />
            </div>
            <div>
              <div className="glass-panel" style={{ padding: '1.5rem', height: '100%' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="calendar-month-title">
                    {selectedDate
                      ? `Activity for ${new Date(selectedDate).toLocaleDateString()}`
                      : 'Recent Activity'}
                  </h3>
                </div>
                <PantryHistoryList selectedDate={selectedDate} />
              </div>
            </div>
          </div>
        </section>

        {/* Settings Links */}
        <section className="mb-8">
          <h2 className="text-xl mb-4">Settings</h2>
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            {[
              { icon: User, label: "Account Details", path: "/account" },
              { icon: Award, label: "Subscription", path: "/subscriptions" },
              { icon: Settings, label: "App Preferences", path: "/preferences" },
            ].map((item, i) => (
              <div
                key={i}
                onClick={() => item.path && navigate(item.path)}
                className="settings-link"
                style={{ borderBottom: i < 2 ? '1px solid var(--glass-border)' : 'none' }}
              >
                <div className="settings-icon-wrapper">
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
                <span className="text-muted">›</span>
              </div>
            ))}
          </div>
        </section>



        {/* Danger Zone */}


        <button
          onClick={handleLogout}
          className="btn btn-secondary w-full"
          style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
        >
          Log Out
        </button>
      </div>
    </div>

  );
};

export default Profile;