<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Not Released</title>
    <style>
        body {
            margin: 0;
            font-family: Inter, Segoe UI, Arial, sans-serif;
            background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0f172a;
        }

        .card {
            width: min(92vw, 460px);
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            padding: 26px 22px;
            text-align: center;
        }

        .badge {
            display: inline-block;
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
            border-radius: 999px;
            padding: 4px 10px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 12px;
        }

        h1 {
            margin: 0 0 8px;
            font-size: 20px;
            font-weight: 700;
        }

        p {
            margin: 0 0 18px;
            color: #475569;
            font-size: 14px;
        }

        .actions {
            display: flex;
            gap: 10px;
            justify-content: center;
        }

        .btn {
            border: 1px solid #cbd5e1;
            background: #ffffff;
            color: #0f172a;
            border-radius: 10px;
            padding: 9px 14px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
        }

        .btn.primary {
            border-color: #16a34a;
            background: #16a34a;
            color: #ffffff;
        }
    </style>
</head>
<body>
<div class="card">
    <div class="badge">Unreleased</div>
    <h1>{{ $message }}</h1>
    <p>Please refresh after the report is released by the clinic.</p>
    <div class="actions">
        <button class="btn primary" onclick="window.location.reload()">Refresh</button>
        <button class="btn" onclick="window.history.back()">Go Back</button>
    </div>
</div>
</body>
</html>
