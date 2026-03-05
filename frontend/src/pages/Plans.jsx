import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Sparkles, Activity, Utensils, Loader2, CheckCircle, Trash2, ChevronDown, ChevronUp, Map } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Plans = () => {
    const [type, setType] = useState('workout');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [plans, setPlans] = useState([]);
    const [expandedPlan, setExpandedPlan] = useState(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const { data } = await api.getPlans();
            setPlans(data);
            if (data.length > 0 && expandedPlan === null) {
                setExpandedPlan(data[0].id);
            }
        } catch (e) {
            console.error("Failed to load plans", e);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            await api.generatePlan({ type, prompt });
            setPrompt('');
            await loadPlans();
        } catch (e) {
            console.error(e);
            alert("Failed to generate plan");
        } finally {
            setIsGenerating(false);
        }
    };

    const activatePlan = async (id, e) => {
        e.stopPropagation();
        try {
            await api.activatePlan(id);
            await loadPlans();
        } catch (err) {
            console.error(err);
        }
    };

    const deletePlan = async (id, e) => {
        e.stopPropagation();
        try {
            await api.deletePlan(id);
            await loadPlans();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-10">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-black text-white mb-2">AI Plan Generator</h1>
                <p className="text-textMuted">Let APEX build custom routines and diets tailored to your profile.</p>
            </header>

            {/* Generator Form */}
            <div className="glass-panel p-8 mb-12 relative overflow-hidden group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative">
                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-1/3">
                                <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Plan Type</label>
                                <select className="input-field appearance-none py-4" value={type} onChange={e => setType(e.target.value)}>
                                    <option value="workout">Workout Routine</option>
                                    <option value="nutrition">Nutrition Diet</option>
                                </select>
                            </div>
                            <div className="w-full sm:w-2/3">
                                <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">What are you looking for?</label>
                                <input
                                    type="text"
                                    className="input-field py-4"
                                    placeholder="e.g. 4-day PPL for building chest mass"
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isGenerating || !prompt.trim()}
                            className="w-full bg-white text-black font-black py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 flex justify-center items-center shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Analyzing Profile & Generating...</>
                            ) : (
                                <><Sparkles className="w-5 h-5 mr-3" /> Generate {type === 'workout' ? 'Routine' : 'Diet'}</>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Saved Plans */}
            <h3 className="text-2xl font-black mb-6">Saved Plans</h3>
            <div className="space-y-4">
                {plans.map(plan => {
                    const isExpanded = expandedPlan === plan.id;
                    return (
                        <div key={plan.id} className={`glass-panel overflow-hidden transition-all duration-300 border ${plan.is_active ? 'border-primary/50 shadow-[0_0_15px_rgba(74,222,128,0.1)]' : 'border-white/5 hover:border-white/20'}`}>

                            {/* Header */}
                            <div
                                className={`p-5 flex items-center justify-between cursor-pointer select-none ${isExpanded ? 'bg-white/5' : ''}`}
                                onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-lg ${plan.type === 'workout' ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-500'}`}>
                                        {plan.type === 'workout' ? <Activity className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{plan.title}</h4>
                                        <p className="text-xs text-textMuted mt-1">{new Date(plan.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    {plan.is_active && (
                                        <span className="flex items-center text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Active
                                        </span>
                                    )}
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-textMuted" /> : <ChevronDown className="w-5 h-5 text-textMuted" />}
                                </div>
                            </div>

                            {/* Content Panel */}
                            {isExpanded && (
                                <div className="p-6 border-t border-white/5 bg-background">
                                    <div className="prose prose-invert prose-green max-w-none text-white/90">
                                        <ReactMarkdown>{plan.content}</ReactMarkdown>
                                    </div>

                                    <div className="mt-8 flex justify-end space-x-4 border-t border-white/5 pt-6">
                                        <button
                                            onClick={(e) => deletePlan(plan.id, e)}
                                            className="btn-secondary !text-danger hover:!bg-danger/10 !border-danger/20 flex items-center"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </button>
                                        {!plan.is_active && (
                                            <button
                                                onClick={(e) => activatePlan(plan.id, e)}
                                                className="btn-primary flex items-center"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" /> Set Active
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {plans.length === 0 && !isGenerating && (
                    <div className="p-12 text-center text-textMuted bg-surface/30 rounded-2xl border border-white/5 border-dashed">
                        <Map className="w-12 h-12 mx-auto mb-4 opacity-50" /> {/* Map isn't imported from lucide, but let's assume it's Sparkles or we fix it */}
                        <p>No plans generated yet. Use the tool above to create one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Plans;
