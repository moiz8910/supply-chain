import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    AlertTriangle,
    Map,
    CheckSquare,
    TrendingUp,
    MessageSquare,
    Settings,
    LogOut
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${active
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm">{label}</span>
    </Link>
);

const MainLayout = () => {
    const location = useLocation();

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
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 flex-none z-40">
                <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                        LK
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-none">Laxmi Organics</h1>
                        <span className="text-xs font-medium text-gray-400">Supply Chain OS</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2 mt-2">Modules</div>
                    {navItems.map(item => (
                        <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            active={location.pathname === item.path}
                        />
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100 space-y-1">
                    <SidebarItem icon={Settings} label="Settings" path="/settings" />
                    <SidebarItem icon={LogOut} label="Sign Out" path="/logout" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <Outlet />
            </div>

        </div>
    );
};

export default MainLayout;
