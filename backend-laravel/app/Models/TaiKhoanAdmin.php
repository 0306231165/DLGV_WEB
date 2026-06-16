<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaiKhoanAdmin extends Model
{
    protected $table = 'TaiKhoanAdmin';
    public $timestamps = false;
    protected $guarded = ['id'];
}
