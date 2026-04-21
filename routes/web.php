<?php

use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReportPdfController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('patients', [PatientController::class, 'index'])->name('patients.index');
    Route::post('patients', [PatientController::class, 'store'])->name('patients.store');
    Route::patch('patients/{patient}', [PatientController::class, 'update'])->name('patients.update');

    Route::get('departments', [DepartmentController::class, 'index'])->name('departments.index');
    Route::post('departments', [DepartmentController::class, 'store'])->name('departments.store');
    Route::patch('departments/{department}', [DepartmentController::class, 'update'])->name('departments.update');
    Route::post('departments/{department}/investigations', [DepartmentController::class, 'storeInvestigation'])->name('investigations.store');
    Route::patch('investigations/{investigation}', [DepartmentController::class, 'updateInvestigation'])->name('investigations.update');

    Route::get('reports/create-report', [ReportController::class, 'create'])->name('reports.create');
    Route::post('reports', [ReportController::class, 'store'])->name('reports.store');
    Route::get('reports/all-report', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/{report}', [ReportController::class, 'show'])->name('reports.show');
    Route::get('reports/{report}/pdf', [ReportPdfController::class, 'show'])->name('reports.pdf');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
