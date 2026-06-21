<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'gender' => ['nullable', 'string', Rule::in(['male', 'female', 'other'])],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'], // Max 2MB
        ]);

        $user->name = $validated['name'];
        $user->gender = $validated['gender'];

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => array_merge(
                $user->fresh()->toArray(),
                ['has_password' => ! is_null($user->fresh()->password)]
            ),
        ]);
    }

    /**
     * Update the user's password (requires current password).
     */
    public function password(Request $request)
    {
        $user = $request->user();

        // If user has no password (Google login), block this endpoint
        if (is_null($user->password)) {
            return response()->json([
                'message' => 'Gunakan endpoint set-password untuk membuat password pertama kali.',
            ], 422);
        }

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password berhasil diperbarui.',
        ]);
    }

    /**
     * Set a NEW password for users who logged in via Google (no password yet).
     */
    public function setPassword(Request $request)
    {
        $user = $request->user();

        // Only allow if user has no password yet
        if (! is_null($user->password)) {
            return response()->json([
                'message' => 'Akun ini sudah memiliki password. Gunakan fitur ubah password.',
            ], 422);
        }

        $validated = $request->validate([
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password berhasil dibuat. Sekarang Anda bisa login dengan email & password.',
            'has_password' => true,
        ]);
    }
}
