/**
 * History endpoints used by the History page.
 *
 * Keeping URL construction and response shaping here keeps the page component
 * focused on UI state and rendering.
 */

import { fetchJson } from '@/services/http';

export type HistoryTab = 'currency' | 'gold';

export type ChartDataPoint = {
    date: string;
    value: number;
    tableNo?: string | null;
};

export async function fetchTrend(params: {
    tab: HistoryTab;
    from: string;
    to: string;
    currency?: string;
}) {
    const endpoint =
        params.tab === 'currency'
            ? '/history/exchange-rate-trend'
            : '/history/gold-price-trend';

    const query: Record<string, string> = {
        from: params.from,
        to: params.to,
    };

    if (params.tab === 'currency' && params.currency) {
        query.currency = params.currency;
    }

    return fetchJson(`${endpoint}?${new URLSearchParams(query)}`);
}

export async function fetchSingle(params: {
    tab: HistoryTab;
    date: string;
    currency?: string;
}) {
    const endpoint =
        params.tab === 'currency' ? '/history/exchange-rate' : '/history/gold-price';

    const query: Record<string, string> = {
        date: params.date,
    };

    if (params.tab === 'currency' && params.currency) {
        query.currency = params.currency;
    }

    return fetchJson(`${endpoint}?${new URLSearchParams(query)}`);
}

