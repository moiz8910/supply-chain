import React from 'react';
import { Sparkles } from 'lucide-react';

const Contributors = ({ data, kpiData }) => {



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

        </div>
    );
};

export default Contributors;
