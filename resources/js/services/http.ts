/**
 * Small HTTP helpers for JSON endpoints.
 *
 * - Forces JSON-friendly headers expected by Laravel/Inertia backends.
 * - Gracefully handles non-JSON error bodies.
 */

export function extractErrorMessage(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object') return null;

    const p = payload as Record<string, unknown>;
    if (typeof p.error === 'string' && p.error.trim()) return p.error;
    if (typeof p.message === 'string' && p.message.trim()) return p.message;

    const errors = p.errors;
    if (errors && typeof errors === 'object') {
        const first = Object.values(errors as Record<string, unknown>)[0];
        if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
    }

    return null;
}

function tryParseJson(text: string): unknown {
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return null;
    }
}

export async function fetchJson(url: string, init?: RequestInit) {
    const response = await fetch(url, {
        ...init,
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(init?.headers ?? {}),
        },
    });

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        const data = (await response.json().catch(() => null)) as unknown;
        return { response, data };
    }

    const text = await response.text().catch(() => '');
    const data = tryParseJson(text) ?? { message: text.slice(0, 200) };
    return { response, data };
}

