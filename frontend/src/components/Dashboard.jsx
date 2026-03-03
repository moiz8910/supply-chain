import React, { useEffect, useState } from 'react';
import KPITile from './KPITile';
import MainChart from './MainChart';
import Contributors from './Contributors';
import { Bell, User, Sparkles, Settings2, X, Check } from 'lucide-react';

const Dashboard = () => {
    const [kpis, setKpis] = useState([]);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedKpiId, setSelectedKpiId] = useState(null);
    const [timePeriod, setTimePeriod] = useState('Last 30 Days');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [region, setRegion] = useState('Global');
    const [productFamily, setProductFamily] = useState('All Families');
    const [filterOptions, setFilterOptions] = useState({ regions: ['Global'], product_families: ['All Families'] });
    const [graphDimension, setGraphDimension] = useState('');

    const [selectedKpiKeys, setSelectedKpiKeys] = useState(() => {
        const saved = localStorage.getItem('selectedKpis');
        return saved ? JSON.parse(saved) : [
            'supplier_otifq', 'rm_cost_per_unit', 'inbound_transport_cost',
            'avg_transit_time_rm', 'inventory_days_cover', 'production_cost'
        ];
    });
    const [showCustomizer, setShowCustomizer] = useState(false);
    const [tempSelectedKeys, setTempSelectedKeys] = useState([]);

    const renderExplanation = (kpi) => {
        if (!kpi) return null;

        switch (kpi.title) {
            case 'On-Time In-Full (OTIF)':
                return `OTIF shifted by ${kpi.delta}. The primary driver was a 15% increase in port congestion at Shanghai, delaying 42 key shipments. Carrier unreliability in the APAC region contributed an additional 4% negative impact.`;
            case 'Forecast Accuracy':
                return `Forecast accuracy changed by ${kpi.delta}. Increased demand volatility in the Electronics segment outpaced our predictive models. Supplier material shortages caused an unpredicted 8% drop in fulfillment capability.`;
            case 'Inventory Days':
                return `Inventory days changed by ${kpi.delta}. We are holding excess raw materials (Chemicals) due to a sudden drop in Q3 manufacturing orders, tying up working capital unnecessarily.`;
            case 'Manufacturing Capacity':
                return `Capacity utilization changed ${kpi.delta}. Plant A experienced a 3-day unplanned downtime event affecting the Specialty line, while Plant B is over-performing by 4% to compensate.`;
            case 'Freight Cost per Unit':
                return `Freight costs moved ${kpi.delta}. Expedited air freight usage spiked by 22% this week to bypass the ongoing ocean freight constraints, directly inflating the per-unit average.`;
            case 'Order Backlog':
                return `Backlog ${kpi.delta}. The recent spike in North American demand exceeded local warehouse safety stock, pushing 120 new orders into the backlog queue.`;
            default:
                return `Performance changed by ${kpi.delta}. Multiple underlying factors across the supply chain contributed to this recent shift in metric stability.`;
        }
    };

    useEffect(() => {
        // Fetch dynamic filter options from DB (only once)
        fetch('/api/dashboard/filters')
            .then(res => res.json())
            .then(data => setFilterOptions(data))
            .catch(err => console.error('Error fetching filters:', err));
    }, []);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                let url = `/api/dashboard/details?dimension=${encodeURIComponent(graphDimension)}`;
                if (selectedKpiId) {
                    url += `&kpi_id=${selectedKpiId}`;
                }
                const res = await fetch(url);
                const data = await res.json();
                setDetails(data);
            } catch (err) {
                console.error('Error fetching details:', err);
            }
        };

        fetchDetails();
    }, [selectedKpiId, graphDimension]);

    // Update default dimension when picking a new KPI
    useEffect(() => {
        if (!selectedKpiId) return;
        const dims = getDimensionsForKpi(selectedKpiId);
        setGraphDimension(dims[0]);
    }, [selectedKpiId]);

    const getDimensionsForKpi = (id) => {
        switch (id) {
            case 'supplier_otifq':
                return ['RM category', 'Supplier', 'Time (Monthly)'];
            case 'rm_cost_per_unit':
                return ['RM category', 'Supplier', 'Time (Monthly)'];
            case 'inbound_transport_cost':
                return ['RM category', 'Mode', 'Lane', 'LSP', 'Time (Monthly)'];
            case 'avg_transit_time_rm':
                return ['Mode', 'Lane', 'LSP', 'Time (Monthly)'];
            case 'inventory_days_cover':
                return ['RM & FG type', 'Time (Monthly)'];
            case 'production_cost':
                return ['FG type', 'Line', 'Time (Monthly)'];
            case 'production_plan_compliance':
                return ['FG type', 'Time (Monthly)'];
            case 'quality_rate':
                return ['FG type', 'Line', 'Time (Monthly)'];
            case 'outbound_transport_cost':
                return ['FG type', 'Mode', 'Time (Monthly)'];
            case 'otif_score':
                return ['FG type', 'Region', 'Time (Monthly)'];
            default:
                return ['Time (Monthly)'];
        }
    };

    useEffect(() => {
        // Connect to Real-time WebSocket Data Stream for KPIs
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws/kpis`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('Connected to live KPI stream');
            ws.send(JSON.stringify({ timePeriod, customStartDate, customEndDate, region, productFamily }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setKpis(data);
            setLoading(false);
        };

        ws.onerror = (err) => {
            console.error('WebSocket Error:', err);
            // Fallback to REST API if WebSocket fails
            fetch('/api/kpis').then(res => res.json()).then(data => {
                setKpis(data);
                setLoading(false);
            });
        };

        return () => ws.close(); // Clean up on unmount
    }, [timePeriod, customStartDate, customEndDate, region, productFamily]);

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
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="bg-gray-100 border-0 outline-none px-3 py-1.5 rounded-md text-gray-700 font-semibold cursor-pointer hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        >
                            {filterOptions.regions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-600">Product Family:</span>
                        <select
                            value={productFamily}
                            onChange={(e) => setProductFamily(e.target.value)}
                            className="bg-gray-100 border-0 outline-none px-3 py-1.5 rounded-md text-gray-700 font-semibold cursor-pointer hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        >
                            {filterOptions.product_families.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-gray-400">
                    <button
                        onClick={() => { setTempSelectedKeys(selectedKpiKeys); setShowCustomizer(true); }}
                        className="flex items-center gap-1.5 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 px-3 py-1.5 rounded-lg transition-all mr-2 shadow-sm"
                    >
                        <Settings2 size={16} />
                        Customize KPIs
                    </button>
                    <Bell size={20} className="hover:text-gray-600 cursor-pointer" />
                    <User size={24} className="text-gray-600 bg-gray-200 rounded-full p-1" />
                </div>
            </div>

            <div className="p-6 max-w-[1600px] mx-auto space-y-6">

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    {kpis.filter(k => selectedKpiKeys.includes(k.id)).slice(0, 6).map(kpi => (
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
                            <div className="flex gap-3 items-center">
                                <span className="font-semibold text-xs text-gray-500">View By:</span>
                                <select
                                    value={graphDimension}
                                    onChange={(e) => setGraphDimension(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 outline-none px-3 py-1.5 rounded-md text-gray-700 font-bold text-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                                >
                                    {getDimensionsForKpi(selectedKpiId).map(dim => (
                                        <option key={dim} value={dim}>{dim}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[450px]">
                            {/* Center: Main Chart */}
                            <div className="lg:col-span-2 h-full">
                                <MainChart
                                    data={details?.main_chart}
                                    title={details?.chart_title || `${kpis.find(k => k.id === selectedKpiId)?.title || 'Metric'} Trend`}
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

                        {/* Bottom: AI Causal Analysis */}
                        <div className="mt-6 bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 shadow-sm">
                            <h4 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                AI Causal Analysis
                            </h4>
                            <p className="text-sm text-indigo-800/80 leading-relaxed font-medium">
                                {renderExplanation(kpis.find(k => k.id === selectedKpiId))}
                            </p>
                        </div>
                    </div>
                )}


            </div>

            {/* Customizer Modal */}
            {showCustomizer && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Customize Dashboard KPIs</h3>
                                <p className="text-sm text-gray-500 mt-1">Select exactly 6 KPIs to display on your main dashboard.</p>
                            </div>
                            <button onClick={() => setShowCustomizer(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {kpis.map(kpi => {
                                    const isSelected = tempSelectedKeys.includes(kpi.id);
                                    return (
                                        <div
                                            key={kpi.id}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setTempSelectedKeys(prev => prev.filter(id => id !== kpi.id));
                                                } else {
                                                    if (tempSelectedKeys.length < 6) {
                                                        setTempSelectedKeys(prev => [...prev, kpi.id]);
                                                    }
                                                }
                                            }}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm'}`}
                                        >
                                            <span className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>{kpi.title}</span>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
                                                {isSelected && <Check size={14} strokeWidth={3} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                                <span className={tempSelectedKeys.length === 6 ? 'text-green-600' : 'text-indigo-600'}>
                                    {tempSelectedKeys.length}
                                </span>
                                /6 Selected
                            </span>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCustomizer(false)}
                                    className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={tempSelectedKeys.length !== 6}
                                    onClick={() => {
                                        setSelectedKpiKeys(tempSelectedKeys);
                                        localStorage.setItem('selectedKpis', JSON.stringify(tempSelectedKeys));
                                        setShowCustomizer(false);
                                    }}
                                    className="px-5 py-2.5 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
                                >
                                    <Check size={16} />
                                    Save Configuration
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
