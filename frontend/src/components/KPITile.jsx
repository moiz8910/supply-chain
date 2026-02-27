import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

const KPITile = ({ title, value, unit, target, status, trend, delta, isSelected, onClick }) => {
    const isPositive = delta?.includes('+');
    const isNegative = delta?.includes('-');

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col justify-between h-28 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer ${isSelected ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/10' : 'border-gray-100'
                }`}
        >
            <div className="relative z-10">
                <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">{title}</h3>

                <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gray-900">{value}</span>
                    {unit && <span className="text-sm text-gray-500 font-medium">{unit}</span>}

                    <div className={cn("flex items-center text-xs font-bold ml-1 px-1.5 py-0.5 rounded-full bg-gray-50",
                        isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-500")}>
                        {isPositive ? <ArrowUp size={12} className="mr-0.5" /> : isNegative ? <ArrowDown size={12} className="mr-0.5" /> : null}
                        {delta}
                    </div>
                </div>

                <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{target}</p>
            </div>

        </div>
    );
};

export default KPITile;
