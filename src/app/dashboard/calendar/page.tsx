'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { CustomerCard } from '@/components/CustomerCard';
import { Customer } from '@/lib/types';

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    customer: Customer;
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/calendar');
            const data = await res.json();
            if (data.events) {
                setEvents(data.events);
            }
        } catch (error) {
            console.error('Failed to fetch calendar events', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Calendar Calculations
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Padding days for grid
    const startDayOfWeek = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1; // Mon=0, Sun=6 adjustment (standard JS Sun=0)
    // Actually standard JS: Sun=0, Mon=1...
    // Let's standardise to Mon start: 
    // If Sun(0) -> 6 empty slots. Mon(1) -> 0 empty slots.
    const paddingDays = Array.from({ length: startDayOfWeek === -1 ? 6 : (monthStart.getDay() + 6) % 7 }).fill(null);

    const dayHasEvents = (day: Date) => {
        return events.filter(e => isSameDay(parseISO(e.start), day));
    };

    const selectedDayEvents = events.filter(e => isSameDay(parseISO(e.start), selectedDate));

    return (
        <div className="p-6 md:p-8 min-h-screen bg-gray-50 flex gap-6 flex-col lg:flex-row">

            {/* MAIN CALENDAR AREA */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <CalendarIcon className="w-6 h-6 text-indigo-600" />
                        {format(currentDate, 'MMMM yyyy', { locale: tr })}
                    </h1>
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                            className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 py-2 text-sm font-medium hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-700"
                        >
                            Bugün
                        </button>
                        <button
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                    {['Paz', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, i) => (
                        <div key={i} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-100 gap-[1px] border-b border-gray-200">
                        {/* Empty Slots */}
                        {paddingDays.map((_, i) => (
                            <div key={`pad-${i}`} className="bg-white/50 min-h-[120px]"></div>
                        ))}

                        {/* Days */}
                        {daysInMonth.map((day) => {
                            const dayEvents = dayHasEvents(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);

                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        bg-white min-h-[120px] p-2 relative group cursor-pointer transition-colors
                                        ${isSelected ? 'bg-indigo-50 ring-2 ring-indigo-500 ring-inset z-10' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`
                                            w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                                            ${isTodayDate ? 'bg-indigo-600 text-white' : 'text-gray-700'}
                                            ${isSelected && !isTodayDate ? 'bg-indigo-100 text-indigo-700' : ''}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">
                                                {dayEvents.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Event Dots/Bars */}
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map((ev) => (
                                            <div key={ev.id} className="text-[10px] px-1.5 py-1 rounded bg-indigo-100 text-indigo-800 truncate border border-indigo-200 font-medium">
                                                {format(parseISO(ev.start), 'HH:mm')} {ev.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div className="text-[10px] text-gray-400 pl-1">
                                                +{dayEvents.length - 3} daha...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* SIDEBAR: Selected Day Details */}
            <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-4rem)] lg:h-auto lg:max-h-[calc(100vh-4rem)] sticky top-24">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">
                        {format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr })}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {selectedDayEvents.length} Randevu Görünüyor
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedDayEvents.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                <Clock className="w-8 h-8 text-gray-300" />
                            </div>
                            <p>Bu tarihte planlanmış randevu yok.</p>
                        </div>
                    ) : (
                        selectedDayEvents
                            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                            .map((ev) => (
                                <div
                                    key={ev.id}
                                    onClick={() => setSelectedEvent(ev)}
                                    className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                                            {ev.title}
                                        </h3>
                                        <span className="text-sm font-mono font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                            {format(parseISO(ev.start), 'HH:mm')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <Phone className="w-3 h-3" />
                                        {ev.customer.telefon}
                                    </div>
                                    {ev.customer.arama_not_kisa && (
                                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded italic border border-gray-100">
                                            "{ev.customer.arama_not_kisa}"
                                        </div>
                                    )}
                                </div>
                            ))
                    )}
                </div>
            </div>

            {/* EDIT MODAL */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex justify-center items-start bg-black/60 backdrop-blur-sm overflow-y-auto pt-10 pb-10 px-4">
                    {/* Fixed Close Button - Always visible */}
                    <button
                        onClick={() => setSelectedEvent(null)}
                        className="fixed top-4 right-4 z-[60] bg-white text-gray-800 hover:bg-gray-100 p-2 rounded-full shadow-lg transition-all border border-gray-200"
                        title="Kapat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    <div className="w-full max-w-4xl relative">
                        {/* Wrapper to ensure CustomerCard creates a new stacking context if needed, though mostly fine */}
                        <CustomerCard
                            initialData={selectedEvent.customer}
                            onSave={() => {
                                setSelectedEvent(null);
                                fetchEvents(); // Refresh calendar
                            }}
                        />
                    </div>
                </div>
            )}

        </div>
    );
}
