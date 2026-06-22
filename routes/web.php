<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\Matching\MatchingController;
use Illuminate\Support\Facades\Route;

Route::get('/auth/me', [AuthController::class, 'me'])->name('auth.me');

Route::middleware('guest')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.login');
    Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');
});

Route::post('/auth/logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('auth.logout');

Route::middleware('auth')->group(function () {
    Route::post('/profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/password', [\App\Http\Controllers\ProfileController::class, 'password'])->name('profile.password');
    Route::post('/profile/set-password', [\App\Http\Controllers\ProfileController::class, 'setPassword'])->name('profile.set-password');
    Route::get('/matching/status', [MatchingController::class, 'status'])->name('matching.status');
    Route::post('/matching/start', [MatchingController::class, 'start'])->name('matching.start');
    Route::post('/matching/cancel', [MatchingController::class, 'cancel'])->name('matching.cancel');
    Route::post('/matching/{matchSession}/end', [MatchingController::class, 'end'])->name('matching.end');
    Route::get('/matching/{matchSession}/messages', [\App\Http\Controllers\ChatController::class, 'index'])->name('matching.messages.index');
    Route::post('/matching/{matchSession}/messages', [\App\Http\Controllers\ChatController::class, 'store'])->name('matching.messages.store');
    Route::get('/friends', [FriendController::class, 'index'])->name('friends.index');
    Route::get('/friends/recommendations', [FriendController::class, 'recommendations'])->name('friends.recommendations');
    Route::post('/friends/update-location', [FriendController::class, 'updateLocation'])->name('friends.update-location');
    Route::post('/friends/request', [FriendController::class, 'sendRequest'])->name('friends.send-request');
    Route::post('/matching/{matchSession}/friend-request', [FriendController::class, 'requestFromMatch'])->name('friends.request-from-match');
    Route::post('/friends/{friendship}/accept', [FriendController::class, 'accept'])->name('friends.accept');
    Route::post('/friends/{friendship}/reject', [FriendController::class, 'reject'])->name('friends.reject');
    Route::post('/friends/{friendship}/chat', [FriendController::class, 'chat'])->name('friends.chat');
    Route::post('/matching/{matchSession}/call-signal', [\App\Http\Controllers\CallController::class, 'signal'])->name('call.signal');
    
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::post('/notifications/{id}/mark-read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');

    // Status / Timeline Routes
    Route::get('/statuses', [\App\Http\Controllers\StatusController::class, 'index'])->name('statuses.index');
    Route::post('/statuses', [\App\Http\Controllers\StatusController::class, 'store'])->name('statuses.store');
    Route::delete('/statuses/{status}', [\App\Http\Controllers\StatusController::class, 'destroy'])->name('statuses.destroy');
    Route::post('/statuses/{status}/like', [\App\Http\Controllers\StatusLikeController::class, 'toggle'])->name('statuses.like.toggle');
    Route::post('/statuses/{status}/share', [\App\Http\Controllers\StatusShareController::class, 'store'])->name('statuses.share.store');
    Route::get('/statuses/{status}/comments', [\App\Http\Controllers\StatusCommentController::class, 'index'])->name('statuses.comments.index');
    Route::post('/statuses/{status}/comments', [\App\Http\Controllers\StatusCommentController::class, 'store'])->name('statuses.comments.store');
    Route::delete('/statuses/comments/{comment}', [\App\Http\Controllers\StatusCommentController::class, 'destroy'])->name('statuses.comments.destroy');
});

Route::view('/', 'app')->name('welcome');
Route::view('/login', 'app')->name('login');
Route::view('/register', 'app')->name('register');
Route::view('/dashboard', 'app')->name('dashboard');

Route::view('/{path?}', 'app')
    ->where('path', '.*')
    ->name('app');
