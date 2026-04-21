<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Lab Report</title>
    <style>
        @page {
            margin: 140px 40px 120px 40px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            color: #111827;
            font-size: 12px;
        }

        .header {
            position: fixed;
            top: -120px;
            left: 0;
            right: 0;
            height: 100px;
        }

        .footer {
            position: fixed;
            bottom: -100px;
            left: 0;
            right: 0;
            height: 85px;
            font-size: 10px;
            color: #4b5563;
        }

        .banner {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .clinic-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }

        .clinic-col {
            display: table-cell;
            vertical-align: top;
            width: 50%;
            padding: 0 5px;
        }

        .meta-table {
            width: 100%;
            margin: 12px 0;
            font-size: 11px;
        }

        .meta-table td {
            padding: 4px 6px;
        }

        .section-title {
            font-weight: bold;
            text-transform: uppercase;
            margin: 10px 0 14px;
            text-align: center;
            text-decoration: underline;
        }

        .columns-head {
            font-size: 12px;
            font-weight: 700;
            text-decoration: underline;
            margin-bottom: 8px;
        }

        .result-block {
            padding: 3px 0;
        }

        .result-line {
            font-size: 12px;
            line-height: 1.35;
        }

        .investigation {
            display: inline-block;
            width: 42%;
            vertical-align: top;
        }

        .result {
            display: inline-block;
            width: 22%;
            vertical-align: top;
        }

        .interval {
            display: inline-block;
            width: 34%;
            vertical-align: top;
        }

        .department-page {
            page-break-after: always;
        }

        .department-page:last-of-type {
            page-break-after: auto;
        }

        .note-line {
            margin-top: 10px;
            font-size: 11px;
            line-height: 1.35;
        }

        .note {
            margin-top: 8px;
            font-size: 10px;
            color: #4b5563;
            line-height: 1.4;
        }

        .page-number {
            text-align: right;
            margin-top: 6px;
        }
    </style>
</head>
<body>
<div class="header">
    <!-- Intentionally blank: reserved top space only -->
</div>

<div class="footer">
    <!-- Intentionally blank: reserved bottom space only -->
</div>

@foreach($groupedItems as $group)
    <div class="department-page">
        <table class="meta-table">
            <tr>
                <td><strong>Patient Name:</strong> {{ $patient->name }}</td>
                <td><strong>V.Id:</strong> {{ $patient->v_id }}</td>
            </tr>
            <tr>
                <td><strong>Age/Sex:</strong> {{ $patient->age }} Y / {{ $patient->sex }}</td>
                <td><strong>Billing Date:</strong> {{ $report->billing_date->format('d/M/Y h:i A') }}</td>
            </tr>
            <tr>
                <td><strong>Address:</strong> {{ $patient->address ?: '-' }}</td>
                <td><strong>Collection Date:</strong> {{ $report->collection_date->format('d/M/Y h:i A') }}</td>
            </tr>
            <tr>
                <td><strong>Referred By:</strong> {{ $patient->referred_by ?: '-' }}</td>
                <td><strong>Report Date:</strong> {{ $report->report_date->format('d/M/Y h:i A') }}</td>
            </tr>
        </table>

        <div class="section-title">DEPARTMENT OF {{ strtoupper($group['department']) }}</div>

        <div class="columns-head">
            <span class="investigation">INVESTIGATION</span>
            <span class="result">RESULT</span>
            <span class="interval">BIOLOGICAL REFERENCE INTERVAL</span>
        </div>

        @foreach($group['items'] as $item)
            <div class="result-block">
                <div class="result-line">
                    <span class="investigation">{{ $item->parameter_name }}</span>
                    <span class="result">{{ trim(($item->value ?: '-') . ' ' . ($item->unit ?: '')) }}</span>
                    <span class="interval">{{ $item->bio_ref_interval ?: '-' }}</span>
                </div>
            </div>
        @endforeach
    </div>
@endforeach

@if($report->sample_note || $report->equipment_note || $report->interpretation_note)
    <div class="note">
        @if($report->sample_note)
            <div class="note-line"><strong>NOTE ::</strong> {{ $report->sample_note }}</div>
        @endif
        @if($report->equipment_note)
            <div class="note-line"><strong>NOTE ::</strong> {{ $report->equipment_note }}</div>
        @endif
        @if($report->interpretation_note)
            <div class="note-line"><strong>Comments :</strong> {{ $report->interpretation_note }}</div>
        @endif
    </div>
@endif
</body>
</html>
