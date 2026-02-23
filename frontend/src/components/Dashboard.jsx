import React, { useEffect, useState } from 'react';
import KPITile from './KPITile';
import MainChart from './MainChart';
import Contributors from './Contributors';
import ExceptionDashboard from './ExceptionDashboard';
import { Search, Bell, HelpCircle, User, AlertOctagon } from 'lucide-react';

const Dashboard = () => {
    const [kpis, setKpis] = useState([]);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showException, setShowException] = useState(false);

    useEffect(() => {
        // Parallel fetch
        Promise.all([
            fetch('http://localhost:8000/api/kpis').then(res => res.json()),
            fetch('http://localhost:8000/api/dashboard/details').then(res => res.json())
        ])
            .then(([kpiData, detailData]) => {
                setKpis(kpiData);
                setDetails(detailData);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-400">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans relative">

            {showException && <ExceptionDashboard onClose={() => setShowException(false)} />}

            {/* Top Alert Banner */}
            <div className="bg-red-500 text-white px-6 py-2.5 flex items-center justify-between text-sm shadow-sm">
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

            {/* Top Bar matching screenshot */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">SC</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md">
                        <span className="font-medium">Time Period:</span> Last 30 Days
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md">
                        Product Family: All
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <Search size={20} className="hover:text-gray-600 cursor-pointer" />
                    <Bell size={20} className="hover:text-gray-600 cursor-pointer" />
                    <HelpCircle size={20} className="hover:text-gray-600 cursor-pointer" />
                    <User size={24} className="text-gray-600 bg-gray-200 rounded-full p-1" />
                </div>
            </div>

            <div className="p-6 max-w-[1600px] mx-auto space-y-6">

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.slice(0, 4).map(kpi => (
                        <KPITile key={kpi.id} {...kpi} />
                    ))}
                </div>

                {/* Middle Section: Capacity + Chart + Contributors */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[400px]">
                    {/* Left Col: Extra KPIs */}
                    <div className="lg:col-span-3 space-y-4 flex flex-col h-full">
                        {kpis.slice(4).map(kpi => (
                            <div key={kpi.id} className="flex-1">
                                <KPITile {...kpi} />
                            </div>
                        ))}
                        {/* Backlog simulated if needed or repeat */}
                    </div>

                    {/* Center: Main Chart */}
                    <div className="lg:col-span-6 h-full">
                        <MainChart data={details?.main_chart} title="Forecast Accuracy Trend" />
                    </div>

                    {/* Right: Contributors */}
                    <div className="lg:col-span-3 h-full">
                        <Contributors data={details?.contributors} />
                    </div>
                </div>

                {/* Bottom Section: Table / Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Simple Breakdown Chart Placeholder */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 font-medium mb-4 text-sm uppercase">Breakdown by Region</h3>
                        <div className="flex items-end justify-around h-32 gap-2">
                            {details?.breakdown.map((item) => (
                                <div key={item.name} className="flex flex-col items-center gap-2 w-full">
                                    <div
                                        style={{ height: `${item.value}%`, backgroundColor: item.fill }}
                                        className="w-8 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                                    ></div>
                                    <span className="text-xs text-gray-500 font-medium">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-gray-700 font-semibold">Orders Impacting Forecast Accuracy</h3>
                            <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-3">Order ID</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {details?.recent_orders.map((order, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-3 font-medium text-gray-900">{order.order_id}</td>
                                            <td className="px-6 py-3 text-gray-500">{order.customer}</td>
                                            <td className="px-6 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-500">{order.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
