import { Form, Link, usePage } from '@inertiajs/react';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Check,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { SEO, createWebPageJsonLd } from '@/components/seo';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/hooks/use-i18n';
import { register as registerRoute } from '@/routes';
import { store } from '@/routes/login';

/* ============================================================================
   Type Definitions
   ============================================================================ */

type Props = {
    /** Optional status message (e.g., "Password reset link sent") */
    status?: string;
    /** Whether user registration is enabled */
    canRegister: boolean;
};

/* ============================================================================
   Login Component
   ============================================================================ */

export default function Login({ status, canRegister }: Props) {
    const { t, locale } = useI18n();
    const { url } = usePage();

    // Password visibility toggle state
    const [showPassword, setShowPassword] = useState(false);

    // Remember me checkbox state
    const [rememberMe, setRememberMe] = useState(false);

    /* --------------------------------------------------------------------------
       SEO Configuration
       -------------------------------------------------------------------------- */
    const canonical =
        typeof window === 'undefined' ? url : `${window.location.origin}${url}`;

    const title = t('log_in');
    const description = t('seo_login_description');
    const keywords = t('seo_login_keywords');

    const jsonLd = createWebPageJsonLd(
        canonical,
        title,
        description,
        undefined,
        locale
    );

    /* --------------------------------------------------------------------------
       Render
       -------------------------------------------------------------------------- */
    return (
        <>
            {/* SEO Meta Tags */}
            <SEO
                title={title}
                description={description}
                keywords={keywords}
                canonical={canonical}
                ogType="website"
                noindex={true}
                jsonLd={jsonLd}
            />

            {/* Page Container */}
            <div className="auth-page">
                {/* Header / Logo Section */}
                <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
                    {/* Brand Logo */}
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/20">
                            <span className="font-serif-brand font-bold text-2xl">R</span>
                        </div>
                    </div>

                    {/* Page Title */}
                    <h1 className="text-3xl font-serif-brand font-medium text-slate-900 tracking-tight">
                        {t('welcome_back')}
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-3 text-sm text-slate-500">
                        {t('sign_in_to_access')}
                    </p>
                </div>

                {/* Main Card */}
                <div className="auth-card">
                    {/* Status Message (e.g., password reset confirmation) */}
                    {status && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium rounded-lg text-center">
                            {status}
                        </div>
                    )}

                    {/* Login Form */}
                    <Form
                        action={store().url}
                        method="post"
                        resetOnSuccess={['password']}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Email Input Field */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="login-email"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        {t('email_address')}
                                    </label>
                                    <div className="relative group">
                                        {/* Mail Icon */}
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                            aria-hidden="true"
                                        >
                                            <Mail
                                                size={18}
                                                className="text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                                            />
                                        </div>
                                        <input
                                            id="login-email"
                                            type="email"
                                            name="email"
                                            required
                                            autoComplete="email"
                                            aria-describedby={errors.email ? 'login-email-error' : undefined}
                                            aria-invalid={errors.email ? 'true' : 'false'}
                                            className="auth-input-field auth-input-focus"
                                            placeholder={t('email_placeholder')}
                                        />
                                    </div>
                                    <InputError message={errors.email} id="login-email-error" />
                                </div>

                                {/* Password Input Field */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="login-password"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        {t('password')}
                                    </label>
                                    <div className="relative group">
                                        {/* Lock Icon */}
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                            aria-hidden="true"
                                        >
                                            <Lock
                                                size={18}
                                                className="text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                                            />
                                        </div>
                                        <input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            autoComplete="current-password"
                                            aria-describedby={errors.password ? 'login-password-error' : undefined}
                                            aria-invalid={errors.password ? 'true' : 'false'}
                                            className="auth-input-field auth-input-field-password auth-input-focus"
                                            placeholder="••••••••••••"
                                        />
                                        {/* Password Visibility Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? t('hide_password') : t('show_password')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 focus:text-emerald-600 rounded-sm"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} id="login-password-error" />
                                </div>

                                {/* Remember Me Checkbox */}
                                <div className="flex items-center">
                                    {/* Hidden checkbox for form submission */}
                                    <input
                                        type="hidden"
                                        name="remember"
                                        value={rememberMe ? 'on' : ''}
                                    />
                                    {/* Accessible checkbox with label */}
                                    <label className="flex items-center cursor-pointer select-none group">
                                        <button
                                            type="button"
                                            role="checkbox"
                                            aria-checked={rememberMe}
                                            onClick={() => setRememberMe(!rememberMe)}
                                            className={`min-w-6 min-h-6 w-6 h-6 rounded border flex items-center justify-center transition-all focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 ${rememberMe
                                                ? 'bg-emerald-700 border-emerald-700'
                                                : 'bg-white border-slate-300 group-hover:border-emerald-500'
                                                }`}
                                        >
                                            {rememberMe && <Check size={14} className="text-white" aria-hidden="true" />}
                                        </button>
                                        <span className="ml-2 text-sm text-slate-600">
                                            {t('keep_me_signed_in')}
                                        </span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="auth-submit-button"
                                >
                                    {processing ? (
                                        <>
                                            <Spinner />
                                            <span>{t('authenticating')}</span>
                                        </>
                                    ) : (
                                        <>
                                            {t('sign_in')} <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </Form>

                    {/* Sign Up Section */}
                    {canRegister && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <p className="text-center text-sm text-slate-500 mb-4">
                                {t('dont_have_account_yet')}
                            </p>
                            <Link
                                href={registerRoute()}
                                className="auth-secondary-button"
                            >
                                {t('create_new_account')}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-slate-600">
                    <p>
                        © {new Date().getFullYear()} {t('app_name')} •{' '}
                        <a href="#" className="underline hover:text-emerald-700 focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 rounded-sm transition-colors">
                            {t('privacy_policy')}
                        </a>{' '}
                        •{' '}
                        <a href="#" className="underline hover:text-emerald-700 focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 rounded-sm transition-colors">
                            {t('contact_support')}
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
