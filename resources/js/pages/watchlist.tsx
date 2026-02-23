import { router } from '@inertiajs/react';
import { FocusScope } from '@radix-ui/react-focus-scope';
import {
    Plus,
    Search,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SEO } from '@/components/seo';
import { WatchlistCurrencyCard } from '@/components/watchlist-currency-card';
import { useI18n } from '@/hooks/use-i18n';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { store as storeCurrency, destroy as destroyCurrency } from '@/routes/currencies';
import type { BreadcrumbItem } from '@/types';
import type { WatchlistCurrencyCardData } from '@/types';

type Currency = {
    code: string;
    name: string;
};

type Props = {
    watchlist: WatchlistCurrencyCardData[];
    allCurrencies: Currency[];
};

/**
 * Watchlist management page.
 * Users can add/remove currencies and quickly search the available list.
 */
export default function Watchlist({ watchlist, allCurrencies }: Props) {
    const { t } = useI18n();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard'),
            href: dashboard().url,
        },
        {
            title: t('my_watchlist'),
        },
    ];
    const [isAddMode, setIsAddMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);

    const closeAddModal = useCallback(() => {
        setIsAddMode(false);
        setSearchQuery('');
    }, []);

    // Close the modal via Escape for quick keyboard access.
    useEffect(() => {
        if (!isAddMode) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeAddModal();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeAddModal, isAddMode]);

    const addToWatchlist = (currencyCode: string) => {
        setProcessing(currencyCode);
        router.post(storeCurrency().url, { currency_code: currencyCode }, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(null);
                closeAddModal();
            },
        });
    };

    const removeFromWatchlist = (code: string) => {
        setProcessing(code);
        router.delete(destroyCurrency(code).url, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    const watchlistCodeSet = useMemo(() => new Set(watchlist.map((w) => w.code)), [watchlist]);
    const normalizedQuery = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

    const filteredCurrencies = useMemo(() => {
        const matchesQuery = (c: Currency) => {
            if (!normalizedQuery) return true;
            return (
                c.name.toLowerCase().includes(normalizedQuery) ||
                c.code.toLowerCase().includes(normalizedQuery)
            );
        };

        return allCurrencies
            .filter((c) => !watchlistCodeSet.has(c.code))
            .filter(matchesQuery);
    }, [allCurrencies, normalizedQuery, watchlistCodeSet]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SEO
                title={t('my_watchlist')}
                description={t('watchlist_desc')}
                noindex
                nofollow
            />

            <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-serif-brand font-medium text-slate-900">{t('my_watchlist')}</h1>
                        <p className="text-slate-500 text-sm mt-1">{t('watchlist_desc')}</p>
                    </div>

                    <button
                        type="button"
                        onClick={(e) => {
                            returnFocusRef.current = e.currentTarget;
                            setIsAddMode(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 text-white rounded-lg text-sm font-medium hover:bg-emerald-900 transition-all shadow-sm shadow-emerald-800/20 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600"
                    >
                        <Plus size={18} aria-hidden="true" /> {t('add_currency')}
                    </button>
                </div>

                {/* Grid of Ticker Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {watchlist.map((currency) => (
                        <WatchlistCurrencyCard
                            key={currency.code}
                            currency={currency}
                            processing={processing === currency.code}
                            onRemove={removeFromWatchlist}
                        />
                    ))}

                    {/* Add New Placeholder */}
                    <button
                        type="button"
                        onClick={(e) => {
                            returnFocusRef.current = e.currentTarget;
                            setIsAddMode(true);
                        }}
                        className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-slate-50 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600 focus:border-emerald-500 focus:text-emerald-600 transition-all group min-h-[280px]"
                    >
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 group-focus:bg-emerald-100 transition-colors">
                            <Plus size={24} aria-hidden="true" />
                        </div>
                        <span className="font-medium text-sm">{t('add_currency_pair')}</span>
                    </button>
                </div>

            </div>

            {/* ADD CURRENCY MODAL */}
            {isAddMode && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeAddModal();
                    }}
                >
                    <FocusScope
                        trapped
                        onMountAutoFocus={(e) => {
                            // Let the input's autoFocus handle initial focus
                            e.preventDefault();
                        }}
                        onUnmountAutoFocus={(e) => {
                            e.preventDefault();
                            returnFocusRef.current?.focus();
                        }}
                    >
                        <div
                            className="bg-white rounded-xl shadow-2xl w-[512px] max-w-[calc(100vw-2rem)] overflow-hidden border border-slate-200 flex flex-col max-h-[80vh] min-h-[500px]"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="add-watchlist-title"
                        >

                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3
                                    id="add-watchlist-title"
                                    className="font-serif-brand font-medium text-xl text-slate-900"
                                >
                                    {t('add_to_watchlist')}
                                </h3>
                                <button
                                    type="button"
                                    onClick={closeAddModal}
                                    className="p-2 min-w-6 min-h-6 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600"
                                    aria-label={t('close')}
                                >
                                    <X size={20} aria-hidden="true" />
                                </button>
                            </div>

                            <div className="relative">
                                <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" aria-hidden="true" />
                                <input
                                    autoFocus
                                    type="search"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                                    placeholder={t('search_currency_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label={t('search_currency_placeholder')}
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {/* Currency List */}
                        <div className="overflow-y-auto p-2 space-y-1 bg-slate-50/50 flex-1 nice-scrollbar">
                            {filteredCurrencies.length > 0 ? (
                                filteredCurrencies.map((currency) => (
                                    <button
                                        type="button"
                                        key={currency.code}
                                        onClick={() => addToWatchlist(currency.code)}
                                        disabled={processing === currency.code}
                                        className="w-full text-left px-4 py-3 bg-white hover:bg-emerald-50/50 border border-transparent hover:border-emerald-100 focus:border-emerald-300 focus:bg-emerald-50/50 rounded-lg flex items-center justify-between group transition-all disabled:opacity-50 focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600"
                                        aria-label={`${currency.name} (${currency.code})`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 group-hover:bg-white group-hover:text-emerald-700 group-focus:bg-white group-focus:text-emerald-700 transition-colors">
                                                {currency.code}
                                            </div>
                                            <div>
                                                <span className="block font-medium text-slate-900">{currency.name}</span>
                                                <span className="text-xs text-slate-500">{currency.code}</span>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity text-emerald-600" aria-hidden="true">
                                            <Plus size={20} />
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <Search size={48} className="mb-3 opacity-20" aria-hidden="true" />
                                    <p className="text-base">{t('no_currencies_found')}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-white text-xs text-slate-500 text-center">
                            {t('press')}{' '}
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-sans border border-slate-200 text-slate-600 mx-1">
                                ESC
                            </kbd>{' '}
                            {t('to_close')}
                        </div>
                        </div>
                    </FocusScope>
                </div>
            )}

        </AppLayout>
    );
}
