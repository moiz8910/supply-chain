import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, ChevronRight, MessageSquare, ClipboardList, TrendingDown, Package, User, FileText, X } from 'lucide-react';

const mockExceptions = [
    {
        id: "EX-1042",
        title: "Critical ISO Tanker Shortage",
        type: "Logistics Capacity",
        severity: "High",
        timeframe: "Today",
        impacted: "42 Orders | 5 Products",
        kpi_impact: "OTIF -11.4%",
        probability: "98%",
        status: "Investigating",
        owner: "R. Sharma",
        due: "2 Hrs"
    },
    {
        id: "EX-1043",
        title: "Yield Variance at Plant B",
        type: "Manufacturing",
        severity: "Medium",
        timeframe: "This Week",
        impacted: "3 Batches (Acetic Acid)",
        kpi_impact: "Cost +4%",
        probability: "85%",
        status: "Open",
        owner: "Unassigned",
        due: "24 Hrs"
    },
    {
        id: "EX-1044",
        title: "Raw Material Delay (Methanol)",
        type: "Procurement",
        severity: "High",
        timeframe: "Today",
        impacted: "Plant C Production Schedule",
        kpi_impact: "Revenue at Risk: $120k",
        probability: "90%",
        status: "Mitigating",
        owner: "S. Gupta",
        due: "Overdue"
    },
    {
        id: "EX-1045",
        title: "Port Congestion - Nhava Sheva",
        type: "External Logistics",
        severity: "Medium",
        timeframe: "This Month",
        impacted: "14 Export Shipments",
        kpi_impact: "Lead Time +3 Days",
        probability: "75%",
        status: "Open",
        due: "3 Days"
    },
    {
        id: "EX-1046",
        title: "Minor Pallet Shortage",
        type: "Warehousing",
        severity: "Low",
        timeframe: "Next Week",
        impacted: "Warehouse D",
        kpi_impact: "Cost +1%",
        probability: "40%",
        status: "Resolved",
        owner: "M. Lee",
        due: "Completed"
    }
];

