<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #1f2937;
            font-size: 11px;
            margin: 8px;
        }

        .title {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
        }

        .muted {
            color: #6b7280;
            font-size: 11px;
        }

        .qr-box {
            border: 1px solid #ccc;
            box-sizing: border-box;
            padding: 2px;
            width: 96px;
            height: 96px;
            overflow: hidden;
        }

        .qr-image {
            width: 100%;
            height: 100%;
            display: block;
        }

        .qr-caption {
            margin-top: 6px;
            font-size: 10px;
            color: #6b7280;
        }

        .signature-box {
            text-align: right;
            padding-left: 6px;
        }

        .signature-image {
            max-width: 180px;
            max-height: 70px;
            object-fit: contain;
            display: inline-block;
            margin-top: 6px;
        }

        .signature-line {
            margin-top: 4px;
            border-top: 1px solid #9ca3af;
            min-width: 160px;
            display: inline-block;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
            padding-top: 2px;
        }
    </style>
</head>
<body>
<table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 4px;">
    <tr>
        <td valign="top">
            <div class="title">Invoice</div>
            <div class="muted">Memo Number: {{ $report->memo_number ?: '-' }}</div>
            <div class="muted">Date: {{ $report->report_date->timezone('Asia/Kolkata')->format('d-m-Y h:i A') }}</div>
        </td>
        <td valign="top" align="right">
            <div style="font-size: 15px; font-weight: 700;">{{ $clinic->clinic_name ?: $clinic->full_name }}</div>
            <div class="muted">{{ $clinic->mobile ?: '-' }}</div>
            <div class="muted">{{ $clinic->email ?: '-' }}</div>
            <div class="muted">{{ $clinic->address ?: '-' }}</div>
        </td>
    </tr>
</table>

<div><strong>Patient Details</strong></div>
<table width="100%" border="1" cellpadding="2" cellspacing="0" style="margin-bottom: 4px;">
    <tr>
        <td><strong>Name:</strong> {{ $report->patient_name }}</td>
        <td><strong>Age/Sex:</strong> {{ $report->patient_age }} / {{ $report->patient_sex }}</td>
    </tr>
    <tr>
        <td><strong>Address:</strong> {{ $report->patient_address ?: '-' }}</td>
        <td><strong>Referred By:</strong> {{ $report->patient_referred_by ?: '-' }}</td>
    </tr>
</table>

<div><strong>Invoice Items</strong></div>
<table width="100%" border="1" cellpadding="2" cellspacing="0">
    <thead>
    <tr>
        <th style="width: 40px;">#</th>
        <th>Investigation</th>
        <th style="width: 130px;">Unit</th>
        <th style="width: 140px;" align="right">Amount</th>
    </tr>
    </thead>
    <tbody>
    @forelse($lineItems as $index => $line)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>{{ $line['name'] }}</td>
            <td>{{ $line['unit'] ?: '-' }}</td>
            <td align="right">{{ number_format((float) $line['amount'], 2) }}</td>
        </tr>
    @empty
        <tr>
            <td colspan="4" align="right">No items.</td>
        </tr>
    @endforelse
    </tbody>
</table>

<table width="100%" border="1" cellpadding="2" cellspacing="0" style="margin-top: 4px;">
    <tr>
        <td align="right"><strong>Grand Total</strong></td>
        <td align="right" style="width: 160px;"><strong>{{ number_format((float) $subTotal, 2) }}</strong></td>
    </tr>
</table>

<table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 40px;">
    <tr>
        <td valign="top" style="width: 50%;">
            <div class="qr-box">
                @if(!empty($qrImage))
                    <img src="{{ $qrImage }}" alt="Invoice QR" class="qr-image">
                @endif
            </div>
            <div class="qr-caption">Scan to open report PDF</div>
        </td>
        <td valign="top" style="width: 50%;">
            <div class="signature-box">
                @if(!empty($signatureImage))
                    <img src="{{ $signatureImage }}" alt="Authorized signature" class="signature-image">
                    <div class="signature-line">Authorized Signature</div>
                @endif
            </div>
        </td>
    </tr>
</table>
</body>
</html>
