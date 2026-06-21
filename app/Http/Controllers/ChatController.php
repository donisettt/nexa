<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\MatchSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ChatController extends Controller
{
    public function index(Request $request, MatchSession $matchSession)
    {
        $user = $request->user();

        // Check if user is part of the match session
        abort_unless(
            in_array((int) $user->id, [(int) $matchSession->initiator_id, (int) $matchSession->partner_id]),
            403
        );

        $messages = $matchSession->messages()->with('user')->orderBy('created_at', 'asc')->get();

        return response()->json($messages);
    }

    public function store(Request $request, MatchSession $matchSession)
    {
        $user = $request->user();

        // Check if user is part of the match session and session is active
        abort_unless(
            $matchSession->status === 'active' &&
            in_array((int) $user->id, [(int) $matchSession->initiator_id, (int) $matchSession->partner_id]),
            403
        );

        $validated = $request->validate([
            'content'  => 'nullable|string|max:2000',
            'file'     => 'nullable|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,txt,zip',
        ]);

        // Must have at least content or file
        if (empty($validated['content']) && ! $request->hasFile('file')) {
            return response()->json(['message' => 'Pesan atau file wajib diisi.'], 422);
        }

        $filePath = null;
        $fileType = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $file     = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $mime     = $file->getMimeType();
            $fileType = str_starts_with($mime, 'image/') ? 'image' : 'file';
            $filePath = $file->store('chat-files', 'public');
        }

        $message = $matchSession->messages()->create([
            'user_id'   => $user->id,
            'content'   => $validated['content'] ?? null,
            'file_path' => $filePath,
            'file_type' => $fileType,
            'file_name' => $fileName,
        ]);

        // Eager load user so frontend has name/id
        $message->load('user');

        try {
            broadcast(new MessageSent($message))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('MessageSent broadcast failed', [
                'match_id' => $matchSession->id,
                'message_id' => $message->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json($message);
    }
}
