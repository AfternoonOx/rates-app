import { Link, router, usePage } from '@inertiajs/react';
import {
    TrendingUp,
    BarChart3,
    Plus,
    ArrowRight,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { SEO } from '@/components/seo';
import { WatchlistCurrencyCard } from '@/components/watchlist-currency-card';
import { useI18n } from '@/hooks/use-i18n';
import AppLayout from '@/layouts/app-layout';
import { dashboard, watchlist as watchlistRoute } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { GoldPrice, SharedData, User, WatchlistCurrencyCardData } from '@/types';

type DashboardProps = {
    goldPrices: GoldPrice[];
    watchlist: WatchlistCurrencyCardData[];
};

/**
 * Dashboard landing page.
 * Shows gold price trend and the user's watchlist for quick access.
 */
export default function Dashboard({ goldPrices, watchlist }: DashboardProps) {
    const { t } = useI18n();
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as User;
    const [processing, setProcessing] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard'),
            href: dashboard().url,
        },
        {
            title: t('overview'),
        },
    ];

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return t('good_morning');
        if (hour < 18) return t('good_afternoon');
        return t('good_evening');
    }, [t]);

    const goldChartData = useMemo(
        () =>
            goldPrices.map((price) => ({
                date: price.date,
                price: Number(price.price),
            })),
        [goldPrices]
    );

    const { latestGoldPrice, goldChange } = useMemo(() => {
        const latest = goldPrices.length > 0 ? Number(goldPrices[goldPrices.length - 1].price) : 0;
        const oldest = goldPrices.length > 0 ? Number(goldPrices[0].price) : 0;
        const change = oldest > 0 ? (((latest - oldest) / oldest) * 100).toFixed(1) : '0.0';

        return {
            latestGoldPrice: latest,
            goldChange: change,
        };
    }, [goldPrices]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SEO
                title={t('dashboard')}
                description={t('market_happening_today')}
                noindex
                nofollow
            />

            <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-serif-brand font-medium text-slate-900">
                            {greeting}, {user.first_name}
                        </h1>
                        <p className="text-slate-500 text-sm">{t('market_happening_today')}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={watchlistRoute()}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-all shadow-sm shadow-emerald-700/20 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600"
                        >
                            <Plus size={16} aria-hidden="true" /> {t('add_currency')}
                        </Link>
                    </div>
                </div>

                {/* Gold Chart */}
                <div className="card-base p-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-slate-100 sm:pb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <BarChart3 size={20} className="text-emerald-700" aria-hidden="true" />
                                {t('gold_fixing_1g')}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">{t('official_nbp_data')}</p>
                        </div>

                        <div className="hidden sm:flex items-end gap-6">
                            <div className="text-right">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                                    {t('current_price')}
                                </p>
                                <div className="text-3xl font-serif-brand font-medium text-slate-900">
                                    {latestGoldPrice.toFixed(2)}{' '}
                                    <span className="text-base text-slate-500 font-sans">PLN</span>
                                </div>
                            </div>
                            <div className="text-right pl-6 border-l border-slate-200">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                                    10 {t('day_change')}
                                </p>
                                <div className="flex items-center justify-end gap-2">
                                    <span
                                        className={`text-sm px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${parseFloat(goldChange) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                                    >
                                        <TrendingUp size={14} aria-hidden="true" /> {goldChange}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-[350px] w-full min-w-0">
                        {goldChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={goldChartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        dy={10}
                                        tickFormatter={(value: string) => {
                                            const parts = value.split('-');
                                            return parts.length === 3 ? `${parts[1]}-${parts[2]}` : value;
                                        }}
                                        interval="preserveStartEnd"
                                        minTickGap={40}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        domain={['auto', 'auto']}
                                        tickFormatter={(value) => value.toFixed(0)}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => {
                                            const numeric = typeof value === 'number' ? value : Number(value ?? 0);
                                            return [
                                                `${numeric.toFixed(2)} PLN`,
                                                t('value'),
                                            ];
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#059669"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorGold)"
                                        activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff', fill: '#047857' }}
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-500 text-center py-20">{t('no_gold_data_available')}</p>
                        )}
                    </div>
                </div>

                {/* My Watchlist */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">{t('my_watchlist')}</h2>
                        <Link
                            href={watchlistRoute()}
                            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 rounded-sm"
                            aria-label={t('manage_watchlist')}
                        >
                            {t('manage_watchlist')} <ArrowRight size={12} aria-hidden="true" />
                        </Link>
                    </div>

                    {watchlist && watchlist.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {watchlist.map((currency) => (
                                <WatchlistCurrencyCard
                                    key={currency.code}
                                    currency={currency}
                                    processing={processing === currency.code}
                                    onRemove={(code) => {
                                        setProcessing(code);
                                        router.delete(`/user/currencies/${code}`, {
                                            preserveScroll: true,
                                            onFinish: () => setProcessing(null),
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="card-base p-8 text-center">
                            <p className="text-slate-500 mb-4">{t('no_currencies_dashboard')}</p>
                            <Link
                                href={watchlistRoute()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-all focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600"
                            >
                                <Plus size={16} aria-hidden="true" /> {t('add_some_currencies')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
