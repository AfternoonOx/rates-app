export type * from './auth';
export type * from './currency';
export type * from './navigation';
export type * from './ui';
export type * from './watchlist';

import type { Auth } from './auth';

export type I18n = {
    locale: string;
    supportedLocales: string[];
    translations: Record<string, unknown>;
};

export type SharedData = {
    name: string;
    appUrl?: string;
    auth: Auth;
    sidebarOpen: boolean;
    i18n: I18n;
    [key: string]: unknown;
};
