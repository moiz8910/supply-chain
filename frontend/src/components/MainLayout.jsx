import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import ExceptionDashboard from './ExceptionDashboard';
import {
    LayoutDashboard,
    AlertTriangle,
    Map,
    CheckSquare,
    TrendingUp,
    MessageSquare,
    Settings,
    LogOut,
    AlertOctagon,
    ChevronLeft
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active, isOpen }) => (
    <Link
        to={path}
        title={!isOpen ? label : ''}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            } ${!isOpen && 'justify-center px-0'}`}
    >
        <Icon className="w-5 h-5 shrink-0" />
        {isOpen && <span className="font-medium text-sm whitespace-nowrap">{label}</span>}
    </Link>
);

const MainLayout = () => {
    const location = useLocation();
    const [showException, setShowException] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Control Tower', path: '/' },
        { icon: AlertTriangle, label: 'Exceptions & Risks', path: '/exceptions' },
        { icon: Map, label: 'Network Map', path: '/map' },
        { icon: CheckSquare, label: 'Pending Tasks', path: '/tasks' },
        { icon: TrendingUp, label: 'Optimizer', path: '/optimizer' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">

            {/* Context-Aware Co-Pilot Badge (Floating) */}
            <div className="fixed bottom-6 right-6 z-50">
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg shadow-indigo-200/50 flex items-center gap-3 hover:scale-105 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                    <span className="font-bold pr-2">Ask Co-Pilot</span>
                </button>
            </div>

            {/* Application Sidebar */}
            <div className={`bg-white border-r border-gray-200 flex flex-col shrink-0 flex-none z-40 transition-all duration-300 relative ${isSidebarOpen ? 'w-64' : 'w-[84px]'}`}>

                <div className={`py-6 px-4 flex items-center border-b border-gray-100 transition-all ${isSidebarOpen ? 'gap-3' : 'justify-center px-0'}`}>

                    {/* Minimal Collapse Toggle (Next to Logo) */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-gray-400 hover:text-gray-900 transition-colors shrink-0"
                    >
                        <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
                        SC
                    </div>
                    {isSidebarOpen && (
                        <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
                            <h1 className="font-bold text-gray-900 leading-none truncate">Supply Chain</h1>
                            <span className="text-xs font-medium text-gray-400 block mt-1 truncate">Control Tower OS</span>
                        </div>
                    )}
                </div>

                <div className={`flex-1 overflow-y-auto p-4 space-y-2 ${!isSidebarOpen && 'px-3'}`}>
                    {isSidebarOpen && <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2 mt-2">Modules</div>}
                    {navItems.map(item => (
                        <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            active={location.pathname === item.path}
                            isOpen={isSidebarOpen}
                        />
                    ))}
                </div>

                <div className={`p-4 border-t border-gray-100 space-y-2 ${!isSidebarOpen && 'px-3'}`}>
                    <SidebarItem icon={Settings} label="Settings" path="/settings" isOpen={isSidebarOpen} />
                    <SidebarItem icon={LogOut} label="Sign Out" path="/logout" isOpen={isSidebarOpen} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">

                {showException && <ExceptionDashboard onClose={() => setShowException(false)} />}

                {/* Top Alert Banner - Global */}
                <div className="bg-red-500 text-white px-6 py-2.5 flex items-center justify-between text-sm shadow-sm shrink-0 z-50">
                    <div className="flex items-center gap-3">
                        <AlertOctagon className="w-5 h-5 text-red-100" />
                        <span className="font-semibold tracking-wide">AI AGENT ALERT: Critical ISO Tanker Shortage Detected (AN-2026-001)</span>
                    </div>
                    <button
                        onClick={() => setShowException(true)}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-1 rounded text-xs font-bold transition-colors border border-white/20"
                    >
                        Review Resolution
                    </button>
                </div>

                <Outlet />
            </div>

        </div>
    );
};

export default MainLayout;
