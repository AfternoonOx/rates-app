import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Globe,
    History,
    LayoutDashboard,
    LogOut,
    Settings,
    Wallet,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/hooks/use-i18n';
import { dashboard, history as historyRoute, logout, watchlist } from '@/routes';
import profile from '@/routes/profile';
import type { SharedData, User } from '@/types';

function NavItem({
    icon,
    label,
    active,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    href?: string;
}) {
    const content = (
        <div
            className={`
            flex items-center gap-3 px-3 py-2 mx-2 rounded-md text-sm font-medium transition-all cursor-pointer
            ${active ? 'bg-emerald-800 text-white shadow-sm' : 'text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white'}
        `}
        >
            {icon}
            <span>{label}</span>
        </div>
    );

    if (href) {
        return <Link href={href} className="block rounded-md focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2922]">{content}</Link>;
    }
    return <a>{content}</a>;
}

export function AppSidebar({
    isSidebarOpen,
    setSidebarOpen,
}: {
    isSidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}) {
    const { t, locale, setLocale } = useI18n();
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { url } = page;
    const user = auth.user as User;
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isLanguageOpen, setLanguageOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const languageRef = useRef<HTMLDivElement>(null);

    // Helper function to check if a URL is active
    const isActiveUrl = (href: string) => {
        return url === href || url.startsWith(href + '/');
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target as Node)
            ) {
                setProfileOpen(false);
                setLanguageOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        router.post(logout().url);
    };

    const handleLanguageChange = (newLocale: string) => {
        setLocale(newLocale);
        setLanguageOpen(false);
        setProfileOpen(false);
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        const first = firstName?.charAt(0) || '';
        const last = lastName?.charAt(0) || '';
        return (first + last).toUpperCase() || 'U';
    };

    return (
        <aside
            className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-[#0f2922] text-slate-300 transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    lg:translate-x-0 lg:static lg:block
                `}
        >
            <div className="h-full flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 bg-[#0a1f1a]">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white mr-3">
                        <span className="font-serif-brand font-bold text-lg">R</span>
                    </div>
                    <span className="font-medium text-white tracking-tight text-lg">
                        {t('app_name')}
                    </span>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="ml-auto lg:hidden text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600/80">
                        {t('main')}
                    </div>
                    <NavItem
                        icon={<LayoutDashboard size={18} />}
                        label={t('overview')}
                        active={isActiveUrl(dashboard().url)}
                        href={dashboard().url}
                    />
                    <NavItem
                        icon={<Wallet size={18} />}
                        label={t('my_watchlist')}
                        active={isActiveUrl(watchlist().url)}
                        href={watchlist().url}
                    />
                    <NavItem
                        icon={<History size={18} />}
                        label={t('history')}
                        active={isActiveUrl(historyRoute().url)}
                        href={historyRoute().url}
                    />
                    <NavItem
                        icon={<Settings size={18} />}
                        label={t('settings')}
                        active={isActiveUrl(profile.edit().url)}
                        href={profile.edit().url}
                    />
                </nav>

                {/* Profile */}
                <div className="p-4 border-t border-emerald-900/50" ref={profileRef}>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 w-full p-2 hover:bg-emerald-900/30 rounded-lg transition-colors text-left group focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2922]"
                        >
                            <div className="w-8 h-8 bg-emerald-800 rounded-full flex items-center justify-center text-emerald-100 text-xs font-bold">
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
                                    {user.first_name} {user.last_name}
                                </p>
                                <p className="text-xs text-slate-500">{t('finance_pro')}</p>
                            </div>
                            <ChevronDown
                                size={16}
                                className={`text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Profile Dropdown */}
                        {isProfileOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                                <div
                                    className="relative"
                                    ref={languageRef}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setLanguageOpen((open) => !open)}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 focus-visible:bg-emerald-50 focus-visible:outline-none rounded-md"
                                    >
                                        <Globe size={16} />
                                        <span>{t('language')}</span>
                                        <ChevronDown
                                            size={14}
                                            className={`ml-auto transition-transform ${isLanguageOpen ? '-rotate-180' : '-rotate-90'}`}
                                        />
                                    </button>

                                    {/* Language Submenu */}
                                    {isLanguageOpen && (
                                        <div className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[140px]">
                                            <button
                                                type="button"
                                                onClick={() => handleLanguageChange('en')}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 focus-visible:bg-emerald-50 focus-visible:outline-none rounded-md ${locale === 'en' ? 'text-emerald-700 font-medium' : 'text-slate-700'}`}
                                            >
                                                {t('english')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleLanguageChange('pl')}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 focus-visible:bg-emerald-50 focus-visible:outline-none rounded-md ${locale === 'pl' ? 'text-emerald-700 font-medium' : 'text-slate-700'}`}
                                            >
                                                {t('polish')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href={profile.edit().url}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 focus-visible:bg-emerald-50 focus-visible:outline-none rounded-md block"
                                >
                                    <Settings size={16} />
                                    <span>{t('settings')}</span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 focus-visible:bg-rose-50 focus-visible:outline-none rounded-md"
                                >
                                    <LogOut size={16} />
                                    <span>{t('logout')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
