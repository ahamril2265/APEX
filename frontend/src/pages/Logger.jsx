import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Plus, Save, Activity, Utensils, Calendar } from 'lucide-react';

const Logger = () => {
    const [activeTab, setActiveTab] = useState('workout'); // 'workout' | 'meal'

    // Workout State
    const [wDate, setWDate] = useState(new Date().toISOString().split('T')[0]);
    const [wName, setWName] = useState('');
    const [wDuration, setWDuration] = useState('');
    const [wNotes, setWNotes] = useState('');
    const [wSets, setWSets] = useState([{ exercise: '', sets: '', reps: '', weight_kg: '', notes: '' }]);

    // Meal State
    const [mDate, setMDate] = useState(new Date().toISOString().split('T')[0]);
    const [mType, setMType] = useState('breakfast');
    const [mName, setMName] = useState('');
    const [mCal, setMCal] = useState('');
    const [mPro, setMPro] = useState('');
    const [mCarbs, setMCarbs] = useState('');
    const [mFat, setMFat] = useState('');
    const [mNotes, setMNotes] = useState('');

    // History State
    const [recentWorkouts, setRecentWorkouts] = useState([]);
    const [recentMeals, setRecentMeals] = useState([]);

    useEffect(() => {
        loadHistory();
    }, [activeTab]);

    const loadHistory = async () => {
        try {
            if (activeTab === 'workout') {
                const { data } = await api.getWorkouts(5);
                setRecentWorkouts(data);
            } else {
                const { data } = await api.getMeals(1); // last 1 day for 'today'
                setRecentMeals(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const addSetRow = () => {
        setWSets([...wSets, { exercise: '', sets: '', reps: '', weight_kg: '', notes: '' }]);
    };

    const handleSetChange = (index, field, value) => {
        const newSets = [...wSets];
        newSets[index][field] = value;
        setWSets(newSets);
    };

    const removeSetRow = (index) => {
        if (wSets.length > 1) {
            const newSets = wSets.filter((_, i) => i !== index);
            setWSets(newSets);
        }
    };

    const submitWorkout = async (e) => {
        e.preventDefault();
        if (!wName || wSets.some(s => !s.exercise || !s.sets || !s.weight_kg)) return alert("Please fill in required fields.");

        const fmtSets = wSets.map(s => ({
            exercise: s.exercise,
            sets: parseInt(s.sets),
            reps: s.reps ? parseInt(s.reps) : null,
            weight_kg: parseFloat(s.weight_kg),
            notes: s.notes || null,
        }));

        const payload = {
            date: wDate,
            name: wName,
            duration_minutes: wDuration ? parseInt(wDuration) : null,
            notes: wNotes || null,
            sets: fmtSets,
        };

        try {
            await api.createWorkout(payload);
            setWName('');
            setWDuration('');
            setWNotes('');
            setWSets([{ exercise: '', sets: '', reps: '', weight_kg: '', notes: '' }]);
            loadHistory();
        } catch (e) {
            console.error(e);
            alert("Failed to save workout");
        }
    };

    const submitMeal = async (e) => {
        e.preventDefault();
        if (!mName || !mCal || !mPro || !mCarbs || !mFat) return alert("Please fill all macro fields.");

        const payload = {
            date: mDate,
            meal_type: mType,
            name: mName,
            calories: parseInt(mCal),
            protein_g: parseFloat(mPro),
            carbs_g: parseFloat(mCarbs),
            fat_g: parseFloat(mFat),
            notes: mNotes || null,
        };

        try {
            await api.createMeal(payload);
            setMName('');
            setMCal('');
            setMPro('');
            setMCarbs('');
            setMFat('');
            setMNotes('');
            loadHistory();
        } catch (e) {
            console.error(e);
            alert("Failed to save meal");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-black text-white mb-2">Logger</h1>
                <p className="text-textMuted">Track your workouts and nutrition to give APEX the data it needs.</p>
            </header>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-surface p-1 rounded-xl flex space-x-1 border border-white/5">
                    <button
                        onClick={() => setActiveTab('workout')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'workout' ? 'bg-primary text-black shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                    >
                        <Activity className="w-4 h-4" />
                        <span>Workout</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('meal')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'meal' ? 'bg-primary text-black shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                    >
                        <Utensils className="w-4 h-4" />
                        <span>Nutrition</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Form Panel */}
                <div className="lg:col-span-2">
                    {activeTab === 'workout' ? (
                        <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-green-900" />
                            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                                <Calendar className="w-6 h-6 mr-3 text-primary" /> Log Workout
                            </h2>

                            <form onSubmit={submitWorkout} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Date</label>
                                        <input type="date" className="input-field" value={wDate} onChange={e => setWDate(e.target.value)} required />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Workout Name</label>
                                        <input type="text" className="input-field" placeholder="e.g. Push Day A" value={wName} onChange={e => setWName(e.target.value)} required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Duration (min)</label>
                                        <input type="number" className="input-field" placeholder="Optional" value={wDuration} onChange={e => setWDuration(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Notes</label>
                                        <input type="text" className="input-field" placeholder="Optional" value={wNotes} onChange={e => setWNotes(e.target.value)} />
                                    </div>
                                </div>

                                {/* Exercises */}
                                <div className="mt-8 border-t border-white/5 pt-6">
                                    <h3 className="text-lg font-bold mb-4">Exercises</h3>

                                    <div className="space-y-4">
                                        {wSets.map((set, i) => (
                                            <div key={i} className="flex flex-wrap sm:flex-nowrap gap-3 items-start bg-background p-4 rounded-xl border border-white/5 relative group">
                                                <button type="button" onClick={() => removeSetRow(i)} className="absolute -top-2 -right-2 bg-danger text-black rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>

                                                <div className="w-full sm:w-1/3">
                                                    <input type="text" className="input-field py-2 text-sm" placeholder="Exercise" value={set.exercise} onChange={e => handleSetChange(i, 'exercise', e.target.value)} required />
                                                </div>
                                                <div className="w-1/4 sm:w-20">
                                                    <input type="number" className="input-field py-2 text-sm text-center" placeholder="Sets" value={set.sets} onChange={e => handleSetChange(i, 'sets', e.target.value)} required />
                                                </div>
                                                <div className="w-1/4 sm:w-20">
                                                    <input type="number" className="input-field py-2 text-sm text-center" placeholder="Reps" value={set.reps} onChange={e => handleSetChange(i, 'reps', e.target.value)} />
                                                </div>
                                                <div className="w-1/4 sm:w-24">
                                                    <input type="number" className="input-field py-2 text-sm text-center" placeholder="Wt(kg)" value={set.weight_kg} onChange={e => handleSetChange(i, 'weight_kg', e.target.value)} required />
                                                </div>
                                                <div className="w-full sm:flex-1">
                                                    <input type="text" className="input-field py-2 text-sm" placeholder="Notes (opt)" value={set.notes} onChange={e => handleSetChange(i, 'notes', e.target.value)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button type="button" onClick={addSetRow} className="mt-4 text-sm font-semibold text-primary flex items-center hover:text-green-300">
                                        <Plus className="w-4 h-4 mr-1" /> Add Exercise
                                    </button>
                                </div>

                                <div className="pt-6">
                                    <button type="submit" className="btn-primary w-full flex justify-center items-center py-4">
                                        <Save className="w-5 h-5 mr-2" /> Save Workout
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-900" />
                            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                                <Utensils className="w-6 h-6 mr-3 text-blue-500" /> Log Meal
                            </h2>

                            <form onSubmit={submitMeal} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Date</label>
                                        <input type="date" className="input-field" value={mDate} onChange={e => setMDate(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Type</label>
                                        <select className="input-field appearance-none" value={mType} onChange={e => setMType(e.target.value)}>
                                            <option value="breakfast">Breakfast</option>
                                            <option value="lunch">Lunch</option>
                                            <option value="dinner">Dinner</option>
                                            <option value="snack">Snack</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Meal Name</label>
                                    <input type="text" className="input-field" placeholder="e.g. Chicken Rice Bowl" value={mName} onChange={e => setMName(e.target.value)} required />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Calories</label>
                                        <input type="number" className="input-field text-center" placeholder="kcal" value={mCal} onChange={e => setMCal(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Protein (g)</label>
                                        <input type="number" step="0.1" className="input-field text-center" placeholder="g" value={mPro} onChange={e => setMPro(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Carbs (g)</label>
                                        <input type="number" step="0.1" className="input-field text-center" placeholder="g" value={mCarbs} onChange={e => setMCarbs(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Fat (g)</label>
                                        <input type="number" step="0.1" className="input-field text-center" placeholder="g" value={mFat} onChange={e => setMFat(e.target.value)} required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Notes</label>
                                    <input type="text" className="input-field" placeholder="Optional" value={mNotes} onChange={e => setMNotes(e.target.value)} />
                                </div>

                                <div className="pt-4">
                                    <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-4 px-4 rounded-lg hover:bg-blue-400 transition-all duration-300 transform active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex justify-center items-center">
                                        <Save className="w-5 h-5 mr-2" /> Save Meal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* History Panel */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-6 h-full">
                        <h3 className="text-xl font-bold mb-6 text-white border-b border-white/5 pb-4">Recent Entries</h3>

                        <div className="space-y-4">
                            {activeTab === 'workout' ? (
                                recentWorkouts.length > 0 ? (
                                    recentWorkouts.map(w => (
                                        <div key={w.id} className="bg-background p-4 rounded-xl border border-white/5">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-white text-sm truncate pr-2">{w.name}</span>
                                                <span className="text-xs text-textMuted">{w.date.split('-').slice(1).join('/')}</span>
                                            </div>
                                            <p className="text-xs text-textMuted">{w.sets?.length || 0} exercises</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-textMuted text-sm text-center py-6">No recent workouts.</p>
                                )
                            ) : (
                                recentMeals.length > 0 ? (
                                    recentMeals.map(m => (
                                        <div key={m.id} className="bg-background p-4 rounded-xl border border-white/5">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-white text-sm truncate pr-2">{m.name}</span>
                                                <span className="text-xs text-blue-400 uppercase tracking-wider font-semibold">{m.meal_type}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-textMuted mt-2">
                                                <span className="text-orange-400 font-medium">{m.calories} cal</span>
                                                <span>P: {m.protein_g}</span>
                                                <span>C: {m.carbs_g}</span>
                                                <span>F: {m.fat_g}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-textMuted text-sm text-center py-6">No meals logged today.</p>
                                )
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Logger;
