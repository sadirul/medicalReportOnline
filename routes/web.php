<?php

use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReportPdfController;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('reports/{report:uuid}/pdf', [ReportPdfController::class, 'publicShow'])->name('reports.pdf');
Route::get('reports/public/{report:uuid}/bill', [ReportPdfController::class, 'publicBill'])->name('reports.public.bill');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function (Request $request) {
        $user = $request->user();
        $currentYear = now()->year;
        $monthlyCounts = array_fill(1, 12, 0);

        $user->reports()
            ->select(['report_date', 'created_at'])
            ->get()
            ->each(function ($report) use (&$monthlyCounts, $currentYear): void {
                $date = $report->report_date ?? $report->created_at;

                if ($date && $date->year === $currentYear) {
                    $monthlyCounts[$date->month]++;
                }
            });

        $monthlyReports = collect(range(1, 12))
            ->map(fn (int $month): array => [
                'month' => Carbon::create()->month($month)->format('M'),
                'count' => $monthlyCounts[$month],
            ])
            ->values();

        return Inertia::render('dashboard', [
            'stats' => [
                'departments' => $user->departments()->count(),
                'total_reports' => $user->reports()->count(),
                'released_reports' => $user->reports()->where('publication_status', 'released')->count(),
                'unreleased_reports' => $user->reports()->where('publication_status', 'unpublished')->count(),
            ],
            'monthlyReports' => $monthlyReports,
            'currentYear' => $currentYear,
        ]);
    })->name('dashboard');

    Route::get('departments/create-department', [DepartmentController::class, 'create'])->name('departments.create');
    Route::get('departments/all-department', [DepartmentController::class, 'index'])->name('departments.index');
    Route::post('departments', [DepartmentController::class, 'store'])->name('departments.store');
    Route::patch('departments/{department}', [DepartmentController::class, 'update'])->name('departments.update');
    Route::get('departments/{department}', [DepartmentController::class, 'show'])->name('departments.show');
    Route::post('departments/{department}/investigations', [DepartmentController::class, 'storeInvestigation'])->name('investigations.store');
    Route::patch('investigations/{investigation}', [DepartmentController::class, 'updateInvestigation'])->name('investigations.update');

    Route::get('reports/create-report', [ReportController::class, 'create'])->name('reports.create');
    Route::post('reports', [ReportController::class, 'store'])->name('reports.store');
    Route::get('reports/all-report', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/{report}/edit', [ReportController::class, 'edit'])->name('reports.edit');
    Route::patch('reports/{report}', [ReportController::class, 'update'])->name('reports.update');
    Route::post('reports/{report}/release', [ReportController::class, 'release'])->name('reports.release');
    Route::get('reports/{report}', [ReportController::class, 'show'])->name('reports.show');
    Route::get('reports/{report}/bill', [ReportPdfController::class, 'bill'])->name('reports.bill');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
