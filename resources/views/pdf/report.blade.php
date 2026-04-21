<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Lab Report</title>
    <style>
        @page {
            margin: 0;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            color: #111827;
            font-size: 12px;
            margin: 0;
            padding: 0;
        }

        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 100px;
        }

        .footer {
            position: fixed;
            bottom: 0;
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

        .content {
            margin: 100px 40px 105px 40px;
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
    @if(!empty($headerImage))
        <img src="{{ $headerImage }}" alt="Report Header" class="banner">
    @endif
</div>

<div class="footer">
    @if(!empty($footerImage))
        <img src="{{ $footerImage }}" alt="Report Footer" class="banner">
    @endif
</div>

<div class="content">
@foreach($groupedItems as $group)
    <div class="department-page">
        <table class="meta-table">
            <tr>
                <td><strong>Patient Name:</strong> {{ $report->patient_name }}</td>
                <td><strong>Memo Number:</strong> {{ $report->memo_number ?: '-' }}</td>
            </tr>
            <tr>
                <td><strong>Age/Sex:</strong> {{ $report->patient_age }} Y / {{ $report->patient_sex }}</td>
                <td><strong>Billing Date:</strong> {{ $report->billing_date->timezone('Asia/Kolkata')->format('d-m-Y h:i A') }}</td>
            </tr>
            <tr>
                <td><strong>Address:</strong> {{ $report->patient_address ?: '-' }}</td>
                <td><strong>Collection Date:</strong> {{ $report->collection_date->timezone('Asia/Kolkata')->format('d-m-Y h:i A') }}</td>
            </tr>
            <tr>
                <td><strong>Referred By:</strong> {{ $report->patient_referred_by ?: '-' }}</td>
                <td><strong>Report Date:</strong> {{ $report->report_date->timezone('Asia/Kolkata')->format('d-m-Y h:i A') }}</td>
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
</div>
</body>
</html>
