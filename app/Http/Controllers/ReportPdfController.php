<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ReportPdfController extends Controller
{
    public function show(Request $request, Report $report): Response
    {
        abort_unless($report->user_id === $request->user()->id, 403);
        if ($report->publication_status !== 'released') {
            return response()->view('reports.not-released', [
                'message' => 'Report yet not Released',
            ], 403);
        }

        return $this->renderInlinePdf($report);
    }

    public function publicShow(Request $request, Report $report): Response
    {
        if ($report->publication_status !== 'released') {
            return response()->view('reports.not-released', [
                'message' => 'Report yet not Released',
            ], 403);
        }

        $headerFooterOverride = $request->query('header-footer');
        $forceHeaderFooter = $headerFooterOverride !== null
            ? (bool) filter_var($headerFooterOverride, FILTER_VALIDATE_BOOLEAN)
            : null;

        return $this->renderInlinePdf($report, $forceHeaderFooter);
    }

    public function bill(Request $request, Report $report): Response
    {
        abort_unless($report->user_id === $request->user()->id, 403);

        return $this->renderInlineBill($report);
    }

    public function publicBill(Report $report): Response
    {
        return $this->renderInlineBill($report);
    }

    private function renderInlinePdf(Report $report, ?bool $forceHeaderFooter = null): Response
    {
        $report->load(['items.investigation.department', 'user']);
        $clinic = $report->user;
        $includeHeaderFooter = $forceHeaderFooter === null
            ? (bool) $report->include_header_footer
            : (bool) $forceHeaderFooter;

        $groupedItems = $report->items
            ->groupBy(function ($item) {
                return $item->investigation?->department?->name ?: 'DEPARTMENT';
            })
            ->map(function ($items, $departmentName) {
                return [
                    'department' => $departmentName,
                    'items' => $items->values(),
                ];
            })
            ->values();

        $pdf = Pdf::loadView('pdf.report', [
            'report' => $report,
            'clinic' => $clinic,
            'groupedItems' => $groupedItems,
            'headerImage' => $includeHeaderFooter ? $this->toDataUri($clinic->report_header_image) : null,
            'footerImage' => $includeHeaderFooter ? $this->toDataUri($clinic->report_footer_image) : null,
            'logoImage' => $this->toDataUri($clinic->logo),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('report-'.$report->memo_number.'.pdf');
    }

    private function renderInlineBill(Report $report): Response
    {
        $report->load(['items.investigation', 'user']);
        $clinic = $report->user;

        $lineItems = $report->items->map(function ($item) {
            $amount = (float) ($item->amount ?? 0);

            return [
                'name' => $item->parameter_name,
                'unit' => $item->unit,
                'amount' => $amount,
            ];
        })->values();

        $subTotal = $lineItems->sum('amount');
        $qrPayload = route('reports.pdf', ['report' => $report->uuid]);

        $pdf = Pdf::loadView('pdf.bill', [
            'report' => $report,
            'clinic' => $clinic,
            'lineItems' => $lineItems,
            'subTotal' => $subTotal,
            'signatureImage' => $this->toDataUri($clinic->signature_image),
            'qrImage' => $this->generateQrDataUri($qrPayload),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('bill-'.$report->memo_number.'.pdf');
    }

    private function toDataUri(?string $path): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        $absolutePath = Storage::disk('public')->path($path);
        $mimeType = mime_content_type($absolutePath) ?: 'image/png';
        $contents = file_get_contents($absolutePath);

        if ($contents === false) {
            return null;
        }

        return sprintf('data:%s;base64,%s', $mimeType, base64_encode($contents));
    }

    private function generateQrDataUri(string $payload): ?string
    {
        $url = 'https://api.qrserver.com/v1/create-qr-code/?size=96x96&data='.rawurlencode($payload);
        $response = Http::timeout(10)->get($url);

        if (! $response->successful()) {
            return null;
        }

        return sprintf('data:image/png;base64,%s', base64_encode($response->body()));
    }
}
