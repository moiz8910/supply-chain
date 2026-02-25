import React, { useEffect, useState } from 'react';
import KPITile from './KPITile';
import MainChart from './MainChart';
import Contributors from './Contributors';
import { Search, Bell, HelpCircle, User } from 'lucide-react';

const Dashboard = () => {
    const [kpis, setKpis] = useState([]);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedKpiId, setSelectedKpiId] = useState(null);
    const [timePeriod, setTimePeriod] = useState('Last 30 Days');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        // Parallel fetch
        Promise.all([
            fetch('/api/kpis').then(res => res.json()),
            fetch('/api/dashboard/details').then(res => res.json())
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

            {/* Top Bar Filters */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-600">Time:</span>
                        <select
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            className="bg-gray-100 border-0 outline-none px-3 py-1.5 rounded-md text-gray-700 font-semibold cursor-pointer hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        >
                            <option>Last 30 Days</option>
                            <option>Last Quarter</option>
                            <option>Year to Date</option>
                            <option>Last 12 Months</option>
                            <option>Custom Range</option>
                        </select>
                        {timePeriod === 'Custom Range' && (
                            <div className="flex items-center gap-2 ml-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="bg-white border border-gray-200 outline-none px-2 py-1.5 rounded-md text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                                <span className="text-gray-400 text-sm">to</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="bg-white border border-gray-200 outline-none px-2 py-1.5 rounded-md text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-600">Region:</span>
                        <select className="bg-gray-100 border-0 outline-none px-3 py-1.5 rounded-md text-gray-700 font-semibold cursor-pointer hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all text-sm">
                            <option>Global</option>
                            <option>North America</option>
                            <option>EMEA</option>
                            <option>APAC</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-600">Product Family:</span>
                        <select className="bg-gray-100 border-0 outline-none px-3 py-1.5 rounded-md text-gray-700 font-semibold cursor-pointer hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all text-sm">
                            <option>All Families</option>
                            <option>Electronics</option>
                            <option>Apparel</option>
                            <option>Home Goods</option>
                        </select>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {kpis.map(kpi => (
                        <KPITile
                            key={kpi.id}
                            {...kpi}
                            isSelected={selectedKpiId === kpi.id}
                            onClick={() => setSelectedKpiId(selectedKpiId === kpi.id ? null : kpi.id)}
                        />
                    ))}
                </div>

                {/* Focused KPI Detail Section */}
                {selectedKpiId && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* KPI Local Filters */}
                        <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg border border-gray-200/60 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-700">Detailed Analysis:</span>
                                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                                    {kpis.find(k => k.id === selectedKpiId)?.title || 'KPI'}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <select className="bg-gray-50 border border-gray-200 outline-none px-3 py-1.5 rounded-md text-gray-600 font-medium text-xs focus:ring-2 focus:ring-indigo-500">
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                </select>
                                <select className="bg-gray-50 border border-gray-200 outline-none px-3 py-1.5 rounded-md text-gray-600 font-medium text-xs focus:ring-2 focus:ring-indigo-500">
                                    <option>All Divisions</option>
                                    <option>Chemicals</option>
                                    <option>Specialty</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[450px]">
                            {/* Center: Main Chart */}
                            <div className="lg:col-span-2 h-full">
                                <MainChart
                                    data={details?.main_chart}
                                    title={`${kpis.find(k => k.id === selectedKpiId)?.title || 'Metric'} Trend`}
                                />
                            </div>

                            {/* Right: Contributors */}
                            <div className="lg:col-span-1 h-full">
                                <Contributors
                                    data={details?.contributors}
                                    kpiData={kpis.find(k => k.id === selectedKpiId)}
                                />
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default Dashboard;
