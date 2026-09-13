<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'SAPA Trans Jogja Backend API is running'
    ]);
});

Route::get('/map', function () {
    return response()
        ->view('map')
        ->header('X-Frame-Options', 'ALLOWALL');
});
