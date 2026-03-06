import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MainChart = ({ data, title, kpiId }) => {

    // All timely trends are line/area charts. Only categorical breakdowns get Bar Charts.
    const isCategorical = title && !title.includes('Trend');
    const isBarChart = isCategorical || title?.includes('by Supplier') || title?.includes('by RM Category');

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
                    <p className="font-semibold text-gray-700 text-sm mb-1">{label}</p>
                    <p className="text-indigo-600 font-bold text-sm">
                        {typeof payload[0].value === 'number' ? parseFloat(payload[0].value).toFixed(1) : payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-gray-700 font-semibold text-lg">{title}</h3>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    {isBarChart ? (
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                dy={10}
                                tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                            <Bar dataKey="Accuracy" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    ) : (
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ca8a04" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                dy={10}
                                tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
                            <Area type="monotone" dataKey="Accuracy" stroke="#ca8a04" strokeWidth={2} fillOpacity={1} fill="url(#colorAccuracy)" />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MainChart;
