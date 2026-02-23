import React, { useState } from 'react';
import { Filter, Maximize2, Layers, AlertCircle, TrendingUp, Navigation } from 'lucide-react';

const mockNodes = [
    { id: 'n1', text: 'Mahad Plant', x: 200, y: 300, type: 'plant', status: 'normal', metrics: { capacity: '85%', inventory: '12 Days' } },
    { id: 'n2', text: 'Guangzhou Port', x: 600, y: 150, type: 'port', status: 'warning', metrics: { congestion: 'High', waitTime: '4 Days' } },
    { id: 'n3', text: 'Rotterdam Hub', x: 750, y: 250, type: 'hub', status: 'critical', metrics: { utilization: '98%', backlog: '45 MT' } },
    { id: 'n4', text: 'US East Coast CFS', x: 100, y: 180, type: 'warehouse', status: 'normal', metrics: { space: '40%', active: 'Yes' } },
];

const mockLanes = [
    { id: 'l1', from: 'n1', to: 'n2', mode: 'sea', status: 'normal', volume: 'high', risk: 'Low' },
    { id: 'l2', from: 'n1', to: 'n3', mode: 'sea', status: 'critical', volume: 'medium', risk: 'High' },
    { id: 'l3', from: 'n3', to: 'n4', mode: 'road', status: 'warning', volume: 'low', risk: 'Medium' },
];

const NetworkMapScreen = () => {
    const [selectedNode, setSelectedNode] = useState(null);

    // Simplified SVG drawing logic for demonstration
    const renderNode = (node) => {
        let color = '#4f46e5'; // indigo-600 (normal)
        if (node.status === 'warning') color = '#f59e0b'; // amber-500
        if (node.status === 'critical') color = '#ef4444'; // red-500

        let shape = <circle cx={node.x} cy={node.y} r={16} fill={color} />;
        if (node.type === 'port') shape = <rect x={node.x - 14} y={node.y - 14} width={28} height={28} fill={color} rx={4} />;
        if (node.type === 'warehouse') shape = <polygon points={`${node.x},${node.y - 16} ${node.x + 16},${node.y + 10} ${node.x - 16},${node.y + 10}`} fill={color} />;

        return (
            <g
                key={node.id}
                className="cursor-pointer transition-transform hover:scale-110"
                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                onClick={() => setSelectedNode(node)}
            >
                {/* Glow effect for critical */}
                {node.status === 'critical' && <circle cx={node.x} cy={node.y} r={24} fill={color} opacity={0.2} className="animate-ping" />}

                {shape}
                <text x={node.x} y={node.y + 32} textAnchor="middle" className="text-xs font-bold fill-gray-700 drop-shadow-sm">{node.text}</text>
            </g>
        );
    };

    const renderLane = (lane) => {
        const fromNode = mockNodes.find(n => n.id === lane.from);
        const toNode = mockNodes.find(n => n.id === lane.to);
        if (!fromNode || !toNode) return null;

        let strokeColor = '#94a3b8'; // slate-400
        let strokeDasharray = lane.mode === 'sea' ? '8,4' : 'none';
        let strokeWidth = lane.volume === 'high' ? 6 : lane.volume === 'medium' ? 4 : 2;

        if (lane.status === 'critical') strokeColor = '#fca5a5'; // red-300
        if (lane.status === 'warning') strokeColor = '#fcd34d'; // amber-300

        return (
            <line
                key={lane.id}
                x1={fromNode.x} y1={fromNode.y}
                x2={toNode.x} y2={toNode.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            />
        );
    };

    return (
        <div className="h-full flex flex-col relative bg-gray-50">
            {/* Top Toolbar */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0 z-10 shadow-sm relative">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Supply Chain Network Map</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Live View
                        </span>
                        <span className="text-xs text-gray-500">Showing 42 active lanes</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        <Filter size={16} /> Filters
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        <Layers size={16} /> Overlays
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        <Maximize2 size={16} /> Fullscreen
                    </button>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative overflow-hidden bg-[#e2e8f0] bg-opacity-30" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                        {/* Map base silhouette placeholder */}
                        <path id="world-map" d="M100,100 Q400,50 800,200 T900,400 T200,500 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                    </defs>
                    <use href="#world-map" opacity="0.6" />

                    {/* Render Lanes first so they are under nodes */}
                    {mockLanes.map(renderLane)}

                    {/* Render Nodes */}
                    {mockNodes.map(renderNode)}
                </svg>

                {/* Legend Panel */}
                <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-64">
                    <h4 className="font-bold text-gray-800 text-sm mb-3">Map Legend</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600"></div> Plant</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-600 rounded-sm"></div> Port</div>
                            <div className="flex items-center gap-2"><div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-indigo-600"></div> Hub</div>
                        </div>
                        <div className="h-px bg-gray-100 my-2"></div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Warning</span>
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical Risk</span>
                        </div>
                    </div>
                </div>

                {/* Node Detail Slide-over (if selected) */}
                {selectedNode && (
                    <div className="absolute top-4 right-4 bottom-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col animate-in slide-in-from-right z-20">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 rounded-t-2xl">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedNode.text}</h3>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">{selectedNode.type}</p>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-900 bg-white shadow-sm p-1.5 rounded-full">&times;</button>
                        </div>

                        <div className="p-5 flex-1 overflow-y-auto">

                            {/* Status Alert */}
                            {selectedNode.status !== 'normal' && (
                                <div className={`p-3 rounded-lg mb-6 flex items-start gap-3 border ${selectedNode.status === 'critical' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                                    <AlertCircle size={18} className="mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold capitalize">{selectedNode.status} Constraint Detected</p>
                                        <p className="text-xs mt-1 opacity-80">Review related exceptions or reroute pending shipments.</p>
                                    </div>
                                </div>
                            )}

                            {/* Key Metrics */}
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Metrics</h4>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {Object.entries(selectedNode.metrics).map(([key, val]) => (
                                    <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 capitalize">{key}</p>
                                        <p className="text-lg font-bold text-gray-900 mt-1">{val}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h4>
                            <div className="space-y-2">
                                <button className="w-full text-left px-4 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm font-medium text-gray-700 flex justify-between items-center group transition-colors">
                                    View Related Exceptions
                                    <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </button>
                                <button className="w-full text-left px-4 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm font-medium text-gray-700 flex justify-between items-center group transition-colors">
                                    Launch Optimizer Scenario
                                    <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkMapScreen;
