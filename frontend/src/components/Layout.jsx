import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { api } from '../api/client';
import useAppStore from '../store/useAppStore';

const Layout = () => {
    const setProfile = useAppStore((state) => state.setProfile);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.getProfile();
                if (data && data.name) {
                    setProfile(data);
                } else {
                    setProfile(null);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
                setProfile(null);
            }
        };
        fetchProfile();
    }, [setProfile]);

    return (
        <div className="flex bg-background min-h-screen text-textMain selection:bg-primary/30">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-12">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
