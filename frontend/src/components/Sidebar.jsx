import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, PlusSquare, Map } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const Sidebar = () => {
    const profile = useAppStore((state) => state.profile);

    return (
        <aside className="w-72 h-screen flex flex-col justify-between p-6 border-r border-white/5 bg-surface/50 backdrop-blur-md">
            <div>
                {/* Logo Area */}
                <div className="flex items-center space-x-3 mb-12">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.4)]">
                        <span className="text-black font-black text-xl">A</span>
                    </div>
                    <h1 className="text-2xl font-black tracking-widest text-white">APEX</h1>
                </div>

                {/* Navigation */}
                <nav className="space-y-4">
                    <NavLink to="/" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'text-white bg-white/10 shadow-[inset_4px_0_0_0_rgba(74,222,128,1)]' : 'text-textMuted hover:text-white hover:bg-white/5'}`}>
                        <Home className="w-5 h-5" />
                        <span className="font-semibold tracking-wide">Dashboard</span>
                    </NavLink>

                    <NavLink to="/chat" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'text-white bg-white/10 shadow-[inset_4px_0_0_0_rgba(74,222,128,1)]' : 'text-textMuted hover:text-white hover:bg-white/5'}`}>
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-semibold tracking-wide">Coach</span>
                    </NavLink>

                    <NavLink to="/log" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'text-white bg-white/10 shadow-[inset_4px_0_0_0_rgba(74,222,128,1)]' : 'text-textMuted hover:text-white hover:bg-white/5'}`}>
                        <PlusSquare className="w-5 h-5" />
                        <span className="font-semibold tracking-wide">Log</span>
                    </NavLink>

                    <NavLink to="/plans" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'text-white bg-white/10 shadow-[inset_4px_0_0_0_rgba(74,222,128,1)]' : 'text-textMuted hover:text-white hover:bg-white/5'}`}>
                        <Map className="w-5 h-5" />
                        <span className="font-semibold tracking-wide">Plans</span>
                    </NavLink>
                </nav>
            </div>

            {/* User Info bottom */}
            <div className="p-4 rounded-xl bg-background border border-white/5">
                {profile ? (
                    <div>
                        <p className="text-white font-bold">{profile.name}</p>
                        <p className="text-sm text-primary font-medium mt-1 uppercase tracking-wider text-xs">{profile.goal}</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-textMuted text-sm">No Profile Set</p>
                        <NavLink to="/chat" className="text-primary text-xs font-semibold mt-2 inline-block hover:underline">
                            Setup Now &rarr;
                        </NavLink>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
