import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend }) => {
    return (
        <div className="glass-panel p-6 hover:border-primary/30 transition-colors duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-surface border border-white/5 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                {trend && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/5 text-textMuted">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-textMuted text-sm font-medium mb-1">{title}</h3>
                <p className="text-3xl font-black text-white tracking-tight">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
