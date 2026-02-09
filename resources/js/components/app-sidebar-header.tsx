import { Menu } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useI18n } from '@/hooks/use-i18n';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
    setSidebarOpen,
}: {
    breadcrumbs?: BreadcrumbItemType[];
    setSidebarOpen?: (open: boolean) => void;
}) {
    const { t } = useI18n();

    return (
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-6 lg:px-8 shadow-sm">
            <div className="flex items-center gap-4">
                {setSidebarOpen && (
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-2 hover:bg-slate-50 rounded-lg text-slate-600"
                        aria-label={t('open_menu')}
                    >
                        <Menu size={20} />
                    </button>
                )}
                <div className="hidden sm:block">
                    {breadcrumbs.length > 0 ? (
                        <Breadcrumbs
                            breadcrumbs={breadcrumbs}
                            listClassName="text-slate-900"
                            linkClassName="text-slate-700 hover:text-emerald-600"
                            pageClassName="text-slate-900"
                            separatorClassName="text-black"
                        />
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>{t('dashboard')}</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 font-medium">{t('overview')}</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
