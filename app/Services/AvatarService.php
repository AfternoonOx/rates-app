<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class AvatarService
{
    private const string BASE_URL = 'https://ui-avatars.com/api/';

    /**
     * Generate avatar URL for a user.
     *
     * @param  array<string, mixed>  $options
     */
    public function getAvatarUrl(User $user, array $options = []): string
    {
        // If user has uploaded avatar, return storage URL
        if ($user->avatar_path) {
            return Storage::url($user->avatar_path);
        }

        $defaults = [
            'name' => $user->full_name,
            'size' => 128,
            'background' => 'random',
            'color' => 'fff',
            'bold' => true,
            'format' => 'svg',
            'rounded' => false,
        ];

        $params = array_merge($defaults, $options);

        return self::BASE_URL.'?'.http_build_query($params);
    }

    /**
     * Generate avatar URL from a name string.
     *
     * @param  array<string, mixed>  $options
     */
    public function getAvatarUrlFromName(string $name, array $options = []): string
    {
        $defaults = [
            'name' => $name,
            'size' => 128,
            'background' => 'random',
            'color' => 'fff',
            'bold' => true,
            'format' => 'svg',
            'rounded' => false,
        ];

        $params = array_merge($defaults, $options);

        return self::BASE_URL.'?'.http_build_query($params);
    }

    /**
     * Upload and store a user avatar.
     */
    public function uploadAvatar(User $user, UploadedFile $file): string
    {
        // Delete old avatar if exists
        if ($user->avatar_path) {
            $this->deleteAvatar($user);
        }

        // Generate unique filename
        $filename = 'avatar_'.$user->id.'_'.time().'.'.$file->getClientOriginalExtension();
        $path = 'avatars/'.$filename;

        // Create image manager instance
        $manager = new ImageManager(new Driver);

        // Read and resize image to 128x128
        $image = $manager->read($file->getRealPath());
        $image->cover(128, 128);

        // Convert to desired format (keep original or convert to jpg)
        $encodedImage = $image->toJpeg(90);

        // Store in public disk
        Storage::disk('public')->put($path, (string) $encodedImage);

        // Update user avatar_path
        $user->update(['avatar_path' => $path]);

        return $path;
    }

    /**
     * Delete a user's avatar.
     */
    public function deleteAvatar(User $user): void
    {
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->update(['avatar_path' => null]);
    }
}
