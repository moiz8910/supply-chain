import React, { useState } from 'react';
import { Settings2, Play, GitMerge, TrendingUp, DollarSign, Activity, ChevronDown, Check } from 'lucide-react';

const mockScenarios = [
    {
        id: 'baseline',
        name: 'Baseline (Current Plan)',
        metrics: {
            otif: '92.4%', otif_delta: '0',
            cost: '$12.50', cost_delta: '0',
            inventory: '12.5 Days', inv_delta: '0',
            revenue_risk: '$45K', rev_delta: '0'
        },
        selected: false
    },
    {
        id: 'scen_1',
        name: 'Expedite / Premium Freight',
        metrics: {
            otif: '94.0%', otif_delta: '+1.6%',
            cost: '$14.20', cost_delta: '+$1.70',
            inventory: '12.0 Days', inv_delta: '-0.5 Days',
            revenue_risk: '$10K', rev_delta: '-$35K'
        },
        selected: true
    },
    {
        id: 'scen_2',
        name: 'Re-route via Alternate Port',
        metrics: {
            otif: '89.5%', otif_delta: '-2.9%',
            cost: '$13.10', cost_delta: '+$0.60',
            inventory: '14.5 Days', inv_delta: '+2.0 Days',
            revenue_risk: '$180K', rev_delta: '+$135K'
        },
        selected: false
    }
];

const OptimizerScreen = () => {
    const [running, setRunning] = useState(false);

    const handleSimulate = () => {
        setRunning(true);
        setTimeout(() => setRunning(false), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-200 shrink-0 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Supply Chain Optimizer</h1>
                    <p className="text-sm text-gray-500 mt-1">What-if simulation engine to evaluate alternative operational actions.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-200">
                        <GitMerge size={16} /> Load Preset
                    </button>
                    <button
                        onClick={handleSimulate}
                        disabled={running}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${running ? 'bg-indigo-400 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                            }`}
                    >
                        {running ? <span className="animate-spin"><Settings2 size={16} /></span> : <Play size={16} />}
                        {running ? 'Running Simulation...' : 'Run Simulation'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">

                {/* Left Panel: Inputs & Constraints */}
                <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto p-6 space-y-8 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">

                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-500" /> Shock / Variable Inputs
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex justify-between">
                                    Demand Surge (Region EU) <span className="text-indigo-600">+15%</span>
                                </label>
                                <input type="range" className="w-full accent-indigo-600" min="-50" max="50" defaultValue="15" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex justify-between">
                                    RM Lead Time Variance <span className="text-red-600">+4 Days</span>
                                </label>
                                <input type="range" className="w-full accent-indigo-600" min="-10" max="20" defaultValue="4" />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-indigo-500" /> Operational Constraints
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Line Capacity Cap</label>
                                <div className="relative">
                                    <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500">
                                        <option>Hard Limit (100%)</option>
                                        <option>Overtime Permitted (120%)</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Logistics Strategy</label>
                                <div className="relative">
                                    <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500">
                                        <option>Least Cost Routing</option>
                                        <option selected>Prioritize OTIF (Premium Air/Spot)</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Panel: Scenario Scorecards */}
                <div className="flex-1 bg-gray-50/50 p-8 overflow-y-auto relative">

                    {running && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="mt-4 font-bold text-indigo-900">Evaluating multi-echelon impacts...</p>
                        </div>
                    )}

                    <h2 className="text-lg font-bold text-gray-900 mb-6 px-1">Scenario Comparison Scorecard</h2>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {mockScenarios.map((scen, idx) => (
                            <div key={scen.id} className={`bg-white rounded-2xl border-2 transition-all flex flex-col ${scen.selected ? 'border-indigo-500 shadow-lg shadow-indigo-100 ring-4 ring-indigo-50' : 'border-gray-200 shadow-sm'
                                }`}>
                                <div className={`p-5 border-b rounded-t-xl ${scen.selected ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50/50 border-gray-100'}`}>
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-bold text-lg leading-tight ${scen.selected ? 'text-indigo-900' : 'text-gray-900'}`}>{scen.name}</h3>
                                        {scen.selected && <div className="bg-indigo-600 rounded-full p-1 text-white"><Check size={14} /></div>}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2 block">
                                        {idx === 0 ? 'Current Trajectory' : `Alternative ${idx}`}
                                    </span>
                                </div>

                                <div className="p-5 flex-1 space-y-5">

                                    {/* OTIF */}
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1.5"><Activity size={12} /> Projected OTIF</p>
                                        <div className="flex items-end gap-3">
                                            <span className="text-2xl font-black text-gray-900">{scen.metrics.otif}</span>
                                            {scen.metrics.otif_delta !== '0' && (
                                                <span className={`text-sm font-bold mb-1 ${scen.metrics.otif_delta.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                                                    {scen.metrics.otif_delta}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cost */}
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1.5"><DollarSign size={12} /> Freight Cost / Unit</p>
                                        <div className="flex items-end gap-3">
                                            <span className="text-xl font-bold text-gray-900">{scen.metrics.cost}</span>
                                            {scen.metrics.cost_delta !== '0' && (
                                                <span className={`text-sm font-bold mb-0.5 ${scen.metrics.cost_delta.startsWith('+') ? 'text-orange-500' : 'text-green-600'}`}>
                                                    {scen.metrics.cost_delta}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Risk */}
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1.5"><AlertTriangle size={12} /> Revenue at Risk</p>
                                        <div className="flex items-end gap-3">
                                            <span className="text-xl font-bold text-red-600">{scen.metrics.revenue_risk}</span>
                                        </div>
                                    </div>

                                </div>

                                <div className="p-4 border-t border-gray-100 mt-auto">
                                    <button className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors ${scen.selected
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}>
                                        {scen.selected ? 'Selected Scenario' : 'Select for Execution'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Explainability Section */}
                    <div className="mt-8 bg-indigo-50/50 border border-indigo-100 rounded-xl p-6">
                        <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600" /> AI Rationale
                        </h4>
                        <p className="text-sm text-indigo-800 leading-relaxed max-w-4xl">
                            The <strong>Expedite / Premium Freight</strong> scenario is recommended. The $1.70 per unit increase in freight cost is offset by preserving a 94.0% OTIF rate, which prevents an estimated $135K in SLA penalties and revenue loss compared to standard rerouting. This approach maximizes overall margin under the current supply shock constraints.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OptimizerScreen;
