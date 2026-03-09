import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, ArrowRight, CheckCircle, Clock, Settings2 } from 'lucide-react';
import { getFullUrl } from '../lib/api';

const ExceptionDashboard = ({ onClose }) => {
    const navigate = useNavigate();
    const [anomaly, setAnomaly] = useState(null);
    const [impact, setImpact] = useState(null);
    const [alternatives, setAlternatives] = useState(null);
    const [selectedAlt, setSelectedAlt] = useState(null);
    const [status, setStatus] = useState('reviewing'); // reviewing, approving, approved
    const [approvalLog, setApprovalLog] = useState(null);

    useEffect(() => {
        // Fetch alternatives from the new dynamic AI endpoint
        const EXCEPTION_ID = "EX-1042"; // Hardcoded for this demo dashboard

        // Mock the anomaly context that used to come from /current
        const mockAnomalyData = {
            id: EXCEPTION_ID,
            title: "Critical ISO Tanker Shortage",
            severity: "High",
            description: "A sudden shortage of ISO tankers in the EU-West region is preventing the loading of Acetic Acid and Methanol shipments.",
            affected_products: ["Acetic Acid (Bulk)", "Methanol (Tanker)"],
            impacted_orders_count: 42,
            estimated_value_at_risk: "$125,000"
        };

        const mockImpactData = [
            { kpi: "On-Time In-Full (OTIF)", current: "94.2%", predicted: "82.8%", delta: "-11.4%", status: 'critical' },
            { kpi: "Lead Time (Days)", current: "4.5", predicted: "7.2", delta: "+2.7", status: 'critical' },
            { kpi: "Transport Cost/Unit", current: "$142", predicted: "$158", delta: "+$16", status: 'warning' }
        ];

        setAnomaly(mockAnomalyData);
        setImpact(mockImpactData);

        fetch(getFullUrl(`/api/anomaly/alternatives/${EXCEPTION_ID}`))
            .then(res => res.json())
            .then(data => setAlternatives(data))
            .catch(err => console.error("Failed to load anomaly alternatives", err));
    }, []);

    const handleApprove = async () => {
        if (!selectedAlt) return;
        setStatus('approving');
        try {
            const EXCEPTION_ID = "EX-1042";
            const res = await fetch(getFullUrl('/api/anomaly/approve'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exception_id: EXCEPTION_ID, alternative_id: selectedAlt })
            });
            const data = await res.json();
            setApprovalLog(data);
            setStatus('approved');
        } catch (error) {
            console.error(error);
            setStatus('reviewing');
        }
    };

    if (!anomaly || !impact || !alternatives) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg">Loading Exception Data...</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-900/60 z-50 overflow-y-auto font-sans flex items-start justify-center pt-10 pb-20">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-500 rounded-full p-2">
                            <AlertTriangle className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-900 leading-tight">{anomaly.title}</h2>
                            <p className="text-sm font-medium text-red-700">{anomaly.id} | Severity: {anomaly.severity.toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-80px)] overflow-y-auto bg-gray-50">

                    {/* Top Left: Context & Impact */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Situation Context</h3>
                            <p className="text-gray-800 text-sm leading-relaxed mb-4">{anomaly.description}</p>

                            <h4 className="text-xs font-semibold text-gray-500 uppercase mt-4 mb-2">Affected Products</h4>
                            <div className="flex flex-wrap gap-2">
                                {anomaly.affected_products.map(prod => (
                                    <span key={prod} className="px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md text-xs font-medium">
                                        {prod}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5">
                                <div>
                                    <p className="text-xs text-gray-400">Impacted Orders</p>
                                    <p className="text-lg font-bold text-gray-800">{anomaly.impacted_orders_count}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Value at Risk</p>
                                    <p className="text-lg font-bold text-red-600">{anomaly.estimated_value_at_risk}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Top Right: Simulated KPIs */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Simulated Impact on KPIs</h3>
                        <div className="space-y-4">
                            {impact.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{item.kpi}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400 line-through">{item.current}</span>
                                            <ArrowRight className="w-3 h-3 text-gray-300" />
                                            <span className={`text-sm font-bold ${item.status === 'critical' ? 'text-red-600' : 'text-orange-500'}`}>
                                                {item.predicted}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'critical' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                                        {item.delta}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Full Width: Alternatives & Action */}
                    <div className="lg:col-span-2 flex flex-col">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-grow">

                            {status === 'approved' && approvalLog ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Workflow Authorized</h2>
                                    <p className="text-gray-500 mb-8 max-w-md">{approvalLog.message}</p>

                                    <div className="w-full text-left bg-gray-50 rounded-lg p-6 border border-gray-100">
                                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Triggered Agentic Actions
                                        </h3>
                                        <ul className="space-y-3">
                                            {approvalLog.actions_triggered.map((action, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                                                    <span className="text-sm text-gray-700">{action}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="mt-8 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        Return to Dashboard
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Strategic Alternatives</h3>
                                        <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-md">DoA Limit: INR 5.0M</span>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {alternatives.map((alt) => (
                                            <div
                                                key={alt.id}
                                                onClick={() => setSelectedAlt(alt.id)}
                                                className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col md:flex-row md:items-center gap-6 ${selectedAlt === alt.id
                                                    ? 'border-indigo-600 bg-indigo-50/30 shadow-sm'
                                                    : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 text-base leading-tight mb-1">{alt.title}</h4>
                                                    <p className="text-sm text-gray-600">{alt.description}</p>
                                                </div>

                                                <div className="flex flex-wrap md:flex-nowrap items-start gap-6 md:pl-6 md:border-l md:border-gray-200/60 shrink-0">
                                                    <div className="w-auto md:w-36">
                                                        <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Cost Impact</span>
                                                        <span className="inline-block text-sm font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded break-words">{alt.cost_impact}</span>
                                                    </div>
                                                    <div className="w-auto md:w-40">
                                                        <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">KPI Impact</span>
                                                        <span className="text-xs text-gray-700 font-medium leading-relaxed block">{alt.kpi_impact}</span>
                                                    </div>
                                                    <div className="w-auto md:w-48">
                                                        <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Trade-off</span>
                                                        <span className="text-xs text-gray-700 font-medium leading-relaxed block">{alt.tradeoff}</span>
                                                    </div>
                                                </div>

                                                {selectedAlt === alt.id && (
                                                    <div className="absolute top-1/2 -translate-y-1/2 -left-3 hidden md:block">
                                                        <div className="w-6 h-6 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                                            <CheckCircle className="w-3 h-3 text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedAlt === alt.id && (
                                                    <div className="absolute -top-3 -left-3 md:hidden">
                                                        <div className="w-6 h-6 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                                            <CheckCircle className="w-3 h-3 text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                                        <p className="text-xs text-gray-500 max-w-sm">
                                            By authorizing, you approve the selected cost implication and trigger automated supplier and customer communications.
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    navigate('/optimizer');
                                                }}
                                                className="px-6 py-3 rounded-lg font-bold text-sm tracking-wide transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Settings2 className="w-4 h-4" /> Go to Optimizer
                                            </button>
                                            <button
                                                onClick={handleApprove}
                                                disabled={!selectedAlt || status === 'approving'}
                                                className={`px-6 py-3 rounded-lg font-bold text-sm tracking-wide transition-colors ${!selectedAlt
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                                                    }`}
                                            >
                                                {status === 'approving' ? 'Authorizing...' : 'Authorize Selected Action'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExceptionDashboard;
