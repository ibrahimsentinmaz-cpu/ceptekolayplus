'use client';

import { useEffect, useState } from 'react';
import {
    Phone,
    Calendar,
    FileCheck,
    UserCheck,
    Package,
    RefreshCcw,
    TrendingUp
} from 'lucide-react';

interface Stats {
    available: number;
    waiting_new: number;
    waiting_scheduled: number;
    waiting_retry: number;
    pending_approval: number;
    waiting_guarantor: number;
    delivered: number;
}

export function DashboardStats() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/leads/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading || !stats) {
        return (
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Aranacak',
            count: stats.available, // This includes new + retry
            icon: Phone,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            desc: `${stats.waiting_new} Yeni, ${stats.waiting_retry} Tekrar`,
        },
        {
            title: 'Randevulu',
            count: stats.waiting_scheduled,
            icon: Calendar,
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            desc: 'Daha sonra aranmak istenenler'
        },
        {
            title: 'Onay Bekleyen',
            count: stats.pending_approval,
            icon: FileCheck,
            color: 'bg-orange-500',
            textColor: 'text-orange-600',
            bgColor: 'bg-orange-50',
            desc: 'Yönetici onayı bekliyor'
        },
        {
            title: 'Kefil Bekleyen',
            count: stats.waiting_guarantor,
            icon: UserCheck,
            color: 'bg-yellow-500',
            textColor: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            desc: 'Kefil bilgisi bekleniyor'
        },
        {
            title: 'Teslim Edilen',
            count: stats.delivered,
            icon: Package,
            color: 'bg-green-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50',
            desc: 'Başarıyla tamamlanan'
        }
    ];

    // Simple Bar Chart scaling
    const maxVal = Math.max(
        stats.available,
        stats.waiting_scheduled,
        stats.pending_approval,
        stats.waiting_guarantor,
        stats.delivered,
        10 // Minimum scale
    );

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-gray-600" />
                    Genel Durum Özeti
                </h2>
                <button
                    onClick={fetchStats}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
                    title="Yenile"
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {cards.map((card, idx) => (
                    <div key={idx} className={`${card.bgColor} rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                <h3 className={`text-2xl font-bold mt-1 ${card.textColor}`}>{card.count}</h3>
                            </div>
                            <div className={`p-2 rounded-lg bg-white/60 ${card.textColor}`}>
                                <card.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 truncate font-medium">
                            {card.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* Simple Visual Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-6">İşlem Hacmi Dağılımı</h3>
                {/* Parent: Fixed height, align items to stretch so children know their height */}
                <div className="flex items-end justify-between h-40 gap-2 md:gap-8">
                    {cards.map((card, idx) => {
                        const heightPercent = maxVal > 0 ? Math.max((card.count / maxVal) * 100, 5) : 5;
                        return (
                            // Column: Full height relative to parent, align content to bottom
                            <div key={idx} className="flex flex-col items-center flex-1 group h-full justify-end">
                                <div className="relative w-full flex flex-col items-center justify-end h-full">
                                    <div
                                        className={`w-full max-w-[60px] rounded-t-lg transition-all duration-500 group-hover:opacity-80 ${card.color}`}
                                        style={{ height: `${heightPercent}%` }}
                                    ></div>
                                    <span className="absolute -top-6 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {card.count}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500 mt-3 font-medium text-center truncate w-full">
                                    {card.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
