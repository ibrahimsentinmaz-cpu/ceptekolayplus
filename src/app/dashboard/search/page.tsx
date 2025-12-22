'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Loader2, Calendar, Phone, Clock, User, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SearchResult {
    id: string;
    ad_soyad: string;
    tc_kimlik: string;
    telefon: string;
    durum: string;
    created_at?: string;
    updated_at?: string;
    sahip?: string;

    // Call Details
    cekilme_zamani?: string;
    son_arama_zamani?: string;
    sonraki_arama_zamani?: string;

    // Product Details
    talep_edilen_urun?: string;
    talep_edilen_tutar?: number;
    basvuru_kanali?: string;

    // Notes
    arama_not_kisa?: string;
    aciklama_uzun?: string;

    // Admin
    onay_durumu?: string;
    admin_notu?: string;
    kredi_limiti?: string;
}

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query || query.length < 2) {
            setError('En az 2 karakter giriniz.');
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);
        setSelectedResult(null);
        setSearched(false);

        try {
            const res = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
            const json = await res.json();

            if (json.success) {
                if (json.customers && json.customers.length > 0) {
                    setResults(json.customers);
                    if (json.customers.length === 1) {
                        setSelectedResult(json.customers[0]);
                    }
                }
                setSearched(true);
            } else {
                setError(json.message || 'Bir hata oluştu.');
            }
        } catch (err) {
            setError('Bağlantı hatası.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d?: string) => {
        if (!d) return '-';
        try {
            return format(new Date(d), 'd MMMM yyyy HH:mm', { locale: tr });
        } catch {
            return d;
        }
    };

    const getStatusColor = (status: string) => {
        if (['Onaylandı', 'Satış yapıldı/Tamamlandı', 'Teslim edildi'].includes(status)) return 'text-green-600 bg-green-50 border-green-200';
        if (['Reddedildi', 'Reddetti', 'İptal/Vazgeçti'].includes(status)) return 'text-red-600 bg-red-50 border-red-200';
        if (['Kefil bekleniyor', 'Kefil İstendi', 'Onaya gönderildi'].includes(status)) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-blue-600 bg-blue-50 border-blue-200';
    };

    const handleBackToList = () => {
        setSelectedResult(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
            <h1 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                <Search className="w-6 h-6 text-indigo-600" />
                Müşteri Sorgulama
            </h1>

            {/* Search Box */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Arama (İsim, Telefon veya TC)
                        </label>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ad Soyad, Telefon veya TC giriniz"
                            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <Button type="submit" isLoading={loading} size="lg" className="h-[52px] px-8 text-lg">
                        Sorgula
                    </Button>
                </form>
                {error && <p className="mt-3 text-red-600 bg-red-50 p-2 rounded">{error}</p>}
            </div>

            {/* No Result State */}
            {searched && results.length === 0 && !error && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Kayıt Bulunamadı</h3>
                    <p className="text-gray-500">Aramanızla eşleşen müşteri bulunamadı.</p>
                </div>
            )}

            {/* Results List */}
            {searched && results.length > 1 && !selectedResult && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">{results.length} Kayıt Bulundu</h3>
                        <span className="text-xs text-gray-500">Detay için seçiniz</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {results.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedResult(item)}
                                className="p-4 hover:bg-indigo-50 cursor-pointer transition-colors flex justify-between items-center group"
                            >
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-700">{item.ad_soyad || 'İsimsiz'}</h4>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span>{item.telefon}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span>{item.tc_kimlik}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(item.durum)}`}>{item.durum}</span>
                                    <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm">Seç &rarr;</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detail View */}
            {selectedResult && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Back Button if came from list */}
                    {results.length > 1 && (
                        <div className="p-4 pb-0">
                            <button onClick={handleBackToList} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                                &larr; Listeye Dön
                            </button>
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedResult.ad_soyad}</h2>

                                {/* 1. General Status */}
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold border bg-white border-gray-200 text-gray-700`}>
                                    {selectedResult.durum}
                                </span>

                                {/* 2. Admin Approval Status (If exists) */}
                                {(selectedResult.onay_durumu) && (
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedResult.onay_durumu)}`}>
                                        {selectedResult.onay_durumu}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-500 flex items-center gap-2">
                                <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-xs text-gray-700">ID: {selectedResult.id.slice(0, 8)}</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-sm">Oluşturma: {formatDate(selectedResult.created_at)}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Son İşlem</p>
                            <p className="font-medium text-gray-900">{formatDate(selectedResult.updated_at)}</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Left Column: Application Details */}
                        <div className="space-y-6">
                            <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                                <h3 className="text-sm font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Başvuru Detayları
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-indigo-100 pb-2">
                                        <span className="text-gray-600">TC Kimlik</span>
                                        <span className="font-medium text-gray-900">{selectedResult.tc_kimlik}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-indigo-100 pb-2">
                                        <span className="text-gray-600">Telefon</span>
                                        <span className="font-medium text-gray-900">{selectedResult.telefon}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-indigo-100 pb-2">
                                        <span className="text-gray-600">Talep Edilen Ürün</span>
                                        <span className="font-medium text-gray-900">{selectedResult.talep_edilen_urun || '-'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-indigo-100 pb-2">
                                        <span className="text-gray-600">Talep Tutarı</span>
                                        <span className="font-medium text-gray-900">
                                            {selectedResult.talep_edilen_tutar ? `${selectedResult.talep_edilen_tutar.toLocaleString('tr-TR')} ₺` : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Kanal</span>
                                        <span className="font-medium text-gray-900">{selectedResult.basvuru_kanali || 'Bilinmiyor'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Temsilci Notları
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">İlgilenen Temsilci</p>
                                        <p className="font-medium text-gray-900 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            {selectedResult.sahip || 'Henüz atanmadı'}
                                        </p>
                                    </div>
                                    {(selectedResult.arama_not_kisa || selectedResult.aciklama_uzun) ? (
                                        <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-700 italic">
                                            "{selectedResult.arama_not_kisa || selectedResult.aciklama_uzun}"
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Henüz not girilmemiş.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Interaction & Status */}
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-500" /> Zaman Çizelgesi & İletişim
                                </h3>
                                <div className="space-y-4 relative pl-4 border-l-2 border-gray-100">
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                                        <p className="text-xs text-gray-500">Çekilme / Aranma Zamanı</p>
                                        <p className="font-medium text-gray-900">{formatDate(selectedResult.cekilme_zamani)}</p>
                                    </div>
                                    <div className="relative">
                                        <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${selectedResult.son_arama_zamani ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <p className="text-xs text-gray-500">Son Başarılı Arama</p>
                                        <p className="font-medium text-gray-900">{formatDate(selectedResult.son_arama_zamani) || 'Aranmadı'}</p>
                                    </div>
                                    {selectedResult.sonraki_arama_zamani && (
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow-sm"></div>
                                            <p className="text-xs text-gray-500">Planlanan Arama</p>
                                            <p className="font-medium text-gray-900">{formatDate(selectedResult.sonraki_arama_zamani)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Admin Feedback Section */}
                            {(selectedResult.onay_durumu || selectedResult.kredi_limiti) && (
                                <div className={`p-4 rounded-lg border ${selectedResult.onay_durumu === 'Onaylandı' ? 'bg-green-50 border-green-200' :
                                    selectedResult.onay_durumu === 'Reddedildi' ? 'bg-red-50 border-red-200' :
                                        'bg-yellow-50 border-yellow-200'
                                    }`}>
                                    <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${selectedResult.onay_durumu === 'Onaylandı' ? 'text-green-800' :
                                        selectedResult.onay_durumu === 'Reddedildi' ? 'text-red-800' :
                                            'text-yellow-800'
                                        }`}>
                                        {selectedResult.onay_durumu === 'Onaylandı' ? <CheckCircle className="w-4 h-4" /> :
                                            selectedResult.onay_durumu === 'Reddedildi' ? <XCircle className="w-4 h-4" /> :
                                                <AlertCircle className="w-4 h-4" />}
                                        Yönetici Kararı
                                    </h3>

                                    <div className="space-y-2">
                                        {selectedResult.kredi_limiti && (
                                            <div className="flex justify-between items-center bg-white/60 p-2 rounded">
                                                <span className="text-sm font-medium opacity-80">Onaylanan Limit</span>
                                                <span className="text-lg font-bold">{selectedResult.kredi_limiti}</span>
                                            </div>
                                        )}
                                        {selectedResult.admin_notu && (
                                            <div className="mt-2 text-sm italic opacity-90 border-t border-black/5 pt-2">
                                                " {selectedResult.admin_notu} "
                                            </div>
                                        )}
                                        {selectedResult.onay_durumu === 'Kefil İstendi' && (
                                            <div className="text-xs bg-white/80 p-2 rounded text-orange-800 font-medium">
                                                ⚠️ Bu başvuru için kefil bilgileri bekleniyor.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
