<?php

use App\Http\Controllers\ClinicConnectionController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\RazorpayWebhookController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReportPdfController;
use App\Http\Controllers\SharedReportController;
use App\Http\Controllers\Superadmin\AuthController as SuperadminAuthController;
use App\Http\Controllers\Superadmin\ClinicController as SuperadminClinicController;
use App\Http\Controllers\Superadmin\PasswordController as SuperadminPasswordController;
use App\Http\Controllers\SubscriptionController;
use App\Models\SharedReport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('pricing', function () {
    $package = config('subscription.yearly_package');
    $amountRupees = (float) ($package['amount_rupees'] ?? 0);

    return Inertia::render('pricing', [
        'yearly_package' => [
            'amount_formatted' => number_format($amountRupees, 2, '.', ','),
            'currency' => $package['currency'] ?? 'INR',
            'label' => $package['label'] ?? 'Annual subscription',
        ],
    ]);
})->name('pricing');

Route::get('legal/privacy-policy', function () {
    return Inertia::render('legal/privacy-policy');
})->name('legal.privacy');

Route::get('legal/terms-and-conditions', function () {
    return Inertia::render('legal/terms-and-conditions');
})->name('legal.terms');

Route::get('legal/cookie-policy', function () {
    return Inertia::render('legal/cookie-policy');
})->name('legal.cookie');

Route::get('legal/refund-policy', function () {
    return Inertia::render('legal/refund-policy');
})->name('legal.refund');

Route::get('reports/{report:uuid}/pdf', [ReportPdfController::class, 'publicShow'])->name('reports.pdf');
Route::get('reports/public/{report:uuid}/bill', [ReportPdfController::class, 'publicBill'])->name('reports.public.bill');

Route::post('razorpay/webhook', [RazorpayWebhookController::class, 'handle'])->name('razorpay.webhook');

Route::prefix('superadmin')->name('superadmin.')->group(function () {
    Route::middleware('guest:superadmin')->group(function () {
        Route::get('login', [SuperadminAuthController::class, 'create'])->name('login');
        Route::post('login', [SuperadminAuthController::class, 'store'])->name('login.store');
    });

    Route::middleware('superadmin.auth')->group(function () {
        Route::get('/', [SuperadminClinicController::class, 'dashboard'])->name('dashboard');
        Route::get('transactions', [SuperadminClinicController::class, 'transactions'])->name('transactions.index');
        Route::get('settings/password', [SuperadminPasswordController::class, 'edit'])->name('password.edit');
        Route::put('settings/password', [SuperadminPasswordController::class, 'update'])->name('password.update');
        Route::post('settings/password/logout-other-devices', [SuperadminPasswordController::class, 'destroyOtherSessions'])->name('password.logout-other-devices');
        Route::get('clinics', [SuperadminClinicController::class, 'index'])->name('clinics.index');
        Route::get('clinics/{user}', [SuperadminClinicController::class, 'show'])->name('clinics.show');
        Route::post('clinics/{user}/sms/add', [SuperadminClinicController::class, 'addSms'])->name('clinics.sms.add');
        Route::post('clinics/{user}/expiry/update', [SuperadminClinicController::class, 'updateExpiryDatetime'])->name('clinics.expiry.update');
        Route::post('logout', [SuperadminAuthController::class, 'destroy'])->name('logout');
    });
});

