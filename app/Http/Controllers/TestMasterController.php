<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTestMasterRequest;
use App\Models\TestMaster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TestMasterController extends Controller
{
    public function index(Request $request): Response
    {
        $testMasters = $request->user()
            ->testMasters()
            ->orderBy('department')
            ->orderBy('display_order')
            ->get();

        return Inertia::render('reports/test-masters', [
            'testMasters' => $testMasters,
        ]);
    }

    public function store(StoreTestMasterRequest $request): RedirectResponse
    {
        $payload = $request->validated();
        $payload['display_order'] = $payload['display_order'] ?? 0;
        $payload['is_active'] = $payload['is_active'] ?? true;

        $request->user()->testMasters()->create($payload);

        return back()->with([
            'status' => 'Test master added successfully.',
            'status_type' => 'success',
        ]);
    }

    public function update(StoreTestMasterRequest $request, TestMaster $testMaster): RedirectResponse
    {
        abort_unless((int) $testMaster->user_id === (int) $request->user()->id, 403);

        $payload = $request->validated();
        $payload['display_order'] = $payload['display_order'] ?? 0;
        $payload['is_active'] = $payload['is_active'] ?? false;

        $testMaster->update($payload);

        return back()->with([
            'status' => 'Test master updated successfully.',
            'status_type' => 'success',
        ]);
    }
}
