import { Head, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

type JsonLdObject = Record<string, unknown>;

export type SEOProps = {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile';
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    canonical?: string;
    noindex?: boolean;
    nofollow?: boolean;
    jsonLd?: JsonLdObject | JsonLdObject[];
    alternateLanguages?: boolean;
};

export function SEO({
    title,
    description,
    keywords,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    canonical,
    noindex = false,
    nofollow = false,
    jsonLd,
    alternateLanguages = false,
}: SEOProps) {
    const { url, props } = usePage<SharedData>();
    const { i18n } = props;
    const appName = props.name || import.meta.env.VITE_APP_NAME || 'Laravel';
    const baseUrl =
        (typeof props.appUrl === 'string' && props.appUrl.trim()
            ? props.appUrl.trim().replace(/\/+$/, '')
            : undefined) || (typeof window === 'undefined' ? undefined : window.location.origin);

    const canonicalUrl = canonical || (baseUrl ? new URL(url, baseUrl).toString() : undefined);
    
    // Robots meta
    const robotsContent = [];
    if (noindex) robotsContent.push('noindex');
    if (nofollow) robotsContent.push('nofollow');
    const robots = robotsContent.length > 0 ? robotsContent.join(', ') : undefined;

    const buildAlternateUrl = (locale: string) => {
        if (!baseUrl) return undefined;
        const localizedPath = url.replace(
            new RegExp(`^/${i18n.locale}(?=/|$)`),
            `/${locale}`,
        );
        return new URL(localizedPath, baseUrl).toString();
    };

    const ogTitle = `${title} - ${appName}`;
    const xDefaultHref =
        alternateLanguages && i18n.supportedLocales.length > 0
            ? buildAlternateUrl(i18n.supportedLocales[0])
            : undefined;
    
    return (
        <Head title={title}>
            {/* Basic Meta Tags */}
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            {robots && <meta name="robots" content={robots} />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            
            {/* Alternate Language Links (hreflang) */}
            {alternateLanguages &&
                i18n.supportedLocales
                    .map((locale) => ({
                        locale,
                        href: buildAlternateUrl(locale),
                    }))
                    .filter((entry): entry is { locale: string; href: string } => Boolean(entry.href))
                    .map(({ locale, href }) => (
                        <link
                            key={locale}
                            rel="alternate"
                            hrefLang={locale}
                            href={href}
                        />
                    ))}
            {xDefaultHref && <link rel="alternate" hrefLang="x-default" href={xDefaultHref} />}
            
            {/* Open Graph Tags */}
            <meta property="og:title" content={ogTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            <meta property="og:locale" content={i18n.locale.replace('-', '_')} />
            {ogImage && <meta property="og:image" content={ogImage} />}
            <meta property="og:site_name" content={appName} />
            
            {/* Twitter Card Tags */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={ogTitle} />
            <meta name="twitter:description" content={description} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}
            
            {/* JSON-LD Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
                </script>
            )}
        </Head>
    );
}

export function createWebsiteJsonLd(url: string, name: string, description: string, locale?: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url,
        description,
        inLanguage: locale || 'en',
    };
}

export function createWebPageJsonLd(
    url: string,
    name: string,
    description: string,
    breadcrumbs?: Array<{ name: string; url: string }>,
    locale?: string
) {
    const jsonLd: JsonLdObject = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name,
        url,
        description,
        inLanguage: locale || 'en',
    };
    
    if (breadcrumbs && breadcrumbs.length > 0) {
        jsonLd.breadcrumb = createBreadcrumbJsonLd(breadcrumbs);
    }
    
    return jsonLd;
}

export function createBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function createOrganizationJsonLd(
    name: string,
    url: string,
    logo?: string,
    socialLinks?: string[]
) {
    const jsonLd: JsonLdObject = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url,
    };
    
    if (logo) {
        jsonLd.logo = logo;
    }
    
    if (socialLinks && socialLinks.length > 0) {
        jsonLd.sameAs = socialLinks;
    }
    
    return jsonLd;
}
