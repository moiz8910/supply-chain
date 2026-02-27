import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, UserPlus, XCircle, Clock, AlertTriangle, MessageSquare } from 'lucide-react';

const mockTasksDetails = {
    "TSK-901": {
        id: "TSK-901",
        title: "Approve Premium Freight (EX-1042)",
        type: "Exception Approval",
        priority: "Critical",
        owner: "L. Kumar",
        due: "2 Hours",
        status: "Pending",
        details: "Authorize $120k premium for guaranteed ISO tanker capacity to maintain OTIF.",
        context: "The current route from Plant C is delayed due to severe port congestion. Air-freighting the critical components would cost $120k extra, but avoids a 14-day production halt for our Top-Tier client.",
        impact: {
            otif: "+12% Expected",
            cost: "$120k Premium",
            sla: "Maintains 98%"
        }
    },
    // Fallback task for others
    "default": {
        id: "TSK-XXX",
        title: "Standard Operational Task",
        type: "General Action",
        priority: "Medium",
        owner: "Me",
        due: "Tomorrow",
        status: "Pending",
        details: "Review and approve the standard workflow items assigned to your queue.",
        context: "This task requires manual intervention to review documentation, confirm the system flags are correct, and either approve or reject the request so the pipeline can proceed.",
        impact: {
            otif: "Neutral",
            cost: "None",
            sla: "At Risk if delayed"
        }
    }
};

const TaskDetailScreen = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();

    // In a real app, fetch task by ID from backend.
    const task = mockTasksDetails[taskId] || { ...mockTasksDetails["default"], id: taskId || "TSK-Unknown" };

    const [actionState, setActionState] = useState(null); // null, 'completed', 'cancelled', 'reassigned'

    const handleAction = (action) => {
        setActionState(action);
        setTimeout(() => {
            navigate('/tasks');
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-200 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/tasks')}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-400 tracking-wider uppercase">Task Details</span>
                            <span className="text-sm font-semibold text-gray-500">{task.id}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mt-1 leading-tight">{task.title}</h1>
                    </div>
                </div>
                <div className="flex gap-3">
                    <span className={`px-3 py-1 rounded font-bold text-sm ${task.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                            task.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {task.priority} Priority
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-auto p-8 flex justify-center">
                <div className="max-w-4xl w-full">

                    {actionState && (
                        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${actionState === 'completed' ? 'bg-green-50 border-green-200 text-green-700' :
                                actionState === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                                    'bg-blue-50 border-blue-200 text-blue-700'
                            }`}>
                            {actionState === 'completed' && <CheckCircle className="w-6 h-6" />}
                            {actionState === 'cancelled' && <XCircle className="w-6 h-6" />}
                            {actionState === 'reassigned' && <UserPlus className="w-6 h-6" />}
                            <h3 className="font-bold text-lg">
                                {actionState === 'completed' && 'Task Successfully Completed!'}
                                {actionState === 'cancelled' && 'Task Cancelled.'}
                                {actionState === 'reassigned' && 'Task Reassigned to Team Queue.'}
                            </h3>
                            <span className="ml-auto text-sm opacity-80">Returning to inbox...</span>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                        {/* Status Bar */}
                        <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex justify-between items-center text-sm font-medium text-gray-600">
                            <div className="flex gap-8">
                                <span className="flex items-center gap-2"><UserPlus size={16} className="text-gray-400" /> Owner: <span className="text-gray-900 font-bold">{task.owner}</span></span>
                                <span className="flex items-center gap-2"><Clock size={16} className="text-gray-400" /> Due: <span className="text-red-600 font-bold">{task.due}</span></span>
                                <span className="flex items-center gap-2"><AlertTriangle size={16} className="text-gray-400" /> Status: <span className="text-gray-900 font-bold">{task.status}</span></span>
                            </div>
                            <span>Type: {task.type}</span>
                        </div>

                        {/* Details */}
                        <div className="p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Situation Overview</h3>
                            <p className="text-gray-700 text-lg leading-relaxed mb-8">
                                {task.details}
                            </p>

                            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Business Context</h3>
                            <p className="text-gray-600 leading-relaxed mb-10">
                                {task.context}
                            </p>

                            {/* Impact Cards */}
                            <div className="grid grid-cols-3 gap-6 mb-10">
                                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">OTIF Impact</p>
                                    <p className="text-xl font-bold text-gray-900">{task.impact.otif}</p>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cost Implication</p>
                                    <p className="text-xl font-bold text-gray-900">{task.impact.cost}</p>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">SLA Guarantee</p>
                                    <p className="text-xl font-bold text-gray-900">{task.impact.sla}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Required Actions</h3>
                                <div className="flex gap-4">
                                    <button
                                        disabled={actionState !== null}
                                        onClick={() => handleAction('completed')}
                                        className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                    >
                                        <CheckCircle size={20} /> Complete Task
                                    </button>
                                    <button
                                        disabled={actionState !== null}
                                        onClick={() => handleAction('reassigned')}
                                        className="flex-1 py-3 bg-white text-gray-700 border border-gray-300 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                    >
                                        <UserPlus size={20} /> Reassign
                                    </button>
                                    <button
                                        disabled={actionState !== null}
                                        onClick={() => handleAction('cancelled')}
                                        className="flex-1 py-3 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                    >
                                        <XCircle size={20} /> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Bubble Context */}
                    <div className="mt-6 flex gap-4 opacity-70 hover:opacity-100 transition-opacity cursor-pointer p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Need help deciding?</h4>
                            <p className="text-sm text-gray-600">Click to ask the Supply Chain Co-Pilot to analyze the blast radius of rejecting this task.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TaskDetailScreen;
