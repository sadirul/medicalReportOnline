<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ReportPdfController extends Controller
{
    public function show(Request $request, Report $report): Response
    {
        abort_unless($report->user_id === $request->user()->id, 403);

        $report->load(['items.investigation.department', 'user']);
        $clinic = $report->user;

        $toDataUri = static function (?string $path): ?string {
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
        };

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
            'headerImage' => $toDataUri($clinic->report_header_image),
            'footerImage' => $toDataUri($clinic->report_footer_image),
            'logoImage' => $toDataUri($clinic->logo),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('report-'.$report->id.'.pdf');
    }
}
