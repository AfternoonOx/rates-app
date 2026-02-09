import {
    Search,
    TrendingUp,
    FileText,
    Calendar,
    Download,
    Coins,
    Scale,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/hooks/use-i18n';
import AppLayout from '@/layouts/app-layout';
import { downloadTextFile, toCsv } from '@/lib/csv';
import { formatDateToInputValue } from '@/lib/date';
import { dashboard } from '@/routes';
import { fetchSingle, fetchTrend } from '@/services/history';
import type { ChartDataPoint } from '@/services/history';
import { extractErrorMessage } from '@/services/http';
import type { BreadcrumbItem } from '@/types';

type Currency = {
    code: string;
    name: string;
};

type HistoryPageProps = {
    currencies: Currency[];
};

/**
 * Uncontrolled date input that commits its value on blur/Enter.
 * This avoids re-rendering on every keystroke while keeping state consistent.
 */

function DateField({
    id,
    value,
    onCommit,
    min,
    max,
    inputRef,
}: {
    id?: string;
    value: string;
    onCommit: (value: string) => void;
    min?: string;
    max?: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
}) {
    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        if (document.activeElement === el) return;
        if (el.value === value) return;
        el.value = value;
    }, [inputRef, value]);

    return (
        <div className="relative">
            <input
                ref={inputRef}
                id={id}
                type="date"
                defaultValue={value}
                min={min}
                max={max}
                onBlur={(e) => onCommit(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onCommit((e.target as HTMLInputElement).value);
                    }
                }}
                style={{ colorScheme: 'light' }}
                className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none block w-full p-2.5 h-10"
            />
        </div>
    );
}

/**
 * History analytics page.
 * Supports exchange rates and gold prices in range or single-day modes.
 */
