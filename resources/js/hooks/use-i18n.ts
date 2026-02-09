import { router, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

function getValue(object: unknown, path: string): unknown {
    return path.split('.').reduce((value: unknown, key) => {
        if (value && typeof value === 'object' && key in value) {
            return (value as Record<string, unknown>)[key];
        }

        return undefined;
    }, object);
}

export function useI18n() {
    const { i18n } = usePage<SharedData>().props;

    const t = (key: string, fallback?: string) => {
        const value = getValue(i18n.translations, key);
        return typeof value === 'string' ? value : fallback ?? key;
    };

    const setLocale = (locale: string) => {
        router.post(
            '/locale',
            { locale },
            { preserveScroll: true, preserveState: false },
        );
    };

    return {
        locale: i18n.locale,
        supportedLocales: i18n.supportedLocales,
        t,
        setLocale,
    };
}

