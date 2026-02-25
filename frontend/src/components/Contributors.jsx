import React from 'react';
import { Sparkles } from 'lucide-react';

const Contributors = ({ data, kpiData }) => {

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

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col relative overflow-hidden">
            <h3 className="text-gray-500 font-medium mb-4 text-sm uppercase tracking-wider">Top Contributors</h3>
            <div className="space-y-4 flex-1">
                {data?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-gray-700 font-medium text-sm">{item.name}</span>
                        <span className={`font-bold text-sm ${item.type === 'negative' ? 'text-red-500' : 'text-green-500'}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100 bg-indigo-50/50 -mx-6 -mb-6 p-6">
                <h4 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI Causal Analysis
                </h4>
                <p className="text-sm text-indigo-800/80 leading-relaxed font-medium">
                    {renderExplanation(kpiData)}
                </p>
            </div>
        </div>
    );
};

export default Contributors;
