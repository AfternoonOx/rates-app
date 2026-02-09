import { useState } from 'react';
import { AppFooter } from '@/components/app-footer';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { useI18n } from '@/hooks/use-i18n';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { t } = useI18n();

    return (
        <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans flex">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
            >
                {t('skip_to_main_content')}
            </a>
            <AppSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main className="flex-1 flex flex-col min-w-0">
                <AppSidebarHeader 
                    breadcrumbs={breadcrumbs} 
                    setSidebarOpen={setSidebarOpen}
                />
                <div className="flex-1 overflow-y-auto">
                    <div className="min-h-full flex flex-col">
                        <div id="main-content">{children}</div>
                        <AppFooter />
                    </div>
                </div>
            </main>
        </div>
    );
}
