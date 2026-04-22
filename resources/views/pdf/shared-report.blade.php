<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Shared Lab Report</title>
    <style>
        @page { margin: 120px 40px 105px 40px; }
        body { font-family: DejaVu Sans, sans-serif; color: #111827; font-size: 12px; margin: 0; padding: 0; }
        .header { position: fixed; top: -120px; left: -40px; right: -40px; height: 100px; }
        .footer { position: fixed; bottom: -105px; left: -40px; right: -40px; height: auto; }
        .banner { width: 100%; height: auto; display: block; }
        .blank-banner { width: 100%; height: 100%; }
        .section-title { font-weight: bold; text-transform: uppercase; margin: 10px 0 14px; text-align: center; text-decoration: underline; }
        .columns-head { font-size: 12px; font-weight: 700; text-decoration: underline; margin-bottom: 8px; }
        .result-line { font-size: 12px; line-height: 1.35; }
        .investigation { display: inline-block; width: 42%; vertical-align: top; }
        .result { display: inline-block; width: 22%; vertical-align: top; }
        .interval { display: inline-block; width: 34%; vertical-align: top; }
        .department-page { page-break-after: always; }
        .department-page:last-of-type { page-break-after: auto; }
        .meta-row { margin: 2px 0; }
        .meta-label { display: inline-block; width: 130px; font-weight: 700; }
        .meta-colon { display: inline-block; width: 14px; text-align: center; font-weight: 700; }
        .meta-value { font-weight: 700; }
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

@foreach($groupedItems as $group)
    <div class="department-page">
        <div class="meta-row"><span class="meta-label">Patient Name</span><span class="meta-colon">:</span><span class="meta-value">{{ strtoupper($sharedReport->patient_name ?: '-') }}</span></div>
        <div class="meta-row"><span class="meta-label">Age/Sex</span><span class="meta-colon">:</span><span class="meta-value">{{ $sharedReport->patient_age }} Y / {{ ucfirst(strtolower($sharedReport->patient_sex ?: '-')) }}</span></div>
        <div class="meta-row"><span class="meta-label">Address</span><span class="meta-colon">:</span><span class="meta-value">{{ strtoupper($sharedReport->patient_address ?: '-') }}</span></div>
        <div class="meta-row"><span class="meta-label">Referred By</span><span class="meta-colon">:</span><span class="meta-value">{{ strtoupper($sharedReport->patient_referred_by ?: '-') }}</span></div>
        <div class="meta-row"><span class="meta-label">Billing Date</span><span class="meta-colon">:</span><span class="meta-value">{{ $sharedReport->billing_date->timezone('Asia/Kolkata')->format('d/M/Y h:i A') }}</span></div>
        <div class="meta-row"><span class="meta-label">Collection Date</span><span class="meta-colon">:</span><span class="meta-value">{{ $sharedReport->collection_date->timezone('Asia/Kolkata')->format('d/M/Y h:i A') }}</span></div>
        <div class="meta-row"><span class="meta-label">Report Date</span><span class="meta-colon">:</span><span class="meta-value">{{ $sharedReport->report_date->timezone('Asia/Kolkata')->format('d/M/Y h:i A') }}</span></div>

        <div class="section-title">DEPARTMENT OF {{ strtoupper($group['department']) }}</div>
        <div class="columns-head">
            <span class="investigation">INVESTIGATION</span>
            <span class="result">RESULT</span>
            <span class="interval">BIOLOGICAL REFERENCE INTERVAL</span>
        </div>

        @foreach($group['items'] as $item)
            <div class="result-line">
                <span class="investigation">{{ $item->parameter_name }}</span>
                <span class="result">{{ trim(($item->value ?: '-') . ' ' . ($item->unit ?: '')) }}</span>
                <span class="interval">{{ $item->bio_ref_interval ?: '-' }}</span>
            </div>
        @endforeach
    </div>
@endforeach
</body>
</html>
