import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Flame, Dumbbell, Trophy } from 'lucide-react';
import StatCard from '../components/StatCard';
import useAppStore from '../store/useAppStore';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const profile = useAppStore(state => state.profile);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const { data } = await api.getDashboardStats();
                setStats(data);
            } catch (e) {
                console.error("Error loading dashboard stats", e);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (!profile && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                    <Activity className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-4xl font-black mb-4">Welcome to APEX</h2>
                <p className="text-textMuted text-lg mb-8 max-w-md text-center">Your personalized AI fitness and nutrition coach. Set up your profile to start unlocking your potential.</p>
                <Link to="/chat" className="btn-primary text-lg px-8 py-3">
                    Configure Profile
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-white mb-2">Dashboard</h1>
                <p className="text-textMuted">Welcome back, {profile?.name || 'Athlete'}. Let's crush today's goals.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Workouts" value={stats?.total_workouts || 0} icon={Dumbbell} />
                <StatCard title="Workouts This Week" value={stats?.workouts_this_week || 0} icon={Activity} />
                <StatCard title="Current Streak" value={`${stats?.current_streak_days || 0} Days`} icon={Trophy} trend={stats?.current_streak_days > 2 ? 'On Fire!' : null} />
                <StatCard title="Avg Calories (7d)" value={`${stats?.avg_daily_calories_7d || 0} kcal`} icon={Flame} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center"><Flame className="w-5 h-5 text-orange-500 mr-2" /> Calories Overview (7d)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.calories_last_7_days || []}>
                                <defs>
                                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#121216', borderColor: '#ffffff10', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorCalories)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center"><Activity className="w-5 h-5 text-blue-500 mr-2" /> Protein Overview (7d)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.protein_last_7_days || []}>
                                <defs>
                                    <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#121216', borderColor: '#ffffff10', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="protein" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProtein)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <h3 className="text-2xl font-black mb-6">Recent Workouts</h3>
            <div className="glass-panel overflow-hidden">
                {stats?.recent_workouts?.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {stats.recent_workouts.map((workout) => (
                            <div key={workout.id} className="p-4 hover:bg-white/5 transition-colors flex justify-between items-center group">
                                <div>
                                    <p className="font-bold text-white group-hover:text-primary transition-colors">{workout.name}</p>
                                    <p className="text-textMuted text-sm text-xs mt-1">{workout.date}</p>
                                </div>
                                {workout.duration_minutes && (
                                    <div className="px-3 py-1 rounded-full bg-white/5 text-sm font-medium">
                                        {workout.duration_minutes} min
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-textMuted">
                        No workouts logged yet. Head to the Log page to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
