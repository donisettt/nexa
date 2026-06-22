<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatusComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status_id',
        'parent_id',
        'content',
        'image_path',
    ];

    protected $with = ['user'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(StatusComment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(StatusComment::class, 'parent_id')->with('user');
    }
}
