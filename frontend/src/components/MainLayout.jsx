import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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
    ChevronLeft,
    CalendarDays
} from 'lucide-react';
import { getFullUrl } from '../lib/api';

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
    const navigate = useNavigate();
    const [showException, setShowException] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Mock User Data
    const username = "Alex";
    const role = "Supply Chain Regional Manager";

    // AI Chat State
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]); // Array of { role: 'user'|'ai', text: str }
    const [isChatLoading, setIsChatLoading] = useState(false);

    const handleChatSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = chatInput.trim();
        setChatInput('');

        const updatedHistory = [...chatHistory, { role: 'user', text: userMessage }];
        setChatHistory(updatedHistory);
        setIsChatLoading(true);

        try {
            const res = await fetch(getFullUrl('/api/ai/chat'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: chatHistory.map(msg => ({
                        role: msg.role === 'user' ? 'human' : 'assistant',
                        content: msg.text
                    }))
                })
            });
            const data = await res.json();
            if (res.ok) {
                setChatHistory(prev => [...prev, { role: 'ai', text: data.response }]);
            } else {
                setChatHistory(prev => [...prev, { role: 'ai', text: `Error: ${data.detail || 'Something went wrong'}` }]);
            }
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', text: `Connection Error: ${error.message}` }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Control Tower', path: '/' },
        { icon: AlertTriangle, label: 'Exceptions & Risks', path: '/exceptions' },
        { icon: Map, label: 'Network Map', path: '/map' },
        { icon: CheckSquare, label: 'Pending Tasks', path: '/tasks' },
        { icon: TrendingUp, label: 'Optimizer', path: '/optimizer' },
        { icon: CalendarDays, label: 'Ops Calendar', path: '/calendar' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Application Sidebar */}
            <div className={`bg-white border-r border-gray-200 flex flex-col shrink-0 z-40 transition-all duration-300 relative ${isSidebarOpen ? 'w-64' : 'w-[84px]'}`}>
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

                {/* User Welcome */}
                <div className={`p-4 border-b border-gray-100 flex items-center gap-3 transition-all ${!isSidebarOpen && 'justify-center px-2'}`}>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {username.charAt(0)}
                    </div>
                    {isSidebarOpen && (
                        <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
                            <p className="text-sm font-bold text-gray-900 leading-tight truncate">Welcome, {username}</p>
                            <p className="text-xs font-medium text-gray-500 truncate">{role}</p>
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
                    <button
                        onClick={() => {
                            localStorage.removeItem('isAuthenticated');
                            navigate('/login');
                        }}
                        title={!isSidebarOpen ? "Sign Out" : ""}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-500 hover:bg-red-50 hover:text-red-700 ${!isSidebarOpen && 'justify-center px-0'}`}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {isSidebarOpen && <span className="font-medium text-sm whitespace-nowrap">Sign Out</span>}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50 relative h-screen">
                {/* Scrollable Content Wrapper */}
                <div className="flex-1 overflow-y-auto relative flex flex-col">
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
                            Review Exception
                        </button>
                    </div>

                    <Outlet />
                </div>

                {/* Persistent Co-Pilot Chat Bar */}
                <div className="w-full bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-40 shrink-0 flex flex-col items-center">
                    {/* Chat History Area */}
                    {chatHistory.length > 0 && (
                        <div className="w-full max-w-5xl mb-4 max-h-[40vh] overflow-y-auto space-y-3 rounded-xl bg-white border border-gray-100 shadow-sm p-4 animate-in slide-in-from-bottom-2 fade-in">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-50">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chat History</span>
                                <button onClick={() => setChatHistory([])} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Clear</button>
                            </div>

                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-indigo-600 text-white'}`}>
                                        {msg.role === 'user' ? <span className="text-xs font-bold">You</span> : <MessageSquare className="w-4 h-4" />}
                                    </div>
                                    <div className={`flex-1 text-sm font-medium leading-relaxed whitespace-pre-wrap rounded-lg p-3 ${msg.role === 'user' ? 'bg-gray-100 text-gray-800' : 'bg-indigo-50/70 border border-indigo-100 text-gray-800'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {isChatLoading && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                                        <MessageSquare className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex items-center gap-2 text-indigo-600/70 text-sm font-medium p-3">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Analyzing database...
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleChatSubmit} className="max-w-5xl w-full relative flex items-center">
                        <MessageSquare className="absolute left-4 w-5 h-5 text-indigo-500" />
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            disabled={isChatLoading}
                            placeholder="Ask Supply Chain Co-Pilot (e.g. 'How many orders are in the backlog?' or 'What is our total inbound shipping cost?')..."
                            className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium text-gray-800 placeholder-gray-400 shadow-sm disabled:bg-gray-50"
                        />
                        <button
                            type="submit"
                            disabled={isChatLoading || !chatInput.trim()}
                            className="absolute right-2 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
