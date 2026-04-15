<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('reports/create-report', function () {
        return Inertia::render('reports/create-report');
    })->name('reports.create');

    Route::get('reports/all-report', function () {
        return Inertia::render('reports/all-report');
    })->name('reports.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
