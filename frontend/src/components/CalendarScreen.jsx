import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    ChevronLeft, ChevronRight, Bell, AlertTriangle,
    Users, FileText, Link2, CheckSquare, Plus,
    Calendar, Clock, Tag, X, ExternalLink,
    RefreshCw, Package, Truck, BarChart2, Settings2, Loader2, Sparkles
} from 'lucide-react';
import { getFullUrl } from '../lib/api';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: 'planning', label: 'Planning Cadence', color: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-300', dot: '#6366f1' },
    { id: 'plant', label: 'Plant Operations', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', dot: '#10b981' },
    { id: 'logistics', label: 'Logistics Milestones', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', dot: '#f59e0b' },
    { id: 'governance', label: 'Governance / Reviews', color: 'bg-violet-500', text: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-300', dot: '#8b5cf6' },
];

const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];

// ─── Add Event Modal ───────────────────────────────────────────────────────────
const HOURS_LIST = Array.from({ length: 15 }, (_, i) => i + 6);
const DURATION_OPTIONS = [0.5, 1, 1.5, 2, 3, 4, 6, 8];

const AddEventModal = ({ onClose, onSaved, defaultDate }) => {
    const today = defaultDate || new Date().toISOString().slice(0, 10);
    const [form, setForm] = useState({
        category: 'planning',
        title: '',
        date: today,
        startHour: 9,
        duration: 1,
        owner: '',
        participants: '',
        decisions: '',
        agenda: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.date) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(getFullUrl('/api/calendar/events'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    startHour: Number(form.startHour),
                    duration: Number(form.duration),
                    participants: form.participants.split(',').map(p => p.trim()).filter(Boolean),
                    attachments: [],
                    linkedData: [],
                }),
            });
            if (!res.ok) throw new Error('Failed to save event');
            onSaved();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const cat = getCat(form.category);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`px-6 py-5 ${cat.bg} border-b ${cat.border} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center shadow-sm`}>
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-base">Add Calendar Event</h2>
                            <p className="text-xs text-gray-500">Event will be saved to the operational calendar</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map(c => (
                                <button type="button" key={c.id} onClick={() => set('category', c.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${form.category === c.id ? `${c.bg} ${c.text} ${c.border} ring-2 ring-offset-1` : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                                    style={{ '--tw-ring-color': c.dot }}>
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Event Title *</label>
                        <input required value={form.title} onChange={e => set('title', e.target.value)}
                            placeholder="e.g. S&OP Review Meeting, MRP Release, Shipment ETD..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400" />
                    </div>

                    {/* Date + Time + Duration */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-3 sm:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date *</label>
                            <input required type="date" value={form.date} onChange={e => set('date', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Time</label>
                            <select value={form.startHour} onChange={e => set('startHour', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                {HOURS_LIST.map(h => (
                                    <option key={h} value={h}>{h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Duration</label>
                            <select value={form.duration} onChange={e => set('duration', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                {DURATION_OPTIONS.map(d => (
                                    <option key={d} value={d}>{d < 1 ? '30 min' : `${d} hr${d > 1 ? 's' : ''}`}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Owner */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Owner / Lead</label>
                        <input value={form.owner} onChange={e => set('owner', e.target.value)}
                            placeholder="e.g. Alan Wong"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400" />
                    </div>

                    {/* Participants */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Participants <span className="font-normal normal-case text-gray-400">(comma-separated)</span></label>
                        <input value={form.participants} onChange={e => set('participants', e.target.value)}
                            placeholder="e.g. Alan Wong, Julia Roberts, Logistics Team"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400" />
                    </div>

                    {/* Agenda */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Agenda</label>
                        <textarea value={form.agenda} onChange={e => set('agenda', e.target.value)}
                            rows={2} placeholder="What will be discussed?"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400 resize-none" />
                    </div>

                    {/* Decisions */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Decisions Required</label>
                        <textarea value={form.decisions} onChange={e => set('decisions', e.target.value)}
                            rows={2} placeholder="What decisions need to be made?"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400 resize-none" />
                    </div>

                    {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving || !form.title.trim()}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Plus size={14} /> Save Event</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM

function getWeekDates(refDate) {
    const d = new Date(refDate);
    const day = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - day);
    return Array.from({ length: 6 }, (_, i) => {
        const dd = new Date(sunday);
        dd.setDate(sunday.getDate() + i);
        return dd;
    });
}

function toDateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatMonthYear(d) {
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Event Detail Panel ────────────────────────────────────────────────────────
const EventDetailPanel = ({ event, onClose }) => {
    const cat = getCat(event.category);
    return (
        <div className="w-[340px] shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-xl z-10 animate-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className={`px-5 py-4 ${cat.bg} border-b ${cat.border} flex items-start justify-between gap-3`}>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${cat.text} px-2 py-0.5 rounded-full ${cat.bg} border ${cat.border}`}>
                            {cat.label}
                        </span>
                    </div>
                    <h2 className="font-bold text-gray-900 text-base leading-snug">{event.title}</h2>
                    <p className={`text-xs font-medium mt-1 ${cat.text}`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {event.startHour}:00 – {event.startHour + event.duration}:00
                    </p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-700 mt-0.5 shrink-0"><X size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Owner */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {event.owner.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm">{event.owner}</p>
                        <p className="text-xs text-gray-500">Owner · Global</p>
                    </div>
                </div>

                {/* Participants */}
                {event.participants?.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Users size={11} /> Participants</p>
                        <div className="flex flex-wrap gap-1.5">
                            {event.participants.map((p, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-700 font-medium px-2 py-1 rounded-full">{p}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Decisions Required */}
                {event.decisions && (
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckSquare size={11} /> Decisions Required</p>
                        <p className="text-sm text-gray-700 leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-3">{event.decisions}</p>
                    </div>
                )}

                {/* Agenda */}
                {event.agenda && (
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText size={11} /> Agenda</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{event.agenda}</p>
                    </div>
                )}

                {/* Linked Data Objects */}
                {event.linkedData?.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Link2 size={11} /> Linked Data Objects</p>
                        <div className="space-y-1.5">
                            {event.linkedData.map((l, i) => (
                                <button key={i} className="w-full flex items-center justify-between text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-2 rounded-lg transition-colors">
                                    {l} <ExternalLink size={11} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Attachments */}
                {event.attachments?.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText size={11} /> Attachments</p>
                        <div className="space-y-1.5">
                            {event.attachments.map((a, i) => (
                                <button key={i} className="w-full flex items-center gap-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg transition-colors">
                                    <FileText size={11} className="text-gray-400 shrink-0" /> {a}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50/50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        <FileText size={12} /> Create Meeting Pack
                    </button>
                    <button className="flex items-center justify-center gap-1.5 text-xs font-bold bg-white border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <RefreshCw size={12} /> Trigger Replan
                    </button>
                </div>
                <button className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
                    <ExternalLink size={12} /> Open Impacted Tasks / Exceptions
                </button>
            </div>
        </div>
    );
};

// ─── Month View ────────────────────────────────────────────────────────────────
const MonthView = ({ refDate, activeCategories, onSelectEvent, events }) => {
    const year = refDate.getFullYear();
    const month = refDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = toDateStr(new Date());

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-6 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                {WEEK_DAYS.map(d => (
                    <div key={d} className="bg-gray-50 text-xs font-bold text-gray-500 text-center py-2 uppercase">{d}</div>
                ))}
                {cells.map((day, i) => {
                    const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                    const dayEvents = dateStr ? events.filter(e => e.date === dateStr && activeCategories.includes(e.category)) : [];
                    const isToday = dateStr === today;
                    return (
                        <div key={i} className={`bg-white min-h-[100px] p-2 ${!day ? 'opacity-0 pointer-events-none' : ''}`}>
                            <span className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>{day}</span>
                            <div className="mt-1 space-y-0.5">
                                {dayEvents.slice(0, 3).map(ev => {
                                    const cat = getCat(ev.category);
                                    return (
                                        <button key={ev.id} onClick={() => onSelectEvent(ev)}
                                            className={`w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded truncate ${cat.bg} ${cat.text} hover:opacity-80 transition-opacity`}>
                                            {ev.title}
                                        </button>
                                    );
                                })}
                                {dayEvents.length > 3 && <p className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 3} more</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Week View ─────────────────────────────────────────────────────────────────
const WeekView = ({ weekDates, activeCategories, onSelectEvent, selectedEvent, events }) => {
    const todayStr = toDateStr(new Date());
    const HOUR_HEIGHT = 64; // px per hour

    return (
        <div className="flex-1 overflow-auto">
            {/* Day headers */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 grid grid-cols-[72px_repeat(6,1fr)]">
                <div className="border-r border-gray-100" />
                {weekDates.map((d, i) => {
                    const ds = toDateStr(d);
                    const isToday = ds === todayStr;
                    return (
                        <div key={i} className={`text-center py-3 border-r border-gray-100 last:border-0 ${isToday ? 'bg-indigo-50/60' : ''}`}>
                            <p className="text-xs font-semibold text-gray-500 uppercase">{WEEK_DAYS[i]}</p>
                            <p className={`text-xl font-black mt-0.5 w-9 h-9 rounded-full mx-auto flex items-center justify-center ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-800'}`}>{d.getDate()}</p>
                        </div>
                    );
                })}
            </div>

            {/* Time grid */}
            <div className="relative grid grid-cols-[72px_repeat(6,1fr)]">
                {/* Hour labels */}
                <div>
                    {HOURS.map(h => (
                        <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b border-gray-100 flex items-start justify-end pr-3 pt-1">
                            <span className="text-[11px] font-semibold text-gray-400">{h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}</span>
                        </div>
                    ))}
                </div>

                {/* Day columns */}
                {weekDates.map((d, colIdx) => {
                    const ds = toDateStr(d);
                    const isToday = ds === todayStr;
                    const dayEvents = events.filter(e => e.date === ds && activeCategories.includes(e.category));

                    return (
                        <div key={colIdx} className={`relative border-r border-gray-100 last:border-0 ${isToday ? 'bg-indigo-50/20' : ''}`}>
                            {/* Hour lines */}
                            {HOURS.map(h => (
                                <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b border-gray-100" />
                            ))}

                            {/* Events */}
                            {dayEvents.map(ev => {
                                const cat = getCat(ev.category);
                                const top = (ev.startHour - HOURS[0]) * HOUR_HEIGHT;
                                const height = Math.max(ev.duration * HOUR_HEIGHT - 4, 24);
                                const isSelected = selectedEvent?.id === ev.id;
                                return (
                                    <button
                                        key={ev.id}
                                        onClick={() => onSelectEvent(ev)}
                                        style={{ top: top + 2, height, left: 2, right: 2, position: 'absolute', borderLeftColor: cat.dot }}
                                        className={`rounded-lg px-2 py-1 text-left overflow-hidden transition-all border-l-[3px] ${cat.bg} ${cat.text} hover:opacity-90 hover:shadow-md ${isSelected ? 'ring-2 ring-indigo-400 ring-offset-1 shadow-md' : 'shadow-sm'}`}
                                    >
                                        <p className="text-[11px] font-bold leading-tight truncate">{ev.title}</p>
                                        {height > 36 && <p className="text-[10px] opacity-70 mt-0.5">{ev.owner}</p>}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Day View ──────────────────────────────────────────────────────────────────
const DayView = ({ refDate, activeCategories, onSelectEvent, selectedEvent, events }) => {
    const ds = toDateStr(refDate);
    const dayEvents = events.filter(e => e.date === ds && activeCategories.includes(e.category));
    const HOUR_HEIGHT = 72;

    return (
        <div className="flex-1 overflow-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3">
                <p className="font-bold text-gray-900">{refDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-xs text-gray-500">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled</p>
            </div>
            <div className="relative grid grid-cols-[72px_1fr]">
                <div>
                    {HOURS.map(h => (
                        <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b border-gray-100 flex items-start justify-end pr-3 pt-1">
                            <span className="text-[11px] font-semibold text-gray-400">{h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}</span>
                        </div>
                    ))}
                </div>
                <div className="relative border-l border-gray-100">
                    {HOURS.map(h => <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b border-gray-100" />)}
                    {dayEvents.map(ev => {
                        const cat = getCat(ev.category);
                        const top = (ev.startHour - HOURS[0]) * HOUR_HEIGHT;
                        const height = Math.max(ev.duration * HOUR_HEIGHT - 4, 32);
                        const isSelected = selectedEvent?.id === ev.id;
                        return (
                            <button key={ev.id} onClick={() => onSelectEvent(ev)}
                                style={{ top: top + 2, height, left: 8, right: 8, borderLeftColor: cat.dot }}
                                className={`absolute rounded-xl px-4 py-2 text-left overflow-hidden border-l-4 ${cat.bg} ${cat.text} hover:opacity-90 hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-indigo-400 shadow-md' : 'shadow-sm'}`}>
                                <p className="font-bold text-sm leading-tight">{ev.title}</p>
                                {height > 48 && <p className="text-xs opacity-70 mt-1">{ev.startHour}:00 – {ev.startHour + ev.duration}:00 · {ev.owner}</p>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ─── Main Calendar Screen ──────────────────────────────────────────────────────
const CalendarScreen = () => {
    const [view, setView] = useState('week');
    const [refDate, setRefDate] = useState(new Date());
    const [activeCategories, setActiveCategories] = useState(CATEGORIES.map(c => c.id));
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showAlerts, setShowAlerts] = useState(true);
    const [scope, setScope] = useState('Global / Plant 5');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchEvents = useCallback(() => {
        setLoading(true);
        fetch(getFullUrl('/api/calendar/events'))
            .then(r => r.json())
            .then(data => { setEvents(data); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const weekDates = useMemo(() => getWeekDates(refDate), [refDate]);

    const navigate = (dir) => {
        const d = new Date(refDate);
        if (view === 'week') d.setDate(d.getDate() + dir * 7);
        else if (view === 'month') d.setMonth(d.getMonth() + dir);
        else d.setDate(d.getDate() + dir);
        setRefDate(d);
    };

    const toggleCategory = (id) => {
        setActiveCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const headerTitle = view === 'month'
        ? formatMonthYear(refDate)
        : view === 'week'
            ? `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDates[5].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            : refDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const openExceptions = events.filter(e => e.category === 'governance' && activeCategories.includes('governance')).length;

    return (
        <div className="h-full flex flex-col bg-gray-50">

            {/* ── Top Header ─────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-lg font-black text-gray-900">Operations Calendar</h1>
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-bold">
                            {['month', 'week', 'day'].map(v => (
                                <button key={v} onClick={() => setView(v)}
                                    className={`px-3 py-1.5 rounded-md capitalize transition-all ${view === v ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Nav */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"><ChevronLeft size={16} /></button>
                            <span className="text-sm font-semibold text-gray-700 min-w-[200px] text-center">{headerTitle}</span>
                            <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"><ChevronRight size={16} /></button>
                            <button onClick={() => setRefDate(new Date())} className="px-2.5 py-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">Today</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Scope */}
                        <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors">
                            <Settings2 size={12} />
                            Scope: {scope}
                        </div>
                        {/* Alerts badge */}
                        <button onClick={() => setShowAlerts(!showAlerts)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${showAlerts ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600'}`}>
                            <Bell size={13} />
                            {openExceptions} Open Exceptions
                        </button>
                        <button onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm shadow-indigo-200">
                            <Plus size={13} /> Add Event
                        </button>
                    </div>
                </div>

                {/* ── Category Filters ──────────────────────────────────── */}
                <div className="flex items-center gap-2 flex-wrap">
                    {CATEGORIES.map(cat => {
                        const active = activeCategories.includes(cat.id);
                        return (
                            <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${active ? `${cat.bg} ${cat.text} ${cat.border}` : 'bg-white text-gray-400 border-gray-200 opacity-60'}`}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: active ? cat.dot : '#d1d5db' }} />
                                {cat.label}
                            </button>
                        );
                    })}

                    {/* Alerts toggle */}
                    {showAlerts && (
                        <div className="ml-auto flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold animate-in fade-in">
                            <AlertTriangle size={12} />
                            <span>Conflict detected: Shipment #A04032 ETA overlaps with dock capacity window on Mar 22</span>
                            <button onClick={() => setShowAlerts(false)} className="ml-1 text-amber-500 hover:text-amber-700"><X size={12} /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Body ───────────────────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">

                {/* Calendar View */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {view === 'week' && (
                        <WeekView
                            weekDates={weekDates}
                            activeCategories={activeCategories}
                            onSelectEvent={setSelectedEvent}
                            selectedEvent={selectedEvent}
                            events={events}
                        />
                    )}
                    {view === 'month' && (
                        <MonthView
                            refDate={refDate}
                            activeCategories={activeCategories}
                            onSelectEvent={setSelectedEvent}
                            events={events}
                        />
                    )}
                    {view === 'day' && (
                        <DayView
                            refDate={refDate}
                            activeCategories={activeCategories}
                            onSelectEvent={setSelectedEvent}
                            selectedEvent={selectedEvent}
                            events={events}
                        />
                    )}
                </div>

                {/* Event Detail Panel */}
                {selectedEvent && (
                    <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
                )}
            </div>

            {/* Pending Tasks Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-2.5 flex items-center justify-between text-xs text-gray-500 shrink-0">
                <span className="font-medium">{events.filter(e => e.category === 'planning').length} Planning Events · {events.filter(e => e.category === 'logistics').length} Logistics Milestones{loading ? ' · Loading...' : ''}</span>
                <div className="flex items-center gap-4">
                    <button className="text-gray-400 hover:text-indigo-600 font-semibold flex items-center gap-1"><ChevronLeft size={12} /> Previous</button>
                    <span className="text-gray-400">Page 1 of 1</span>
                    <button className="text-gray-400 hover:text-indigo-600 font-semibold flex items-center gap-1">Next <ChevronRight size={12} /></button>
                </div>
            </div>

            {/* Add Event Modal */}
            {showAddModal && (
                <AddEventModal
                    onClose={() => setShowAddModal(false)}
                    onSaved={fetchEvents}
                    defaultDate={toDateStr(refDate)}
                />
            )}
        </div>
    );
};

export default CalendarScreen;
