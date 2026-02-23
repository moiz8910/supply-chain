import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

const KPITile = ({ title, value, unit, target, status, trend, delta }) => {
    const isPositive = delta?.includes('+');
    const isNegative = delta?.includes('-');

    // Colors based on Status (Good/Bad) match design (Green/Red/Amber)
    const colors = {
        success: { text: 'text-green-700', stroke: '#15803d', fill: '#dcfce7' },
        warning: { text: 'text-yellow-600', stroke: '#ca8a04', fill: '#fef9c3' },
        error: { text: 'text-red-600', stroke: '#dc2626', fill: '#fee2e2' },
    };

    const theme = colors[status] || colors.warning;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="relative z-10">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>

                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{value}</span>
                    {unit && <span className="text-sm text-gray-500 font-medium">{unit}</span>}

                    <div className={cn("flex items-center text-xs font-bold ml-1 px-1.5 py-0.5 rounded-full bg-gray-50",
                        isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-500")}>
                        {isPositive ? <ArrowUp size={12} className="mr-0.5" /> : isNegative ? <ArrowDown size={12} className="mr-0.5" /> : null}
                        {delta}
                    </div>
                </div>

                <p className="text-xs text-gray-400 mt-1 font-medium">{target}</p>
            </div>

            {/* Sparkline at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-50 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend}>
                        <defs>
                            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={theme.stroke} stopOpacity={0.2} />
                                <stop offset="100%" stopColor={theme.stroke} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={theme.stroke}
                            strokeWidth={2}
                            fill={`url(#grad-${title})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default KPITile;