const ExceptionCard = ({ data, onClick, isSelected }) => (
    <div
        onClick={onClick}
        className={`p-4 border rounded-xl cursor-pointer transition-all ${isSelected
            ? 'border-indigo-500 bg-indigo-50/30 shadow-md'
            : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
            }`}
    >
        <div className="flex justify-between items-start mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${data.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>{data.severity}</span>
            <span className="text-xs text-gray-500 font-medium">{data.timeframe}</span>
        </div>
        <h3 className="font-bold text-gray-900 leading-tight mb-1">{data.title}</h3>
        <p className="text-xs text-gray-500 mb-3">{data.id} • {data.type}</p>

        <div className="space-y-2 mt-3 pt-3 border-t border-gray-100 text-xs">
            <div className="flex justify-between">
                <span className="text-gray-500">Impact:</span>
                <span className="font-semibold text-gray-700">{data.impacted}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-500">KPI Risk:</span>
                <span className="font-semibold text-red-600">{data.kpi_impact}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1 text-gray-500">
                    <User size={12} /> {data.owner}
                </div>
                <span className={`px-2 py-0.5 rounded-full ${data.status === 'Open' ? 'bg-gray-100 text-gray-600' :
                    data.status === 'Investigating' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>{data.status}</span>
            </div>
        </div>
    </div>
);

const ExceptionsScreen = () => {
    const { exceptionId } = useParams();
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(exceptionId || null);
    const [showEvidence, setShowEvidence] = useState(false);
    const [severityFilter, setSeverityFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        if (exceptionId) {
            setSelectedId(exceptionId);
        }
    }, [exceptionId]);

    const handleSelect = (id) => {
        setSelectedId(id);
        setShowEvidence(false);
        navigate(`/exceptions/${id}`, { replace: true });
    };

    const filteredExceptions = mockExceptions.filter(exc => {
        if (severityFilter !== 'All' && exc.severity !== severityFilter) return false;
        if (statusFilter !== 'All' && exc.status !== statusFilter) return false;
        return true;
    });

    const selectedException = selectedId ? mockExceptions.find(e => e.id === selectedId) : null;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-200 shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Exceptions & Risks</h1>
                <p className="text-sm text-gray-500 mt-1">Centralized inbox for anomaly detection and root-cause resolution.</p>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Inbox List */}
                <div className="w-[380px] bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-700">Inbox Filters</span>
                                <span className="text-xs font-medium text-gray-500">{filteredExceptions.length} items</span>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={severityFilter}
                                    onChange={(e) => setSeverityFilter(e.target.value)}
                                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                >
                                    <option value="All">All Severities</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Open">Open</option>
                                    <option value="Investigating">Investigating</option>
                                    <option value="Mitigating">Mitigating</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {filteredExceptions.map(exc => (
                            <ExceptionCard
                                key={exc.id}
                                data={exc}
                                isSelected={selectedId === exc.id}
                                onClick={() => handleSelect(exc.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Workspace Array */}
                <div className="flex-1 bg-white overflow-y-auto p-8 flex flex-col">
                    {selectedException ? (
                        <div className="max-w-4xl mx-auto space-y-8">

                            {/* Header details */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${selectedException.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                            Severity: {selectedException.severity}
                                        </span>
                                        <span className="text-sm text-gray-500 font-medium">{selectedException.id}</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900">{selectedException.title}</h2>
                                    <p className="text-gray-500 mt-1">Detected continuously with {selectedException.probability} confidence.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Assign Owner</button>
                                    <button className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-bold text-white hover:bg-indigo-700 transition-colors">Update Status</button>
                                </div>
                            </div>

                            {/* Root Cause Workspace */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 border border-gray-200 rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-gray-400" /> Root-Cause Hypotheses</h3>
                                    <ul className="space-y-3">
                                        <li className="flex gap-3 text-sm">
                                            <span className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                                            <span className="text-gray-700">{selectedException.id === 'EX-1042' ? 'Primary: Regional tank cleaning facility suspension.' : 'Primary cause under investigation.'}</span>
                                        </li>
                                        <li className="flex gap-3 text-sm">
                                            <span className="mt-1 w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                                            <span className="text-gray-700">Secondary: End-of-month dispatch surge compounded capacity issues.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-6 border border-gray-200 rounded-xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingDown className="w-5 h-5 text-gray-400" /> Impacted Entities</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Orders & Shipments</p>
                                                <p className="font-medium text-gray-900">{selectedException.impacted}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Projected KPI Delta</p>
                                                <p className="font-bold text-red-600">{selectedException.kpi_impact}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowEvidence(true)}
                                        className="mt-6 w-full py-2.5 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <FileText size={16} /> View Evidence Pack
                                    </button>
                                </div>
                            </div>

                            {/* Mitigation Options */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 px-1 border-b border-gray-200 pb-2">Recommended Mitigations</h3>
                                <div className="space-y-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="p-5 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors flex justify-between items-center group">
                                            <div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {i === 1 ? 'Pre-book Guaranteed Capacity (Premium)' : 'Prioritize Tier 1 Customers & Delay Remainder'}
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {i === 1 ? 'Cost Impact: +$120K. Maintains OTIF >90%.' : 'Minimizes upfront cost. Long-term SLA risk.'}
                                                </p>
                                            </div>
                                            <button className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 mix-blend-multiply flex items-center gap-2">
                                                Simulate <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Audit Trail */}
                            <div className="pt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Activity & Audit Trail</h3>
                                <div className="space-y-5 pl-4 border-l-2 border-gray-100">
                                    <div className="relative pl-6">
                                        <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                                        <p className="text-sm font-medium text-gray-900">Assigned to R. Sharma</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Today at 09:15 AM</p>
                                    </div>
                                    <div className="relative pl-6">
                                        <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                                        <p className="text-sm font-medium text-gray-900">Anomaly Detected by System</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Today at 08:30 AM</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col justify-center items-center text-gray-400 space-y-4 flex-1">
                            <AlertCircle className="w-16 h-16 text-gray-200" />
                            <p className="text-xl font-medium text-gray-500">Select an exception from the inbox to view details & resolve</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Evidence Pack Modal */}
            {showEvidence && (
                <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-8">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FileText size={20} className="text-indigo-600" /> Evidence Pack: {selectedException.id}</h2>
                                <p className="text-sm text-gray-500 mt-1">System-generated audit trail of affected objects.</p>
                            </div>
                            <button onClick={() => setShowEvidence(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Impacted Orders (Sample)</h3>
                            <table className="w-full text-left text-sm mb-8">
                                <thead className="text-gray-500 bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 font-semibold border-b">Order ID</th>
                                        <th className="px-4 py-2 font-semibold border-b">Customer</th>
                                        <th className="px-4 py-2 font-semibold border-b">Product</th>
                                        <th className="px-4 py-2 font-semibold border-b text-right">Value At Risk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-indigo-600">SO-20945</td>
                                        <td className="px-4 py-3">GlobalChem Corp</td>
                                        <td className="px-4 py-3 text-gray-600">Acetic Acid (Bulk)</td>
                                        <td className="px-4 py-3 text-right font-medium text-red-600">$45,000</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-indigo-600">SO-20946</td>
                                        <td className="px-4 py-3">EuroPlastics Ltd</td>
                                        <td className="px-4 py-3 text-gray-600">Acetic Acid (Bulk)</td>
                                        <td className="px-4 py-3 text-right font-medium text-red-600">$32,500</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-indigo-600">SO-20988</td>
                                        <td className="px-4 py-3">Apex Manufacturing</td>
                                        <td className="px-4 py-3 text-gray-600">Methanol (Tanker)</td>
                                        <td className="px-4 py-3 text-right font-medium text-red-600">$18,200</td>
                                    </tr>
                                </tbody>
                            </table>

                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">System Telemetry Log</h3>
                            <div className="bg-gray-900 text-gray-300 font-mono text-xs p-4 rounded-lg overflow-x-auto">
                                <div>[08:15:22] WARN: Carrier API (TransLog) returned 0 available ISO tanks for region EU-West.</div>
                                <div>[08:15:25] INFO: Re-querying spot market databases...</div>
                                <div>[08:16:01] WARN: Spot market capacity &lt; required volume (V=42,000L).</div>
                                <div>[08:16:05] CRIT: Anomaly Threshold Exceeded. Probability 98%. Triggering Exception EX-1042.</div>
                                <div className="text-indigo-400">[08:16:08] CALC: Running impact simulation on open order book...</div>
                                <div className="text-red-400">[08:16:15] RSLT: OTIF projected to drop by 11.4%. 42 Sales Orders affected.</div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button onClick={() => setShowEvidence(false)} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors">Close Evidence Pack</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExceptionsScreen;
