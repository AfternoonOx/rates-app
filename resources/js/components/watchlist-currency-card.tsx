import {
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
} from 'recharts';
import { useI18n } from '@/hooks/use-i18n';
import type { WatchlistCurrencyCardData, SparklinePoint } from '@/types';

/**
 * Compact tooltip used by the small sparkline chart.
 */
const CustomSparklineTooltip = ({
    active,
    payload,
}: {
    active?: boolean;
    payload?: Array<{ payload: SparklinePoint }>;
}) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-800 z-50">
                <p className="font-semibold mb-1 text-slate-400 text-[10px] uppercase">
                    {data.date}
                </p>
                <p className="font-mono">{data.value.toFixed(4)} PLN</p>
            </div>
        );
    }
    return null;
};

export function WatchlistCurrencyCard({
    currency,
    processing,
    onRemove,
}: {
    currency: WatchlistCurrencyCardData;
    processing?: boolean;
    onRemove: (code: string) => void;
}) {
    const { t } = useI18n();

    return (
        <div className="card-base p-6 hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                        {currency.code}
                    </div>
                    <div>
                        <h3 className="font-medium text-slate-900 leading-tight">
                            {currency.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{t('nbp_table_a')}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(currency.code)}
                    disabled={processing}
                    className="text-slate-300 hover:text-rose-500 transition-colors p-1 disabled:opacity-50"
                    title={t('remove_from_watchlist')}
                    aria-label={t('remove_from_watchlist')}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="mb-6 flex items-end justify-between">
                <div>
                    <div className="text-3xl font-serif-brand font-medium text-slate-900">
                        {currency.rate != null ? currency.rate.toFixed(4) : '—'}
                        <span className="text-sm text-slate-400 font-sans ml-1">PLN</span>
                    </div>
                </div>
                {currency.rate != null && (
                    <div
                        className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full ${currency.change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                    >
                        {currency.change >= 0 ? (
                            <ArrowUpRight size={16} />
                        ) : (
                            <ArrowDownRight size={16} />
                        )}
                        {Math.abs(currency.change).toFixed(2)}%
                    </div>
                )}
            </div>

            {currency.sparklineData.length > 1 ? (
                <>
                    <div className="h-20 w-full min-w-0 -ml-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={currency.sparklineData}>
                                <defs>
                                    <linearGradient
                                        id={`grad-${currency.code}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={
                                                currency.change >= 0
                                                    ? '#10b981'
                                                    : '#f43f5e'
                                            }
                                            stopOpacity={0.2}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={
                                                currency.change >= 0
                                                    ? '#10b981'
                                                    : '#f43f5e'
                                            }
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={
                                        currency.change >= 0
                                            ? '#059669'
                                            : '#e11d48'
                                    }
                                    strokeWidth={2}
                                    fill={`url(#grad-${currency.code})`}
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                />
                                <RechartsTooltip
                                    content={<CustomSparklineTooltip />}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        <span>14 {t('days_ago')}</span>
                        <span>{t('today')}</span>
                    </div>
                </>
            ) : (
                <div className="h-20 flex items-center justify-center text-slate-400 text-sm">
                    {t('no_historical_data')}
                </div>
            )}
        </div>
    );
}
