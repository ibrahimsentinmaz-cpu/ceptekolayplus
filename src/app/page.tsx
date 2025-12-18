'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Lock } from 'lucide-react';

export default function Home() {
    const { status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/dashboard');
        }
    }, [status, router]);

    const handleLogin = async () => {
        setLoading(true);
        await signIn('google', { callbackUrl: '/dashboard' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-indigo-50 rounded-full">
                        <Lock className="w-8 h-8 text-indigo-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Satış Yönetim Paneli</h1>
                <p className="text-gray-500 mb-8">Devam etmek için kurumsal hesabınızla giriş yapın.</p>

                <Button
                    size="lg"
                    className="w-full"
                    onClick={handleLogin}
                    isLoading={loading}
                >
                    Google ile Giriş Yap
                </Button>

                <p className="mt-6 text-xs text-gray-400">
                    Sadece yetkili personel giriş yapabilir.
                    <br />Erişim sorunu için yöneticinize başvurun.
                </p>
            </div>
        </div>
    );
}