Route::middleware(['auth', 'subscription.active'])->group(function () {
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
                'pending_sent_reports' => SharedReport::query()
                    ->where('sender_user_id', $user->id)
                    ->whereIn('status', ['sent', 'received'])
                    ->count(),
                'total_sent_reports' => SharedReport::query()
                    ->where('sender_user_id', $user->id)
                    ->count(),
                'published_sent_reports' => SharedReport::query()
                    ->where('sender_user_id', $user->id)
                    ->where('status', 'published')
                    ->count(),
                'pending_incoming_reports' => SharedReport::query()
                    ->where('receiver_user_id', $user->id)
                    ->whereIn('status', ['sent', 'received'])
                    ->count(),
                'total_incoming_reports' => SharedReport::query()
                    ->where('receiver_user_id', $user->id)
                    ->count(),
                'published_incoming_reports' => SharedReport::query()
                    ->where('receiver_user_id', $user->id)
                    ->where('status', 'published')
                    ->count(),
            ],
            'monthlyReports' => $monthlyReports,
            'currentYear' => $currentYear,
        ]);
    })->name('dashboard');

    Route::get('subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
    Route::post('subscription/order', [SubscriptionController::class, 'createOrder'])->name('subscription.order');
    Route::post('subscription/verify', [SubscriptionController::class, 'verify'])->name('subscription.verify');
    Route::post('subscription/failed', [SubscriptionController::class, 'markFailed'])->name('subscription.failed');

    Route::get('departments/create-department', [DepartmentController::class, 'create'])->name('departments.create');
    Route::get('departments/all-department', [DepartmentController::class, 'index'])->name('departments.index');
    Route::post('departments', [DepartmentController::class, 'store'])->name('departments.store');
    Route::patch('departments/{department}', [DepartmentController::class, 'update'])->name('departments.update');
    Route::get('departments/{department}', [DepartmentController::class, 'show'])->name('departments.show');
    Route::post('departments/{department}/investigations', [DepartmentController::class, 'storeInvestigation'])->name('investigations.store');
    Route::patch('investigations/{investigation}', [DepartmentController::class, 'updateInvestigation'])->name('investigations.update');

    Route::get('clinics/other-clinic', [ClinicConnectionController::class, 'index'])->name('clinics.other.index');
    Route::post('clinics/other-clinic/connect', [ClinicConnectionController::class, 'store'])->name('clinics.other.connect');
    Route::post('clinics/other-clinic/create-account', [ClinicConnectionController::class, 'createAccountAndConnect'])->name('clinics.other.create-account');
    Route::get('clinics/other-clinic/sent-report/create', [SharedReportController::class, 'createSentReport'])->name('clinics.sent.create');
    Route::post('clinics/other-clinic/sent-report', [SharedReportController::class, 'storeSentReport'])->name('clinics.sent.store');
    Route::get('clinics/other-clinic/catalog/{receiver}', [SharedReportController::class, 'fetchReceiverCatalog'])->name('clinics.sent.catalog');
    Route::get('clinics/other-clinic/requested-report', [SharedReportController::class, 'requestedIndex'])->name('clinics.requested.index');
    Route::get('clinics/other-clinic/client-report', [SharedReportController::class, 'clientIndex'])->name('clinics.client.index');
    Route::get('clinics/other-clinic/client-report/{sharedReport}', [SharedReportController::class, 'showClientReport'])->name('clinics.client.show');
    Route::get('clinics/other-clinic/client-report/{sharedReport}/edit', [SharedReportController::class, 'editClientReport'])->name('clinics.client.edit');
    Route::patch('clinics/other-clinic/client-report/{sharedReport}', [SharedReportController::class, 'updateClientReport'])->name('clinics.client.update');
    Route::post('clinics/other-clinic/client-report/{sharedReport}/publish', [SharedReportController::class, 'publishClientReport'])->name('clinics.client.publish');
    Route::get('clinics/other-clinic/shared-report/{sharedReport:uuid}/pdf', [SharedReportController::class, 'downloadPdf'])->name('clinics.shared.pdf');
    Route::get('clinics/other-clinic/shared-report/{sharedReport:uuid}/bill', [SharedReportController::class, 'downloadBill'])->name('clinics.shared.bill');

    Route::get('reports/create-report', [ReportController::class, 'create'])->name('reports.create');
    Route::post('reports', [ReportController::class, 'store'])->name('reports.store');
    Route::get('reports/all-report', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/{report}/edit', [ReportController::class, 'edit'])->name('reports.edit');
    Route::patch('reports/{report}', [ReportController::class, 'update'])->name('reports.update');
    Route::post('reports/{report}/release', [ReportController::class, 'release'])->name('reports.release');
    Route::post('reports/{report}/send-whatsapp', [ReportController::class, 'sendWhatsApp'])->name('reports.send-whatsapp');
    Route::get('reports/{report}', [ReportController::class, 'show'])->name('reports.show');
    Route::get('reports/{report}/bill', [ReportPdfController::class, 'bill'])->name('reports.bill');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
