import React, { useEffect, useState } from "react";
import { User, Settings, Award, Activity } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ProteinCalendar } from "../components/ProteinCalendar";
import { PantryCalendar } from "../components/PantryCalendar";
import "./Profile.css";

const API_BASE_URL = "http://localhost:8000";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [proteinTarget, setProteinTarget] = useState<number>(140);
  const [calorieTarget, setCalorieTarget] = useState<number>(2000);
  const [tags, setTags] = useState<string[]>([]);
  const [userData, setUserData] = useState({ gender: '', weight: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!userData.weight || !userData.gender || !userData.height) return;
    setAnalyzing(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/user/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

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
        setCalorieTarget(data?.calorieTarget ?? 2000);
        setTags(data?.tags ?? []);
        setUserData({
          gender: data?.gender || '',
          weight: data?.weight || 0,
          height: data?.height || 0
        });
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
          calorieTarget,
          tags,
          ...userData
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

        {/* Main Grid for Info & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Box 1: My Info (Biometrics & AI Analysis) */}
          <section className="glass-panel flex flex-col h-full">
            <h2 className="text-xl mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <User size={20} className="text-accent" style={{ color: 'var(--accent-secondary)' }} />
              My Info
            </h2>

            <div className="space-y-6 flex-grow">

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider font-semibold">Gender</label>
                  <div className="relative">
                    <select
                      className="input-field appearance-none cursor-pointer"
                      style={{ paddingRight: '2.5rem' }}
                      value={userData.gender}
                      onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                      ▼
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider font-semibold">Weight (kg)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="kg"
                    value={userData.weight || ''}
                    onChange={(e) => setUserData({ ...userData, weight: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider font-semibold">Height (cm)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="cm"
                    value={userData.height || ''}
                    onChange={(e) => setUserData({ ...userData, height: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              {/* Analysis Result or Button */}
              {analysis ? (
                <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 animate-fade-in-up shadow-lg">
                  <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                      <Activity size={20} className="text-accent-primary" />
                      Health Report
                    </h3>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${analysis.status === 'Normal' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      analysis.status.includes('Over') || analysis.status.includes('Obese') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                      {analysis.status}
                    </span>
                  </div>

                  <div className="space-y-6 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                        <span className="text-xs text-muted uppercase tracking-wider block mb-1">Target Weight</span>
                        <span className="font-mono font-bold text-lg block">{analysis.idealWeightRange}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                          <span className="text-xs text-muted uppercase tracking-wider block mb-1">Protein Goal</span>
                          <span className="font-mono font-bold text-lg text-accent-primary block" style={{ color: 'var(--accent-primary)' }}>{analysis.proteinTarget}g</span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                          <span className="text-xs text-muted uppercase tracking-wider block mb-1">Calories Goal</span>
                          <span className="font-mono font-bold text-lg text-orange-400 block">{analysis.calorieTarget}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-sm leading-relaxed text-blue-100 flex gap-3 items-start">
                      <span className="text-lg">💡</span>
                      <span className="italic">"{analysis.tip}"</span>
                    </div>

                    <button
                      onClick={() => {
                        setProteinTarget(analysis.proteinTarget);
                        if (analysis.calorieTarget) setCalorieTarget(analysis.calorieTarget);
                      }}
                      className="btn btn-primary w-full gap-2 py-3 text-base shadow-lg shadow-blue-900/20"
                    >
                      Use Suggestion <span className="opacity-80 font-normal">({analysis.proteinTarget}g / {analysis.calorieTarget} cal)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="btn btn-secondary w-full justify-center"
                    style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' }}
                  >
                    {analyzing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        ✨ Analyze My Stats
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Footer for Save Button */}
            <div className="pt-6 mt-8 border-t border-white/5">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn btn-primary w-full justify-center btn-lg"
              >
                {saving ? "Saving..." : "Save My Info"}
              </button>
            </div>
          </section>

          {/* Box 2: Dietary Goals */}
          <section className="glass-panel flex flex-col h-full">
            <h2 className="text-xl mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <Award size={20} className="text-primary" />
              Dietary Goals
            </h2>

            <div className="space-y-8 flex-grow">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm text-muted font-medium">Daily Protein Target</label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gradient">{proteinTarget}g</span>
                    <span className="text-sm text-muted">/ 250g</span>
                  </div>
                </div>

                <div className="px-1">
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
                    className="progress-range w-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm text-muted font-medium">Daily Calorie Target</label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gradient text-orange-400">{calorieTarget}</span>
                    <span className="text-sm text-muted">/ 4000</span>
                  </div>
                </div>

                <div className="px-1">
                  <input
                    type="range"
                    min="1200"
                    max="4000"
                    step="50"
                    value={calorieTarget}
                    onChange={(e) => setCalorieTarget(parseInt(e.target.value))}
                    style={{
                      '--value': `${((calorieTarget - 1200) / (4000 - 1200)) * 100}%`
                    } as React.CSSProperties}
                    className="progress-range w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted font-medium mb-4">Dietary Preferences</label>
                <div className="flex flex-wrap gap-2">
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
            </div>

            <div className="pt-6 mt-8 border-t border-white/5">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn btn-primary w-full justify-center btn-lg"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </section>

        </div>

        {/* Activity & History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProteinCalendar target={proteinTarget} />
          <PantryCalendar />
        </div>

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