export default function HistoryPage({ currencies }: HistoryPageProps) {
    const { t } = useI18n();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard'),
            href: dashboard().url,
        },
        {
            title: t('history'),
        },
    ];

    // App State
    const [activeTab, setActiveTab] = useState<'currency' | 'gold'>('currency');
    const [analysisMode, setAnalysisMode] = useState<'range' | 'single'>('range');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Decimals: Y axis uses 0 for gold, 2 for currency; tooltip always uses 2
    const yAxisDecimals = activeTab === 'gold' ? 0 : 2;
    const tooltipDecimals = 2;

    // Form State
    const [selectedCurrency, setSelectedCurrency] = useState(currencies.length > 0 ? currencies[0].code : 'USD');
    const [dateFrom, setDateFrom] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return formatDateToInputValue(d);
    });
    const [dateTo, setDateTo] = useState(() => formatDateToInputValue(new Date()));
    const [singleDate, setSingleDate] = useState(() => formatDateToInputValue(new Date()));

    const dateFromRef = useRef<HTMLInputElement>(null);
    const dateToRef = useRef<HTMLInputElement>(null);
    const singleDateRef = useRef<HTMLInputElement>(null);

    const minAllowedDate = activeTab === 'gold' ? '2013-01-02' : '2002-01-02';
    const maxAllowedDate = formatDateToInputValue(new Date());

    // Result State
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [singleResult, setSingleResult] = useState<{ value: number; tableNo?: string | null; date?: string } | null>(null);
    const [showAllRows, setShowAllRows] = useState(false);

    const handleDownloadCsv = () => {
        if (chartData.length === 0) return;

        const hasTableNo = chartData.some((p) => p.tableNo != null);
        const headers = hasTableNo
            ? [t('date'), t('value'), t('table_no')]
            : [t('date'), t('value')];
        const rows = chartData.map((p) =>
            hasTableNo ? [p.date, p.value, p.tableNo ?? ''] : [p.date, p.value]
        );

        const start = dateFromRef.current?.value || dateFrom;
        const end = dateToRef.current?.value || dateTo;
        const prefix = activeTab === 'currency' ? selectedCurrency : 'GOLD';
        const filename = `history-${prefix}-${start}-${end}.csv`;

        downloadTextFile(filename, toCsv(headers, rows), 'text/csv;charset=utf-8;');
    };

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setShowAllRows(false);

        try {
            if (analysisMode === 'range') {
                const from = dateFromRef.current?.value || dateFrom;
                const to = dateToRef.current?.value || dateTo;

                setDateFrom(from);
                setDateTo(to);

                const { response, data } = await fetchTrend({
                    tab: activeTab,
                    from,
                    to,
                    currency: selectedCurrency,
                });

                if (!response.ok) {
                    const message = extractErrorMessage(data);
                    setError(message || `${t('error_fetching_data')} (${response.status})`);
                    setChartData([]);
                    return;
                }

                const payload = data as { data?: ChartDataPoint[] };
                setChartData(Array.isArray(payload.data) ? payload.data : []);
            } else {
                const date = singleDateRef.current?.value || singleDate;
                setSingleDate(date);

                const { response, data } = await fetchSingle({
                    tab: activeTab,
                    date,
                    currency: selectedCurrency,
                });

                if (!response.ok) {
                    const message = extractErrorMessage(data);
                    setError(message || `${t('error_fetching_data')} (${response.status})`);
                    setSingleResult(null);
                    return;
                }

                const payload = data as Record<string, unknown>;
                const valueRaw = payload.value;
                const value = typeof valueRaw === 'number' ? valueRaw : Number(valueRaw);

                setSingleResult({
                    value: Number.isFinite(value) ? value : 0,
                    tableNo: typeof payload.tableNo === 'string' ? payload.tableNo : null,
                    date: typeof payload.date === 'string' ? payload.date : undefined,
                });
            }
        } catch {
            setError(t('error_fetching_data'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (tab: 'currency' | 'gold') => {
        setActiveTab(tab);
        setChartData([]);
        setSingleResult(null);
        setError(null);
        setShowAllRows(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SEO
                title={t('history')}
                description={t('historical_data_desc')}
                noindex
                nofollow
            />

            <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-serif-brand font-medium text-slate-900">{t('historical_data')}</h1>
                        <p className="text-slate-500 text-sm mt-1">{t('historical_data_desc')}</p>
                    </div>

                    <div role="tablist" aria-label={t('data_type')} className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'currency'}
                            onClick={() => handleTabChange('currency')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 ${activeTab === 'currency' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Coins size={16} aria-hidden="true" /> {t('currencies')}
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'gold'}
                            onClick={() => handleTabChange('gold')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 ${activeTab === 'gold' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Scale size={16} aria-hidden="true" /> {t('gold_prices')}
                        </button>
                    </div>
                </div>

                {/* Query Controls Card */}
                <div className="card-base p-6 border-t-4 border-t-emerald-800">
                    <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">

                        {/* Mode Selector */}
                        <div className="flex flex-col gap-1.5 min-w-[200px]">
                            <Label id="analysis-type-label" className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('analysis_type')}</Label>
                            <div className="flex gap-2" role="group" aria-labelledby="analysis-type-label">
                                <button
                                    type="button"
                                    onClick={() => setAnalysisMode('range')}
                                    aria-pressed={analysisMode === 'range'}
                                    className={`flex-1 py-2 px-3 text-sm border rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 ${analysisMode === 'range' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <TrendingUp size={16} aria-hidden="true" /> {t('trend')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAnalysisMode('single')}
                                    aria-pressed={analysisMode === 'single'}
                                    className={`flex-1 py-2 px-3 text-sm border rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 ${analysisMode === 'single' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Calendar size={16} aria-hidden="true" /> {t('day')}
                                </button>
                            </div>
                        </div>

                        <div className="w-px h-12 bg-slate-200 hidden xl:block"></div>

                        {/* Dynamic Inputs */}
                        <div className="flex flex-1 flex-col md:flex-row gap-4 w-full">

                            {/* Currency Select (Only if Currency Tab) */}
                            {activeTab === 'currency' && (
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('currency')}</Label>
                                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                                        <SelectTrigger className="h-10 !bg-white !border-slate-200 !text-slate-900">
                                            <SelectValue placeholder={t('select_currency')} />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-80 nice-scrollbar-emerald !bg-white !text-slate-900 !border-slate-200 shadow-xl">
                                            {currencies.map((c) => (
                                                <SelectItem
                                                    key={c.code}
                                                    value={c.code}
                                                    className="focus:bg-emerald-50 focus:text-emerald-900"
                                                >
                                                    {c.code} - {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Date Inputs */}
                            {analysisMode === 'range' ? (
                                <>
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <Label htmlFor="date-from" className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('from_date')}</Label>
                                        <DateField
                                            id="date-from"
                                            value={dateFrom}
                                            min={minAllowedDate}
                                            max={dateTo || maxAllowedDate}
                                            inputRef={dateFromRef}
                                            onCommit={setDateFrom}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <Label htmlFor="date-to" className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('to_date')}</Label>
                                        <DateField
                                            id="date-to"
                                            value={dateTo}
                                            min={dateFrom || minAllowedDate}
                                            max={maxAllowedDate}
                                            inputRef={dateToRef}
                                            onCommit={setDateTo}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <Label htmlFor="single-date" className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('specific_date')}</Label>
                                    <DateField
                                        id="single-date"
                                        value={singleDate}
                                        min={minAllowedDate}
                                        max={maxAllowedDate}
                                        inputRef={singleDateRef}
                                        onCommit={setSingleDate}
                                    />
                                </div>
                            )}

                            <div className="flex items-end">
                                <Button
                                    onClick={handleSearch}
                                    disabled={isLoading}
                                    className="bg-emerald-800 hover:bg-emerald-900 text-white w-full md:w-auto"
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner className="mr-2" /> {t('loading')}
                                        </>
                                    ) : (
                                        <>
                                            <Search size={16} aria-hidden="true" /> {t('analyze')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="card-base p-4 border-l-4 border-l-rose-500 bg-rose-50" role="alert">
                        <p className="text-rose-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Results Area */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {isLoading ? (
                        <div className="card-base p-10 flex items-center justify-center gap-3 text-slate-500" role="status" aria-live="polite">
                            <Spinner className="size-5" aria-hidden="true" />
                            <span className="text-sm font-medium">{t('loading')}</span>
                        </div>
                    ) : analysisMode === 'range' && chartData.length > 0 ? (
                        <div className="space-y-6">
                            {/* Chart Card */}
                            <div className="card-base p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            {activeTab === 'currency'
                                                ? `${selectedCurrency} ${t('exchange_rate_trend')}`
                                                : t('gold_price_evolution')
                                            }
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            {dateFrom} — {dateTo}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleDownloadCsv}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 border border-transparent hover:border-slate-200 transition-all focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600"
                                            aria-label={t('download_csv')}
                                        >
                                            <Download size={18} aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>

                                <div className="h-[400px] w-full min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={activeTab === 'gold' ? '#ca8a04' : '#059669'} stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor={activeTab === 'gold' ? '#ca8a04' : '#059669'} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                dy={10}
                                                minTickGap={50}
                                                tickFormatter={(value: string) => {
                                                    const parts = value.split('-');
                                                    return parts.length === 3 ? `${parts[1]}-${parts[2]}` : value;
                                                }}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                domain={['auto', 'auto']}
                                                tickFormatter={(val) => val.toFixed(yAxisDecimals)}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value) => {
                                                    const numeric = typeof value === 'number' ? value : Number(value ?? 0);
                                                    return [
                                                        `${numeric.toFixed(tooltipDecimals)} PLN`,
                                                        activeTab === 'currency' ? t('rate') : t('value'),
                                                    ];
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke={activeTab === 'gold' ? '#ca8a04' : '#059669'}
                                                strokeWidth={2}
                                                fill="url(#colorValue)"
                                                isAnimationActive={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Range Stats Table */}
                            <div className="card-base overflow-hidden">
                                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                    <h3 className="font-semibold text-slate-900 text-sm">{t('data_points')}</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <caption className="sr-only">{t('data_points')}</caption>
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-500">
                                                <th scope="col" className="px-6 py-3 font-medium">{t('date')}</th>
                                                {chartData.some((p) => p.tableNo != null) && (
                                                    <th scope="col" className="px-6 py-3 font-medium">{t('table_no')}</th>
                                                )}
                                                <th scope="col" className="px-6 py-3 font-medium text-right">{t('value')} (PLN)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {[...chartData]
                                                .reverse()
                                                .slice(0, showAllRows ? chartData.length : 5)
                                                .map((row) => (
                                                    <tr key={`${row.date}-${row.tableNo ?? ''}`} className="hover:bg-slate-50">
                                                        <td className="px-6 py-3 text-slate-900">{row.date}</td>
                                                        {chartData.some((p) => p.tableNo != null) && (
                                                            <td className="px-6 py-3 text-slate-500 font-mono text-xs">{row.tableNo || '—'}</td>
                                                        )}
                                                        <td className="px-6 py-3 text-right font-medium text-slate-900">{row.value.toFixed(tooltipDecimals)}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                    {chartData.length > 5 && (
                                        <div className="px-6 py-3 border-t border-slate-200 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setShowAllRows(!showAllRows)}
                                                className="text-emerald-700 text-sm font-medium hover:underline focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 rounded-sm"
                                            >
                                                {showAllRows ? t('show_less') : `${t('view_all')} ${chartData.length} ${t('rows')}`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : analysisMode === 'single' && singleResult ? (
                        /* SINGLE DATE VIEW */
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="card-base p-8 max-w-md w-full text-center relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-full h-2 ${activeTab === 'gold' ? 'bg-yellow-500' : 'bg-emerald-600'}`}></div>

                                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">{t('official_mid_rate')}</p>
                                <div className="text-5xl font-serif-brand font-medium text-slate-900 mb-2">
                                    {singleResult.value.toFixed(tooltipDecimals)} <span className="text-xl text-slate-500 font-sans">PLN</span>
                                </div>

                                {singleResult.tableNo && (
                                    <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs font-mono text-slate-600 mb-8">
                                        <FileText size={12} aria-hidden="true" />
                                        {singleResult.tableNo}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                                    <div className="text-left">
                                        <p className="text-xs text-slate-500 mb-1">{t('currency_asset')}</p>
                                        <p className="font-semibold text-slate-900">{activeTab === 'currency' ? `${selectedCurrency} (1)` : t('gold_1g')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 mb-1">{t('effective_date')}</p>
                                        <p className="font-semibold text-slate-900">{singleResult.date || singleDate}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-6 text-slate-400 text-sm">{t('data_provided_by_nbp')}</p>
                        </div>
                    ) : null}
                </div>

            </div>
        </AppLayout>
    );
}
