import React from 'react';

const Contributors = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
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
            <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-gray-700 font-semibold mb-2">What Changed! &gt;&gt;</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Forecast accuracy declined 3.1% WoW. Increased demand volatility and supplier delays impacted results.
                    Data discrepancies identified in the forecasting system.
                </p>
            </div>
        </div>
    );
};

export default Contributors;
