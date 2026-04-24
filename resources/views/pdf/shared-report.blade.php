<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Shared Lab Report</title>
    <style>
        @page { margin: 120px 40px 105px 40px; }
        html, body { font-family: DejaVu Serif, "Times New Roman", Times, serif; color: #111827; font-size: 12px; }
        .header { position: fixed; top: -120px; left: -40px; right: -40px; height: 100px; }
        .footer { position: fixed; bottom: -105px; left: -40px; right: -40px; height: auto; }
        .banner { width: 100%; height: auto; display: block; }
        .blank-banner { width: 100%; height: 100%; }
        .section-title { font-weight: bold; text-transform: uppercase; margin: 10px 0 14px; text-align: center; text-decoration: underline; }
        .columns-head { font-size: 12px; font-weight: 700; margin-bottom: 8px; }
        .result-line { font-size: 12px; line-height: 1.35; }
        .investigation { display: inline-block; width: 42%; vertical-align: top; }
        .result { display: inline-block; width: 22%; vertical-align: top; }
        .interval { display: inline-block; width: 34%; vertical-align: top; }
        .department-block { page-break-inside: avoid; break-inside: avoid-page; margin-bottom: 14px; }
        .department-block:last-of-type { margin-bottom: 0; }
        .end-report { margin-top: 20px; padding-top: 12px; border-top: 1px solid #d1d5db; text-align: center; letter-spacing: 0.06em; }
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

<div class="patient-meta">
    <div class="meta-row"><span class="meta-label">Patient Name</span><span class="meta-colon">:</span><span class="investigation">{{ strtoupper($sharedReport->patient_name ?: '-') }}</span></div>
    <div class="meta-row"><span class="meta-label">Age/Gender</span><span class="meta-colon">:</span><span class="investigation">{{ $sharedReport->patient_age }} Y / {{ ucfirst(strtolower($sharedReport->patient_sex ?: '-')) }}</span></div>
    <div class="meta-row"><span class="meta-label">Address</span><span class="meta-colon">:</span><span class="investigation">{{ strtoupper($sharedReport->patient_address ?: '-') }}</span></div>
    <div class="meta-row"><span class="meta-label">Referred By</span><span class="meta-colon">:</span><span class="investigation">{{ strtoupper($sharedReport->patient_referred_by ?: '-') }}</span></div>
    <div class="meta-row"><span class="meta-label">Billing Date</span><span class="meta-colon">:</span><span class="investigation">{{ $sharedReport->billing_date->timezone('Asia/Kolkata')->format('d/M/Y h:i A') }}</span></div>
    <div class="meta-row"><span class="meta-label">Collection Date</span><span class="meta-colon">:</span><span class="investigation">{{ $sharedReport->collection_date->timezone('Asia/Kolkata')->format('d/M/Y h:i A') }}</span></div>
    <div class="meta-row"><span class="meta-label">Report Date</span><span class="meta-colon">:</span><span class="investigation">{{ $sharedReport->report_date->timezone('Asia/Kolkata')->format('d/M/Y h:i A') }}</span></div>
</div>

@foreach($groupedItems as $group)
    <div class="department-block">

        <div class="section-title">DEPARTMENT OF {{ strtoupper($group['department']) }}</div>
        <div class="columns-head">
            <span class="investigation">INVESTIGATION</span>
            <span class="result">RESULT</span>
            <span class="interval">BIO. REF. INTERVAL</span>
        </div>

        @foreach($group['items'] as $item)
            <div class="result-line">
                @php
                    $resultValue = ($item->value === null || $item->value === '') ? '-' : $item->value;
                    $resultUnit = $item->unit ?? '';
                @endphp
                <span class="investigation">{{ $item->parameter_name }}</span>
                <span class="result">{{ trim($resultValue . ' ' . $resultUnit) }}</span>
                <span class="interval">{{ $item->bio_ref_interval ?: '-' }}</span>
            </div>
        @endforeach
    </div>
@endforeach

<div class="end-report">*** End of Report ***</div>
</body>
</html>
