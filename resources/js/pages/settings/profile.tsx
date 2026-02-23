import { Form, usePage } from '@inertiajs/react';
import {
    Camera,
    CheckCircle2,
    Lock,
    Mail,
    Save,
    ShieldAlert,
    User,
} from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { SEO } from '@/components/seo';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/hooks/use-i18n';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { destroy, edit, update } from '@/routes/profile';
import type { BreadcrumbItem, SharedData } from '@/types';

/**
 * User profile settings page.
 * Includes personal info, password update, and account deletion.
 */
export default function Profile({
    status,
}: {
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const { t } = useI18n();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard'),
            href: dashboard().url,
        },
        {
            title: t('settings'),
            href: edit().url,
        },
    ];

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setAvatarPreview(null);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const getInitials = () => {
        const first = (auth.user.first_name ?? '').trim();
        const last = (auth.user.last_name ?? '').trim();
        const initials = `${first[0] ?? ''}${last[0] ?? ''}`.trim();
        return (initials || 'U').toUpperCase();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SEO
                title={t('profile_settings')}
                description={t('profile_settings_desc')}
                noindex
                nofollow
            />

            <div className="mx-auto w-full max-w-[1600px] space-y-8 p-6 lg:p-8">
                {/* Page Title */}
                <div>
                    <h1 className="font-serif-tech text-2xl font-medium text-slate-900">
                        {t('profile_settings')}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {t('profile_settings_desc')}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* CARD 1: Personal Information */}
                    <div className="profile-card overflow-hidden p-0">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
                            <div>
                                <h2 className="flex items-center gap-2 font-medium text-slate-900">
                                    <User size={18} className="text-emerald-700" aria-hidden="true" />
                                    {t('profile_information')}
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    {t('update_name_and_email')}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="flex flex-col gap-8 md:flex-row">
                                {/* Avatar Section */}
                                <div className="flex flex-col items-center gap-3">
                                    <button
                                        type="button"
                                        className="profile-avatar-upload group focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600 rounded-full"
                                        onClick={() => avatarInputRef.current?.click()}
                                        aria-label={t('change_avatar')}
                                    >
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar preview"
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <>
                                                {auth.user.avatar ? (
                                                    <img
                                                        src={auth.user.avatar}
                                                        alt={`${auth.user.first_name} ${auth.user.last_name}`}
                                                        className="h-full w-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-2xl font-bold text-slate-400">
                                                        {getInitials()}
                                                    </span>
                                                )}
                                            </>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="profile-avatar-upload-overlay" aria-hidden="true">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="text-xs font-medium text-emerald-700 hover:text-emerald-800 focus:outline-2 focus:outline-offset-1 focus:outline-emerald-600 rounded-sm"
                                    >
                                        {t('change_avatar')}
                                    </button>
                                </div>

                                {/* Form Section */}
                                <Form
                                    {...update()}
                                    encType="multipart/form-data"
                                    options={{
                                        preserveScroll: true,
                                    }}
                                    className="flex-1 space-y-6"
                                >
                                    {({ processing, recentlySuccessful, errors }) => (
                                        <>
                                            <input
                                                ref={avatarInputRef}
                                                type="file"
                                                name="avatar"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                                aria-label={t('change_avatar')}
                                            />

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-1.5">
                                                    <Label
                                                        htmlFor="first_name"
                                                        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                                                    >
                                                        {t('first_name')}
                                                    </Label>
                                                    <Input
                                                        id="first_name"
                                                        name="first_name"
                                                        defaultValue={auth.user.first_name}
                                                        required
                                                        autoComplete="given-name"
                                                        className="profile-input"
                                                        aria-invalid={
                                                            errors.first_name ? 'true' : 'false'
                                                        }
                                                        aria-describedby={errors.first_name ? 'first-name-error' : undefined}
                                                    />
                                                    <InputError message={errors.first_name} id="first-name-error" />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label
                                                        htmlFor="last_name"
                                                        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                                                    >
                                                        {t('last_name')}
                                                    </Label>
                                                    <Input
                                                        id="last_name"
                                                        name="last_name"
                                                        defaultValue={auth.user.last_name}
                                                        required
                                                        autoComplete="family-name"
                                                        className="profile-input"
                                                        aria-invalid={
                                                            errors.last_name ? 'true' : 'false'
                                                        }
                                                        aria-describedby={errors.last_name ? 'last-name-error' : undefined}
                                                    />
                                                    <InputError message={errors.last_name} id="last-name-error" />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="nickname"
                                                    className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                                                >
                                                    {t('nickname')} / {t('display_name')}
                                                </Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true">
                                                        @
                                                    </span>
                                                    <Input
                                                        id="nickname"
                                                        name="nickname"
                                                        defaultValue={auth.user.nickname}
                                                        required
                                                        autoComplete="nickname"
                                                        className="profile-input-with-icon"
                                                        aria-invalid={
                                                            errors.nickname ? 'true' : 'false'
                                                        }
                                                        aria-describedby={errors.nickname ? 'nickname-error nickname-hint' : 'nickname-hint'}
                                                    />
                                                </div>
                                                <p id="nickname-hint" className="text-[10px] text-slate-500">{t('nickname_help_text')}</p>
                                                <InputError message={errors.nickname} id="nickname-error" />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="email"
                                                    className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                                                >
                                                    {t('email_address')}
                                                </Label>
                                                <div className="relative">
                                                    <Mail
                                                        size={16}
                                                        className="absolute left-3 top-2.5 text-slate-400"
                                                        aria-hidden="true"
                                                    />
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        defaultValue={auth.user.email}
                                                        required
                                                        autoComplete="username"
                                                        className="profile-input-with-icon"
                                                        aria-invalid={
                                                            errors.email ? 'true' : 'false'
                                                        }
                                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                                    />
                                                </div>
                                                <InputError message={errors.email} id="email-error" />
                                            </div>

                                            <div className="flex items-center gap-4 pt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="flex items-center gap-2 rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-900 disabled:opacity-70"
                                                >
                                                    {processing ? (
                                                        t('saving')
                                                    ) : (
                                                        <>
                                                            <Save size={16} aria-hidden="true" /> {t('save_changes')}
                                                        </>
                                                    )}
                                                </Button>

                                                {(recentlySuccessful ||
                                                    status === 'profile-updated') && (
                                                        <span className="save-status-success" role="status" aria-live="polite">
                                                            <CheckCircle2 size={16} aria-hidden="true" /> {t('saved_successfully')}
                                                        </span>
                                                    )}
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </div>
                        </div>
                    </div>

                    {/* Security & Danger Zone Row */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* CARD 2: Security */}
                        <div className="profile-card overflow-hidden p-0">
                            <div className="border-b border-slate-100 bg-slate-50/50 p-6">
                                <h2 className="flex items-center gap-2 font-medium text-slate-900">
                                    <Lock size={18} className="text-emerald-700" aria-hidden="true" />
                                    {t('security')}
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    {t('security_desc')}
                                </p>
                            </div>

                            <div className="p-6 md:p-8">
                                <Form
                                    method="put"
                                    action="/settings/profile/password"
                                    options={{
                                        preserveScroll: true,
                                    }}
                                    className="max-w-md space-y-6"
                                >
                                    {({ processing, recentlySuccessful, errors }) => (
                                        <>
                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="current_password"
                                                    className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                                                >
                                                    {t('current_password')}
                                                </Label>
                                                <Input
                                                    id="current_password"
                                                    name="current_password"
                                                    type="password"
                                                    className="profile-input"
                                                    autoComplete="current-password"
                                                    aria-invalid={
                                                        errors.current_password ? 'true' : 'false'
                                                    }
                                                    aria-describedby={errors.current_password ? 'current-password-error' : undefined}
                                                />
                                                <InputError message={errors.current_password} id="current-password-error" />
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-1.5">
                                                    <Label
                                                        htmlFor="new_password"
                                                        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                                                    >
                                                        {t('new_password')}
                                                    </Label>
                                                    <Input
                                                        id="new_password"
                                                        name="password"
                                                        type="password"
                                                        className="profile-input"
                                                        autoComplete="new-password"
                                                        aria-invalid={
                                                            errors.password ? 'true' : 'false'
                                                        }
                                                        aria-describedby={errors.password ? 'new-password-error' : undefined}
                                                    />
                                                    <InputError message={errors.password} id="new-password-error" />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label
                                                        htmlFor="password_confirmation"
                                                        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                                                    >
                                                        {t('password_confirmation')}
                                                    </Label>
                                                    <Input
                                                        id="password_confirmation"
                                                        name="password_confirmation"
                                                        type="password"
                                                        className="profile-input"
                                                        autoComplete="new-password"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 pt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    variant="outline"
                                                    className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-700"
                                                >
                                                    {processing ? t('updating') : t('update_password')}
                                                </Button>

                                                {(recentlySuccessful ||
                                                    status === 'password-updated') && (
                                                        <span className="save-status-success" role="status" aria-live="polite">
                                                            <CheckCircle2 size={16} aria-hidden="true" /> {t('password_updated')}
                                                        </span>
                                                    )}
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </div>
                        </div>

                        {/* CARD 3: Danger Zone */}
                        <div className="profile-card overflow-hidden border-rose-100 p-0">
                            <div className="border-b border-rose-100 bg-rose-50/30 p-6">
                                <h2 className="flex items-center gap-2 font-medium text-rose-900">
                                    <ShieldAlert size={18} className="text-rose-600" aria-hidden="true" />
                                    {t('danger_zone')}
                                </h2>
                            </div>

                            <div className="flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-8">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900">
                                        {t('delete_account')}
                                    </h3>
                                    <p className="mt-1 max-w-md text-sm text-slate-500">
                                        {t('once_deleted_all_resources')}
                                    </p>
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="whitespace-nowrap rounded-lg border border-rose-200 bg-white px-5 py-2.5 text-sm font-medium text-rose-600 transition-all hover:bg-rose-50 hover:text-rose-700"
                                        >
                                            {t('delete_account')}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogTitle>
                                            {t('are_you_sure_delete_account')}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {t('once_deleted_permanently')}
                                        </DialogDescription>

                                        <Form
                                            {...destroy()}
                                            options={{
                                                preserveScroll: true,
                                            }}
                                            onError={() => passwordInput.current?.focus()}
                                            resetOnSuccess
                                            className="space-y-6"
                                        >
                                            {({ resetAndClearErrors, processing, errors }) => (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="delete-account-password" className="sr-only">
                                                            {t('password')}
                                                        </Label>

                                                        <Input
                                                            id="delete-account-password"
                                                            type="password"
                                                            name="password"
                                                            ref={passwordInput}
                                                            placeholder={t('password')}
                                                            autoComplete="current-password"
                                                            aria-describedby={errors.password ? 'delete-password-error' : undefined}
                                                        />

                                                        <InputError message={errors.password} id="delete-password-error" />
                                                    </div>

                                                    <DialogFooter className="gap-2">
                                                        <DialogClose asChild>
                                                            <Button
                                                                variant="secondary"
                                                                onClick={() => resetAndClearErrors()}
                                                            >
                                                                {t('cancel')}
                                                            </Button>
                                                        </DialogClose>

                                                        <Button
                                                            variant="destructive"
                                                            disabled={processing}
                                                            asChild
                                                        >
                                                            <button type="submit">{t('delete_account')}</button>
                                                        </Button>
                                                    </DialogFooter>
                                                </>
                                            )}
                                        </Form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
