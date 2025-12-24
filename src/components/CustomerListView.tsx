'use client';

import { Customer } from '@/lib/types';
import { ArrowLeft, User, Phone, Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { useState } from 'react';
import { CustomerCard } from './CustomerCard';

interface CustomerListViewProps {
    customers: Customer[];
    status: string;
    onBack: () => void;
}

export function CustomerListView({ customers, status, onBack }: CustomerListViewProps) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    if (selectedCustomer) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                    <Button
                        variant="outline"
                        onClick={() => setSelectedCustomer(null)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Listeye Dön
                    </Button>
                </div>
                <CustomerCard
                    initialData={selectedCustomer}
                    onSave={(updated) => {
                        setSelectedCustomer(updated);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6 mt-4 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {status} - Müşteriler
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Toplam {customers.length} müşteri
                    </p>
                </div>
                <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Geri
                </Button>
            </div>

            {customers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>Bu durumda müşteri bulunamadı.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    {/* Desktop Table */}
                    <table className="w-full hidden md:table">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Müşteri
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    İletişim
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                                    Sahip
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                                    Tarih
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    İşlem
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {customers.map((customer) => (
                                <tr
                                    key={customer.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedCustomer(customer)}
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-900">{customer.ad_soyad}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            {customer.telefon}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">
                                        {customer.sahip || '-'}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500 hidden lg:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(customer.created_at).toLocaleDateString('tr-TR')}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCustomer(customer);
                                            }}
                                        >
                                            Detay
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {customers.map((customer) => (
                            <div
                                key={customer.id}
                                className="border border-gray-200 rounded-lg p-4 active:bg-gray-50"
                                onClick={() => setSelectedCustomer(customer)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{customer.ad_soyad}</h4>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> {customer.telefon}
                                        </p>
                                    </div>
                                    <Button size="sm" variant="outline">Detay</Button>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                                    <span>{new Date(customer.created_at).toLocaleDateString('tr-TR')}</span>
                                    <span>{customer.sahip || '-'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
