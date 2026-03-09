import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertTriangle, ArrowRight, Filter, Search, UserPlus } from 'lucide-react';
import { getFullUrl } from '../lib/api';

const mockTasks = [
    {
        id: "TSK-901",
        title: "Approve Premium Freight (EX-1042)",
        type: "Exception Approval",
        priority: "Critical",
        owner: "L. Kumar",
        due: "2 Hours",
        status: "Pending",
        details: "Authorize $120k premium for guaranteed ISO tanker capacity to maintain OTIF."
    },
    {
        id: "TSK-902",
        title: "Review Production Schedule Shift",
        type: "S&OP Action",
        priority: "High",
        owner: "Me",
        due: "Today",
        status: "Pending",
        details: "Shift Acetic Acid production from Line 1 to Line 2 due to maintenance."
    },
    {
        id: "TSK-903",
        title: "Update Customer Delay Comm (Nhava Sheva)",
        type: "Customer Service",
        priority: "Medium",
        owner: "Me",
        due: "Tomorrow",
        status: "Pending",
        details: "Draft and send delay notices for 14 export shipments trapped in congestion."
    },
    {
        id: "TSK-904",
        title: "Review Spot Purchase Option (Methanol)",
        type: "Procurement",
        priority: "High",
        owner: "S. Gupta",
        due: "Overdue",
        status: "Pending",
        details: "Evaluate spot market rates to mitigate inbound RM delay."
    }
];

const TasksScreen = () => {
    const [filter, setFilter] = useState('All Tasks');
    const navigate = useNavigate();
    const [tasks, setTasks] = useState(mockTasks);
    const [totalTasks, setTotalTasks] = useState(24);

    useEffect(() => {
        fetch(getFullUrl('/api/tasks'))
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    const dynamicTasks = data.map(task => ({
                        id: task.id,
                        title: task.title,
                        type: task.type,
                        priority: task.priority,
                        owner: task.owner,
                        due: task.due,
                        status: task.status,
                        details: task.description
                    }));
                    setTasks([...dynamicTasks, ...mockTasks]);
                    setTotalTasks(24 + dynamicTasks.length);
                }
            })
            .catch(err => console.error("Error fetching tasks:", err));
    }, []);

    const handleTaskAction = async (taskId, action) => {
        // Optimistically update UI
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setTotalTasks(prev => prev - 1);

        if (taskId.startsWith('TSKAI-')) {
            const dbId = taskId.replace('TSKAI-', '');
            let newStatus = 'Closed';
            if (action === 'approve') newStatus = 'Approved';
            if (action === 'reject') newStatus = 'Rejected';
            if (action === 'reassign') newStatus = 'Re-assigned';

            try {
                await fetch(getFullUrl(`/api/tasks/${dbId}`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
            } catch (err) {
                console.error("Failed to update task", err);
            }
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'All Tasks') return true;
        if (filter === 'My Tasks') return task.owner === 'Me';
        if (filter === 'Team Tasks') return task.owner !== 'Me';
        return true;
    });

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-200 shrink-0 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pending Tasks List</h1>
                    <p className="text-sm text-gray-500 mt-1">Unified worklist for system-generated actions and approvals.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['All Tasks', 'My Tasks', 'Team Tasks'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-auto p-8">

                {/* Metric Summary */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pending</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{totalTasks}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Clock size={20} /></div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Critical Priority</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">5</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center"><AlertTriangle size={20} /></div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overdue Risk</p>
                            <p className="text-2xl font-bold text-orange-500 mt-1">3</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><Clock size={20} /></div>
                    </div>
                </div>

                {/* Task Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                        <div className="relative w-64">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                            <input type="text" placeholder="Search tasks..." className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-indigo-500" />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-transparent hover:bg-gray-100 rounded-lg transition-colors">
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Task Details</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Action due by</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTasks.map(task => (
                                <tr
                                    key={task.id}
                                    onClick={() => {
                                        if (task.type === 'Exception Approval' && task.title.includes('EX-')) {
                                            const match = task.title.match(/EX-\d+/);
                                            if (match) {
                                                navigate(`/exceptions/${match[0]}`);
                                                return;
                                            }
                                        }
                                        navigate(`/tasks/${task.id}`);
                                    }}
                                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <input
                                                    type="checkbox"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                                        task.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>{task.priority}</span>
                                                    <span className="text-xs font-semibold text-gray-500">{task.id}</span>
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm mb-0.5 group-hover:text-indigo-600 transition-colors cursor-pointer">{task.title}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{task.details}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{task.type}</td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-1.5 text-sm font-semibold ${task.due === 'Overdue' ? 'text-red-600' :
                                            task.due.includes('Hours') ? 'text-orange-500' : 'text-gray-600'
                                            }`}>
                                            <Clock size={14} /> {task.due}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div
                                            className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button onClick={() => handleTaskAction(task.id, 'approve')} title="Accept / Approve" className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"><CheckCircle size={18} /></button>
                                            <button onClick={() => handleTaskAction(task.id, 'reject')} title="Reject" className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><XCircle size={18} /></button>
                                            <button onClick={() => handleTaskAction(task.id, 'reassign')} title="Re-assign" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><UserPlus size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TasksScreen;
