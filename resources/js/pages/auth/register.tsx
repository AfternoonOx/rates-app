import { Form, Link, usePage } from '@inertiajs/react';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    User,
    Hash,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { SEO, createWebPageJsonLd } from '@/components/seo';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/hooks/use-i18n';
import { login } from '@/routes';
import { store } from '@/routes/register';

/* ============================================================================
   Register Component
   ============================================================================ */

export default function Register() {
    const { t, locale } = useI18n();
    const { url } = usePage();

    // Password visibility toggle states
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    /* --------------------------------------------------------------------------
       SEO Configuration
       -------------------------------------------------------------------------- */
    const canonical =
        typeof window === 'undefined' ? url : `${window.location.origin}${url}`;

    const title = t('register');
    const description = t('seo_register_description');
    const keywords = t('seo_register_keywords');

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
                        {t('create_an_account')}
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-3 text-sm text-slate-500">
                        {t('join_finance_professionals')}
                    </p>
                </div>

                {/* Main Card - Wider than login for additional fields */}
                <div className="auth-card auth-card-wide">
                    {/* Registration Form */}
                    <Form
                        action={store().url}
                        method="post"
                        resetOnSuccess={['password', 'password_confirmation']}
                        className="space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Name Row - Two columns on tablet and up */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* First Name Input */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="register-first-name"
                                            className="block text-sm font-medium text-slate-700"
                                        >
                                            {t('first_name')}
                                        </label>
                                        <div className="relative group">
                                            {/* User Icon */}
                                            <div
                                                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                                aria-hidden="true"
                                            >
                                                <User
                                                    size={18}
                                                    className="text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                                                />
                                            </div>
                                            <input
                                                id="register-first-name"
                                                type="text"
                                                name="first_name"
                                                required
                                                autoFocus
                                                autoComplete="given-name"
                                                aria-describedby={errors.first_name ? 'register-first-name-error' : undefined}
                                                aria-invalid={errors.first_name ? 'true' : 'false'}
                                                className="auth-input-field auth-input-focus"
                                                placeholder={t('first_name')}
                                            />
                                        </div>
                                        <InputError message={errors.first_name} id="register-first-name-error" />
                                    </div>

                                    {/* Last Name Input */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="register-last-name"
                                            className="block text-sm font-medium text-slate-700"
                                        >
                                            {t('last_name')}
                                        </label>
                                        <input
                                            id="register-last-name"
                                            type="text"
                                            name="last_name"
                                            required
                                            autoComplete="family-name"
                                            aria-describedby={errors.last_name ? 'register-last-name-error' : undefined}
                                            aria-invalid={errors.last_name ? 'true' : 'false'}
                                            className="auth-input-field-no-icon auth-input-focus"
                                            placeholder={t('last_name')}
                                        />
                                        <InputError message={errors.last_name} id="register-last-name-error" />
                                    </div>
                                </div>

                                {/* Nickname Input */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="register-nickname"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        {t('nickname')}
                                    </label>
                                    <div className="relative group">
                                        {/* Hash Icon */}
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                            aria-hidden="true"
                                        >
                                            <Hash
                                                size={18}
                                                className="text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                                            />
                                        </div>
                                        <input
                                            id="register-nickname"
                                            type="text"
                                            name="nickname"
                                            required
                                            autoComplete="nickname"
                                            aria-describedby={errors.nickname ? 'register-nickname-error' : undefined}
                                            aria-invalid={errors.nickname ? 'true' : 'false'}
                                            className="auth-input-field auth-input-focus"
                                            placeholder={t('unique_nickname')}
                                        />
                                    </div>
                                    <InputError message={errors.nickname} id="register-nickname-error" />
                                </div>

                                {/* Email Input */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="register-email"
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
                                            id="register-email"
                                            type="email"
                                            name="email"
                                            required
                                            autoComplete="email"
                                            aria-describedby={errors.email ? 'register-email-error' : undefined}
                                            aria-invalid={errors.email ? 'true' : 'false'}
                                            className="auth-input-field auth-input-focus"
                                            placeholder={t('email_placeholder')}
                                        />
                                    </div>
                                    <InputError message={errors.email} id="register-email-error" />
                                </div>

                                {/* Password Input */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="register-password"
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
                                            id="register-password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            aria-describedby={errors.password ? 'register-password-error' : 'register-password-hint'}
                                            aria-invalid={errors.password ? 'true' : 'false'}
                                            className="auth-input-field auth-input-field-password auth-input-focus"
                                            placeholder={t('password')}
                                        />
                                        {/* Password Visibility Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? t('hide_password') : t('show_password')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 focus:text-emerald-600 rounded-sm"
                                        >
                                            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} id="register-password-error" />
                                </div>

                                {/* Password Confirmation Input */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="register-password-confirmation"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        {t('password_confirmation')}
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
                                            id="register-password-confirmation"
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            aria-describedby="register-password-hint"
                                            className="auth-input-field auth-input-field-password auth-input-focus"
                                            placeholder={t('password_confirmation')}
                                        />
                                        {/* Password Visibility Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                            aria-label={showPasswordConfirmation ? t('hide_password') : t('show_password')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 focus:text-emerald-600 rounded-sm"
                                        >
                                            {showPasswordConfirmation ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                                        </button>
                                    </div>
                                    {/* Password Requirements Hint */}
                                    <p id="register-password-hint" className="text-[10px] text-slate-500 font-mono">
                                        {t('password_requirements')}
                                    </p>
                                    <InputError message={errors.password_confirmation} id="register-password-confirmation-error" />
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="auth-submit-button"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner />
                                                <span>{t('creating_account')}</span>
                                            </>
                                        ) : (
                                            <>
                                                {t('complete_registration')} <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </Form>

                    {/* Login Link Section */}
                    <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                        <p className="text-sm text-slate-500">
                            {t('already_have_account')}{' '}
                            <Link
                                href={login()}
                                className="font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                            >
                                {t('log_in_here')}
                            </Link>
                        </p>
                    </div>
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
                            {t('terms_of_service')}
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
