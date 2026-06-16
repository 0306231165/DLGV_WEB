<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class TaiKhoanAdmin extends Model
{
    use HasApiTokens;
    protected $table = 'TaiKhoanAdmin';
    public $timestamps = false;
    protected $guarded = ['id'];
}
