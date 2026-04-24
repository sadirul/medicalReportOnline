<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Lab Report</title>
    <style>
        @page {
            margin: 120px 40px 105px 40px;
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
            top: -120px;
            left: -40px;
            right: -40px;
            height: 100px;
        }

        .footer {
            position: fixed;
            bottom: -105px;
            left: -40px;
            right: -40px;
            height: auto;
            font-size: 10px;
            color: #4b5563;
        }

        .banner {
            width: 100%;
            height: auto;
            display: block;
        }

        .blank-banner {
            width: 100%;
            height: 100%;
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

        .patient-meta {
            width: 100%;
            margin: 8px 0 12px;
            font-size: 12px;
            line-height: 1.25;
        }

        .meta-col {
            display: inline-block;
            width: 49%;
            vertical-align: top;
        }

        .meta-row {
            margin: 2px 0;
            white-space: nowrap;
        }

        .meta-label {
            display: inline-block;
            width: 130px;
            font-weight: 700;
        }

        .meta-col.right .meta-label {
            width: 150px;
        }

        .meta-colon {
            display: inline-block;
            width: 14px;
            text-align: center;
            font-weight: 700;
        }

        .meta-value {
            font-weight: 700;
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

        .department-block {
            page-break-inside: avoid;
            break-inside: avoid-page;
            margin-bottom: 14px;
        }

        .department-block:last-of-type {
            margin-bottom: 0;
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
    @else
        <div class="blank-banner"></div>
    @endif
</div>

<div class="footer">
    @if(!empty($footerImage))
        <img src="{{ $footerImage }}" alt="Report Footer" class="banner">
    @else
        <div class="blank-banner"></div>
    @endif
</div>

<div class="patient-meta">
    <div class="meta-col">
        <div class="meta-row">
            <span class="meta-label">Patient Name</span>
            <span class="meta-colon">:</span>
            <span class="investigation">{{ strtoupper($report->patient_name ?: '-') }}</span>
        </div>
        <div class="meta-row">
            <span class="meta-label">Age/Gender</span>
            <span class="meta-colon">:</span>
            <span class="investigation">{{ $report->patient_age }} Y / {{ ucfirst(strtolower($report->patient_sex ?: '-')) }}</span>
        </div>
        <div class="meta-row">
            <span class="meta-label">Address</span>
            <span class="meta-colon">:</span>
            <span class="investigation">{{ strtoupper($report->patient_address ?: '-') }}</span>
        </div>
        <div class="meta-row">
            <span class="meta-label">Referred By</span>
            <span class="meta-colon">:</span>
            <span class="investigation">{{ strtoupper($report->patient_referred_by ?: '-') }}</span>
        </div>
    </div>
    <div class="meta-col right">
        <div class="meta-row">
            <span class="meta-label">Memo No</span>
            <span class="meta-colon">:</span>
            <span class="investigation">{{ $report->memo_number ?: '-' }}</span>
        </div>
        <div class="meta-row">
            <span class="meta-label">Billing Date</span>
            <span class="meta-colon">:</span>
            <span class="investigation">{{ $report->billing_date->timezone('Asia/Kolkata')->format('d/M/Y h:i A') }}</span>
        </div>
        <div class="meta-row">
            <span class="meta-label">Collection Date</span>
            <span class="meta-colon">:</span>
            <span class="investigation">{{ $report->collection_date->timezone('Asia/Kolkata')->format('d/M/Y h:i A') }}</span>
        </div>
        <div class="meta-row">
            <span class="meta-label">Report Date</span>
            <span class="meta-colon">:</span>
            <span class="investigation">{{ $report->report_date->timezone('Asia/Kolkata')->format('d/M/Y h:i A') }}</span>
        </div>
    </div>
</div>

@foreach($groupedItems as $group)
    <div class="department-block">

        <div class="section-title">DEPARTMENT OF {{ strtoupper($group['department']) }}</div>

        <div class="columns-head">
            <span class="investigation">INVESTIGATION</span>
            <span class="result">RESULT</span>
            <span class="interval">BIOLOGICAL REFERENCE INTERVAL</span>
        </div>

        @foreach($group['items'] as $item)
            <div class="result-block">
                <div class="result-line">
                    @php
                        $resultValue = ($item->value === null || $item->value === '') ? '-' : $item->value;
                        $resultUnit = $item->unit ?? '';
                    @endphp
                    <span class="investigation">{{ $item->parameter_name }}</span>
                    <span class="result">{{ trim($resultValue . ' ' . $resultUnit) }}</span>
                    <span class="interval">{{ $item->bio_ref_interval ?: '-' }}</span>
                </div>
            </div>
        @endforeach
    </div>
@endforeach

@if($report->sample_note || $report->equipment_note || $report->interpretation_note)
    <div class="note">
        @if($report->sample_note)
            <div class="note-line"><strong>Note ::</strong> {{ $report->sample_note }}</div>
        @endif
        @if($report->equipment_note)
            <div class="note-line"><strong>Equipment note ::</strong> {{ $report->equipment_note }}</div>
        @endif
        @if($report->interpretation_note)
            <div class="note-line"><strong>Comments :</strong> {{ $report->interpretation_note }}</div>
        @endif
    </div>
@endif
</body>
</html>
