<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\RenewTransaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ClinicController extends Controller
{
    public function dashboard(): Response
    {
        $currentYear = now()->year;
        $totalEarningThisYear = (float) RenewTransaction::query()
            ->where('status', RenewTransaction::STATUS_CAPTURED)
            ->whereYear('created_at', $currentYear)
            ->sum('amount');
        $latestTransactions = RenewTransaction::query()
            ->with('user:id,clinic_name,full_name')
            ->latest()
            ->limit(15)
            ->get()
            ->map(function (RenewTransaction $transaction): array {
                return [
                    'id' => $transaction->id,
                    'clinic_id' => $transaction->user_id,
                    'clinic_name' => $transaction->user?->clinic_name ?? $transaction->user?->full_name ?? '-',
                    'amount' => number_format((float) $transaction->amount, 2, '.', ','),
                    'status' => $transaction->status,
                    'currency' => $transaction->currency ?? 'INR',
                    'transaction_id' => $transaction->transaction_id ?: ($transaction->razorpay_payment_id ?: '-'),
                    'created_at' => optional($transaction->created_at)?->toDateTimeString(),
                ];
            })
            ->values();

        return Inertia::render('superadmin/dashboard', [
            'stats' => [
                'clinics_count' => User::query()->count(),
                'total_earning_this_year' => $totalEarningThisYear,
                'total_earning_this_year_formatted' => number_format($totalEarningThisYear, 2, '.', ','),
                'current_year' => $currentYear,
            ],
            'latestTransactions' => $latestTransactions,
        ]);
    }

    public function transactions(Request $request): Response
    {
        $filters = $request->validate([
            'clinic_id' => ['nullable', 'integer', 'exists:users,id'],
            'order_id' => ['nullable', 'string', 'max:255'],
            'transaction_id' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:created,captured,failed'],
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date'],
        ]);

        $query = RenewTransaction::query()->with('user:id,clinic_name,full_name');

        if (! empty($filters['clinic_id'])) {
            $query->where('user_id', (int) $filters['clinic_id']);
        }

        if (! empty($filters['order_id'])) {
            $query->where('razorpay_order_id', 'like', '%'.trim($filters['order_id']).'%');
        }

        if (! empty($filters['transaction_id'])) {
            $tx = trim($filters['transaction_id']);
            $query->where(function ($sub) use ($tx): void {
                $sub->where('transaction_id', 'like', "%{$tx}%")
                    ->orWhere('razorpay_payment_id', 'like', "%{$tx}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        $transactions = $query
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(function (RenewTransaction $transaction): array {
                return [
                    'id' => $transaction->id,
                    'clinic_id' => $transaction->user_id,
                    'clinic_name' => $transaction->user?->clinic_name ?? $transaction->user?->full_name ?? '-',
                    'order_id' => $transaction->razorpay_order_id ?? '-',
                    'transaction_id' => $transaction->transaction_id ?: ($transaction->razorpay_payment_id ?: '-'),
                    'amount' => number_format((float) $transaction->amount, 2, '.', ','),
                    'status' => $transaction->status,
                    'created_at' => optional($transaction->created_at)?->toDateTimeString(),
                ];
            });

        $clinics = User::query()
            ->select(['id', 'clinic_name', 'full_name'])
            ->orderBy('clinic_name')
            ->get()
            ->map(fn (User $clinic): array => [
                'id' => $clinic->id,
                'name' => $clinic->clinic_name ?: $clinic->full_name,
            ])
            ->values();

        return Inertia::render('superadmin/transactions/index', [
            'transactions' => $transactions,
            'clinics' => $clinics,
            'filters' => [
                'clinic_id' => isset($filters['clinic_id']) ? (string) $filters['clinic_id'] : '',
                'order_id' => $filters['order_id'] ?? '',
                'transaction_id' => $filters['transaction_id'] ?? '',
                'status' => $filters['status'] ?? '',
                'from_date' => $filters['from_date'] ?? '',
                'to_date' => $filters['to_date'] ?? '',
            ],
        ]);
    }

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', 'in:active,expired'],
            'q' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'in:newest,oldest,name_asc,name_desc'],
        ]);

        $query = User::query()
            ->select([
                'id',
                'unique_clinic_id',
                'clinic_name',
                'full_name',
                'mobile',
                'sms_balance',
                'expiry_datetime',
                'created_at',
            ]);

        if (! empty($filters['status'])) {
            if ($filters['status'] === 'expired') {
                $query->whereNotNull('expiry_datetime')->where('expiry_datetime', '<', now());
            } else {
                $query->where(function ($subQuery): void {
                    $subQuery->whereNull('expiry_datetime')->orWhere('expiry_datetime', '>=', now());
                });
            }
        }

        if (! empty($filters['q'])) {
            $search = trim($filters['q']);
            $query->where(function ($subQuery) use ($search): void {
                $subQuery->where('clinic_name', 'like', "%{$search}%")
                    ->orWhere('unique_clinic_id', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        match ($filters['sort'] ?? 'newest') {
            'oldest' => $query->orderBy('created_at'),
            'name_asc' => $query->orderBy('clinic_name'),
            'name_desc' => $query->orderByDesc('clinic_name'),
            default => $query->orderByDesc('created_at'),
        };

        $clinics = $query
            ->paginate(15)
            ->withQueryString()
            ->through(function (User $clinic): array {
                $isExpired = $clinic->expiry_datetime !== null && $clinic->expiry_datetime->isPast();

                return [
                    'id' => $clinic->id,
                    'unique_clinic_id' => $clinic->unique_clinic_id,
                    'clinic_name' => $clinic->clinic_name,
                    'full_name' => $clinic->full_name,
                    'mobile' => $clinic->mobile,
                    'sms_balance' => (int) ($clinic->sms_balance ?? 0),
                    'created_at' => optional($clinic->created_at)?->toDateString(),
                    'expiry_datetime' => optional($clinic->expiry_datetime)?->toDateTimeString(),
                    'status' => $isExpired ? 'expired' : 'active',
                ];
            });

        return Inertia::render('superadmin/clinics/index', [
            'clinics' => $clinics,
            'filters' => [
                'status' => $filters['status'] ?? '',
                'q' => $filters['q'] ?? '',
                'sort' => $filters['sort'] ?? 'newest',
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $stats = [
            'reports_count' => $user->reports()->count(),
            'sent_reports_count' => $user->sentSharedReports()->count(),
            'received_reports_count' => $user->receivedSharedReports()->count(),
            'initiated_connections_count' => $user->initiatedClinicConnections()->count(),
            'received_connections_count' => $user->receivedClinicConnections()->count(),
            'total_connections_count' => $user->initiatedClinicConnections()->count() + $user->receivedClinicConnections()->count(),
        ];
        $transactions = RenewTransaction::query()
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function (RenewTransaction $transaction): array {
                return [
                    'id' => $transaction->id,
                    'amount' => number_format((float) $transaction->amount, 2, '.', ','),
                    'status' => $transaction->status,
                    'currency' => $transaction->currency ?? 'INR',
                    'transaction_id' => $transaction->transaction_id ?: ($transaction->razorpay_payment_id ?: '-'),
                    'created_at' => optional($transaction->created_at)?->toDateTimeString(),
                ];
            })
            ->values();

        return Inertia::render('superadmin/clinics/show', [
            'clinic' => [
                'id' => $user->id,
                'unique_clinic_id' => $user->unique_clinic_id,
                'clinic_name' => $user->clinic_name,
                'full_name' => $user->full_name,
                'mobile' => $user->mobile,
                'email' => $user->email,
                'address' => $user->address,
                'sms_balance' => (int) ($user->sms_balance ?? 0),
                'status' => $user->isSubscriptionExpired() ? 'expired' : 'active',
                'expiry_datetime' => optional($user->expiry_datetime)?->toDateTimeString(),
                'created_at' => optional($user->created_at)?->toDateTimeString(),
                'updated_at' => optional($user->updated_at)?->toDateTimeString(),
            ],
            'stats' => $stats,
            'transactions' => $transactions,
        ]);
    }

    public function addSms(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'sms_count' => ['required', 'integer', 'min:1', 'max:1000000'],
        ]);

        DB::transaction(function () use ($validated, $user): void {
            User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail()->increment('sms_balance', $validated['sms_count']);
        });

        return back()->with([
            'status' => "Added {$validated['sms_count']} SMS successfully.",
            'status_type' => 'success',
        ]);
    }

    public function updateExpiryDatetime(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'expiry_datetime' => ['required', 'date'],
        ]);

        $expiryDatetime = Carbon::parse($validated['expiry_datetime']);

        $user->update([
            'expiry_datetime' => $expiryDatetime,
        ]);

        return back()->with([
            'status' => 'Clinic expiry datetime updated successfully.',
            'status_type' => 'success',
        ]);
    }
}
