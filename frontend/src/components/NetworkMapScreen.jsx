import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Maximize2, Layers, AlertCircle, RefreshCw, ArrowLeft, Package, Truck, Activity, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    Line,
    ZoomableGroup
} from "react-simple-maps";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const NetworkMapScreen = () => {
    // Data State
    const [mapData, setMapData] = useState({ regions: [], entities: [] });
    const [lanes, setLanes] = useState([]);
    const [loading, setLoading] = useState(true);

    // View State (0 = Global, 1 = Region, 2 = Entity)
    const [viewLevel, setViewLevel] = useState(0);
    const [selectedRegion, setSelectedRegion] = useState(null); // String name
    const [selectedEntity, setSelectedEntity] = useState(null); // Node object
    const [entityDetails, setEntityDetails] = useState(null); // Fetched entity shipments/orders
    const [selectedShipment, setSelectedShipment] = useState(null); // Highlighted shipment

    // Map Interactivity
    const [zoomLevel, setZoomLevel] = useState(1);
    const [mapCenter, setMapCenter] = useState([0, 20]);

    const fetchMapData = async () => {
        setLoading(true);
        try {
            const [nodesRes, lanesRes] = await Promise.all([
                fetch('/api/map/nodes'),
                fetch('/api/map/lanes')
            ]);
            const nodesData = await nodesRes.json();
            const lanesData = await lanesRes.json();
            setMapData(nodesData);
            setLanes(lanesData);
        } catch (e) {
            console.error("Failed to load map data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMapData();
    }, []);

    const fetchEntityDetails = async (entity) => {
        try {
            const res = await fetch(`/api/map/entity/${entity.id}/details?type=${entity.type}`);
            const data = await res.json();
            setEntityDetails(data);
        } catch (e) {
            console.error("Failed fetching entity details", e);
        }
    };

    // Calculate which entities to show in the sidebar for the selected region
    const sidebarEntities = useMemo(() => {
        if (!selectedRegion) return [];
        // Extract type and region from selectedRegion id (e.g., supp_cluster_Asia)
        const parts = selectedRegion.split('_');
        const clusterType = parts[0];
        const regionName = parts[parts.length - 1];

        let targetType = null;
        if (clusterType === 'cust') targetType = 'customer';
        if (clusterType === 'supp') targetType = 'supplier';

        return mapData.entities.filter(e => e.region === regionName && (!targetType || e.type === targetType));
    }, [mapData, selectedRegion]);

    // Calculate which nodes to show on the map based on the current drill-down level
    const visibleNodes = useMemo(() => {
        if (viewLevel === 0) return mapData.regions;
        if (viewLevel === 1) {
            // Level 1: Only show the selected region macro-node on the map.
            return mapData.regions.filter(r => r.id === selectedRegion);
        }
        if (viewLevel === 2 && selectedEntity) {
            // Level 2: Show the selected entity
            const connectedNodeIds = new Set([selectedEntity.id]);

            // If a specific shipment is selected, show its destination/source nodes
            if (selectedShipment) {
                connectedNodeIds.add(selectedShipment.from_node);
                connectedNodeIds.add(selectedShipment.to_node);
            }

            const connectedEntities = mapData.entities.filter(e => connectedNodeIds.has(e.id));
            const connectedRegions = mapData.regions.filter(r => connectedNodeIds.has(r.id));
            return [...connectedEntities, ...connectedRegions];
        }
        return [];
    }, [mapData, viewLevel, selectedRegion, selectedEntity, selectedShipment]);

    // Calculate which lanes to show. We only show lanes at Level 2 (Entity Level)
    const visibleLanes = useMemo(() => {
        if (viewLevel !== 2 || !selectedEntity) return [];
        return lanes.filter(l => l.from === selectedEntity.id || l.to === selectedEntity.id);
    }, [lanes, viewLevel, selectedEntity]);

    const activeLanesCount = useMemo(() => lanes.reduce((sum, l) => sum + (l.metrics?.['Active Shipments'] || 1), 0), [lanes]);

    // Navigation Handlers
    const handleNodeClick = (node) => {
        if (viewLevel === 0) {
            // Clicked a Region Macro Node
            // Clicked a Region Macro Node, e.g., 'supp_cluster_India'
            setSelectedRegion(node.id);

            setViewLevel(1);
            setMapCenter(node.coordinates);
            setZoomLevel(4); // Zoom into the region
        } else if (viewLevel === 1 || viewLevel === 2) {
            // Clicked an Entity Node
            setSelectedEntity(node);
            setViewLevel(2);
            setMapCenter(node.coordinates);
            setZoomLevel(6); // Zoom deeper into the entity
            fetchEntityDetails(node);
        }
    };

    const handleBackClick = () => {
        if (viewLevel === 2) {
            setViewLevel(1);
            setSelectedEntity(null);
            setEntityDetails(null);
            setSelectedShipment(null);
            // Re-center on region
            const regionMacro = mapData.regions.find(r => r.id === selectedRegion);
            if (regionMacro) {
                setMapCenter(regionMacro.coordinates);
                setZoomLevel(4);
            }
        } else if (viewLevel === 1) {
            setViewLevel(0);
            setSelectedRegion(null);
            setMapCenter([0, 20]);
            setZoomLevel(1);
        }
    };

    const handleShipmentClick = (shipment) => {
        setSelectedShipment(shipment);

        // Find nodes to auto pan/zoom
        const fromNode = mapData.entities.find(n => n.id === shipment.from_node) || mapData.regions.find(n => n.id === shipment.from_node);
        const toNode = mapData.entities.find(n => n.id === shipment.to_node) || mapData.regions.find(n => n.id === shipment.to_node);

        if (fromNode && toNode) {
            const midX = (fromNode.coordinates[0] + toNode.coordinates[0]) / 2;
            const midY = (fromNode.coordinates[1] + toNode.coordinates[1]) / 2;
            setMapCenter([midX, midY]);

            // Calculate distance to determine zoom level
            const dx = fromNode.coordinates[0] - toNode.coordinates[0];
            const dy = fromNode.coordinates[1] - toNode.coordinates[1];
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Heuristic zoom: further apart = lower zoom
            let newZoom = 8;
            if (dist > 100) newZoom = 2;
            else if (dist > 50) newZoom = 3;
            else if (dist > 20) newZoom = 5;

            setZoomLevel(newZoom);
        }
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev * 1.5, 10));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev / 1.5, 1));
    };

    const renderNodeMarker = (node) => {
        let color = '#4f46e5'; // slate-600
        if (node.status === 'warning') color = '#f59e0b'; // amber-500
        if (node.status === 'critical') color = '#ef4444'; // red-500

        // Ensure nodes maintain a consistent visual size on screen regardless of map zoom
        const scaleFactor = 1 / zoomLevel;
        const radius = (viewLevel === 0 ? 6 : 8) * scaleFactor;

        let shape = <circle cx={0} cy={0} r={radius} fill={color} />;
        if (node.type === 'port' || node.type === 'supplier') {
            const size = radius * 1.5;
            shape = <rect x={-size / 2} y={-size / 2} width={size} height={size} fill={color} rx={2 * scaleFactor} />;
        }
        if (node.type === 'warehouse' || node.type === 'customer') {
            const h = radius * 1.5;
            shape = <polygon points={`0,-${h} ${h},${h / 1.5} -${h},${h / 1.5}`} fill={color} />;
        }

        // Highlight selected entity by drawing a glowing ring behind it
        const isSelected = selectedEntity && selectedEntity.id === node.id;
        const isShipmentTarget = selectedShipment && (node.id === selectedShipment.from_node || node.id === selectedShipment.to_node);

        return (
            <Marker
                key={node.id}
                coordinates={node.coordinates}
                onClick={() => handleNodeClick(node)}
                className="cursor-pointer"
            >
                {isSelected && <circle cx={0} cy={0} r={radius * 3} fill="#818cf8" opacity={0.4} className="animate-pulse" />}
                {isShipmentTarget && <circle cx={0} cy={0} r={radius * 4} fill="#06b6d4" opacity={0.5} className="animate-ping" />}
                {node.status === 'critical' && <circle cx={0} cy={0} r={radius * 2.5} fill={color} opacity={0.3} className="animate-ping" />}

                {shape}

                {(viewLevel === 0 || zoomLevel > 2) && (
                    <text
                        textAnchor="middle"
                        y={radius * 2.5 + (node.type === 'plant' ? 0 : 4 * scaleFactor)}
                        fontSize={Math.max(1, 10 * scaleFactor)}
                        className="font-bold fill-gray-800 drop-shadow-sm pointer-events-none"
                    >
                        {node.text}
                    </text>
                )}
            </Marker>
        );
    };

    const renderLaneLine = (lane) => {
        // Only rendering connected lanes at Level 2, so the points are globally available in mapData
        const fromNode = mapData.entities.find(n => n.id === lane.from) || mapData.regions.find(n => n.id === lane.from);
        const toNode = mapData.entities.find(n => n.id === lane.to) || mapData.regions.find(n => n.id === lane.to);
        if (!fromNode || !toNode) return null;

        const scaleFactor = 1 / zoomLevel;
        let strokeColor = '#94a3b8'; // slate-400
        if (lane.status === 'critical') strokeColor = '#ef4444';
        if (lane.status === 'warning') strokeColor = '#f59e0b';

        let strokeDasharray = lane.mode === 'sea' ? `${4 * scaleFactor},${2 * scaleFactor}` : lane.mode === 'air' ? `${2 * scaleFactor},${2 * scaleFactor}` : 'none';
        let strokeWidth = Math.max(0.5, (lane.volume === 'high' ? 3 : 2) * scaleFactor);

        let opacity = "opacity-70";
        if (selectedShipment) {
            const isHighlighted = (lane.from === selectedShipment.from_node && lane.to === selectedShipment.to_node) ||
                (lane.to === selectedShipment.from_node && lane.from === selectedShipment.to_node);

            if (isHighlighted) {
                strokeColor = '#06b6d4'; // cyan-500
                strokeWidth = Math.max(1, 4 * scaleFactor);
                opacity = "opacity-100 drop-shadow-lg";
            } else {
                opacity = "opacity-20";
            }
        }

        return (
            <Line
                key={lane.id}
                from={fromNode.coordinates}
                to={toNode.coordinates}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                className={opacity}
            />
        );
    };

    return (
        <div className="h-full flex flex-col relative bg-slate-50">
            {/* Top Toolbar */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0 z-10 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {viewLevel === 0 ? "Global Supply Chain Network" : viewLevel === 1 ? `${selectedRegion} Regional Operations` : `${selectedEntity?.text} Detail`}
                    </h1>
                    {!loading && viewLevel === 0 && (
                        <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Tracking {activeLanesCount} Active Shipments
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    {viewLevel > 0 && (
                        <button onClick={handleBackClick} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition-colors">
                            <ArrowLeft size={16} /> Back to {viewLevel === 2 ? 'Region' : 'Global'} Map
                        </button>
                    )}
                    <button onClick={fetchMapData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Map Panel */}
                <div className={`relative flex-1 bg-[#e2e8f0] bg-opacity-30 transition-all duration-300 ${viewLevel > 0 ? 'w-2/3' : 'w-full'}`} style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                    <ComposableMap
                        projectionConfig={{ scale: 140 }}
                        width={800}
                        height={400}
                        style={{ width: "100%", height: "100%" }}
                    >
                        <ZoomableGroup
                            zoom={zoomLevel}
                            center={mapCenter}
                            maxZoom={10}
                            onMoveEnd={(position) => {
                                setZoomLevel(position.zoom);
                                setMapCenter(position.coordinates);
                            }}
                        >
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill="#eef2f6"
                                            stroke="#cbd5e1"
                                            strokeWidth={0.5}
                                            style={{
                                                default: { outline: "none" },
                                                hover: { fill: "#e2e8f0", outline: "none" },
                                                pressed: { outline: "none" },
                                            }}
                                        />
                                    ))
                                }
                            </Geographies>

                            {/* Render Lanes (Only at Entity Level) */}
                            {!loading && viewLevel === 2 && visibleLanes.map(renderLaneLine)}

                            {/* Render Nodes */}
                            {!loading && visibleNodes.map(renderNodeMarker)}
                        </ZoomableGroup>
                    </ComposableMap>

                    {/* Map Zoom Controls */}
                    <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                        <button onClick={handleZoomIn} className="p-2 bg-white rounded-lg shadow border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                            <ZoomIn size={20} />
                        </button>
                        <button onClick={handleZoomOut} className="p-2 bg-white rounded-lg shadow border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                            <ZoomOut size={20} />
                        </button>
                    </div>

                    {/* Simple Map Overlay Legend */}
                    {viewLevel === 0 && (
                        <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 min-w-[200px] z-10 pointer-events-none">
                            <h4 className="font-bold text-gray-800 text-sm mb-2">Instructions</h4>
                            <p className="text-xs text-gray-500">Click on any Region summarizing Customers, Suppliers, or Plants to drill down into the live operating details.</p>
                        </div>
                    )}
                </div>

                {/* Right Side Panel (Visible on Level 1 and 2) */}
                {viewLevel > 0 && (
                    <div className="w-[450px] bg-white border-l border-gray-200 overflow-y-auto flex flex-col z-20 shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.1)] slide-in-from-right">

                        {/* Level 1: Region Details */}
                        {viewLevel === 1 && (() => {
                            const parts = selectedRegion.split('_');
                            const typeStr = parts[0] === 'cust' ? 'Customers' : parts[0] === 'supp' ? 'Suppliers' : 'Entities';
                            const regName = parts[parts.length - 1];

                            return (
                                <div className="p-6">
                                    <h2 className="text-xl font-black text-gray-900 mb-6">{regName} {typeStr}</h2>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Facility Roster</h3>
                                        {sidebarEntities.map(node => (
                                            <div
                                                key={node.id}
                                                onClick={() => handleNodeClick(node)}
                                                className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex gap-4 items-center group"
                                            >
                                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white ${node.status === 'critical' ? 'bg-red-500' : node.status === 'warning' ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                                                    {node.type === 'plant' ? <Activity size={20} /> : <Package size={20} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate">{node.text}</h4>
                                                    <p className="text-xs text-gray-500 capitalize">{node.type} • {node.metrics?.Location || 'Local'}</p>
                                                </div>
                                                <div className="shrink-0 text-gray-300 group-hover:text-indigo-600 transition-colors">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Level 2: Entity Specifics */}
                        {viewLevel === 2 && selectedEntity && (
                            <div className="flex flex-col h-full">
                                <div className="p-6 bg-slate-900 text-white shrink-0">
                                    <h2 className="text-2xl font-black mb-1">{selectedEntity.text}</h2>
                                    <p className="text-slate-400 text-sm capitalize">{selectedEntity.type} • {selectedEntity.metrics?.Location || selectedEntity.region}</p>

                                    {selectedEntity.status !== 'normal' && (
                                        <div className={`mt-4 p-3 rounded-lg flex items-start gap-3 border bg-opacity-20 ${selectedEntity.status === 'critical' ? 'bg-red-500 border-red-500 text-red-100' : 'bg-amber-500 border-amber-500 text-amber-100'}`}>
                                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                            <p className="text-sm font-medium">Flagged for elevated risk or ongoing operational constraints.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex-1 overflow-auto space-y-8">
                                    {/* Shipments Section */}
                                    <section>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4 flex items-center justify-between">
                                            <span>Active Shipments</span>
                                            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">{entityDetails?.shipments?.length || 0} Transit</span>
                                        </h3>

                                        {!entityDetails ? (
                                            <div className="text-center py-6 text-gray-400 animate-pulse text-sm">Loading shipments...</div>
                                        ) : entityDetails.shipments.length === 0 ? (
                                            <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-lg border border-gray-100">No active shipments for this facility.</div>
                                        ) : (
                                            <div className="space-y-3">
                                                {entityDetails.shipments.map(s => (
                                                    <div
                                                        key={s.shipment_id}
                                                        onClick={() => handleShipmentClick(s)}
                                                        className={`p-3 border rounded-lg bg-white shadow-sm flex items-center justify-between cursor-pointer transition-all ${selectedShipment?.shipment_id === s.shipment_id ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-gray-200 hover:border-indigo-300'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                                                <Truck size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-900">{s.shipment_id}</p>
                                                                <p className="text-[10px] text-gray-500 uppercase font-semibold">{s.mode} Route</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${s.shipment_status === 'Delayed' || s.shipment_status === 'Exception' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                {s.shipment_status}
                                                            </span>
                                                            <p className="text-xs text-gray-600 mt-1">${s.cost_of_shipment?.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>

                                    {/* Orders Section (Only for Customers/Plants) */}
                                    {selectedEntity.type === 'customer' && (
                                        <section>
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4 flex items-center justify-between">
                                                <span>Recent Orders</span>
                                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">{entityDetails?.orders?.length || 0} Orders</span>
                                            </h3>

                                            {!entityDetails ? (
                                                <div className="text-center py-6 text-gray-400 animate-pulse text-sm">Loading orders...</div>
                                            ) : entityDetails.orders?.length === 0 ? (
                                                <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-lg border border-gray-100">No orders on record.</div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {entityDetails.orders?.map((o, idx) => (
                                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-800">{o.order_id}</p>
                                                                <p className="text-[10px] text-gray-400">{o.date_received}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-black text-gray-900">${o.total_value?.toLocaleString()}</p>
                                                                <p className="text-[10px] font-bold uppercase text-indigo-600">{o.order_status}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkMapScreen;
