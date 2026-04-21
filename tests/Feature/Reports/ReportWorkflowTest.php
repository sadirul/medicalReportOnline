<?php

namespace Tests\Feature\Reports;

use App\Models\Department;
use App\Models\Investigation;
use App\Models\Patient;
use App\Models\Report;
use App\Models\ReportItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_can_be_created_and_updated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('patients.store'), [
            'name' => 'MRS. ABEDA KHATUN',
            'v_id' => '012601100470',
            'age' => 54,
            'sex' => 'Female',
            'address' => 'Kolkata',
            'referred_by' => 'Dr.OF KOLKATA MEDICAL COLLEGE',
        ])->assertSessionHasNoErrors();

        $patient = Patient::query()->first();
        $this->assertNotNull($patient);

        $this->actingAs($user)->patch(route('patients.update', $patient), [
            'name' => 'MRS. ABEDA KHATUN',
            'v_id' => '012601100470',
            'age' => 55,
            'sex' => 'Female',
            'address' => 'Kolkata',
            'referred_by' => 'Dr.OF KOLKATA MEDICAL COLLEGE',
        ])->assertSessionHasNoErrors();

        $this->assertSame(55, $patient->fresh()->age);
    }

    public function test_patient_update_is_forbidden_for_another_user(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $patient = Patient::query()->create([
            'user_id' => $owner->id,
            'name' => 'A',
            'v_id' => 'VID-001',
            'age' => 22,
            'sex' => 'Female',
        ]);

        $this->actingAs($other)->patch(route('patients.update', $patient), [
            'name' => 'B',
            'v_id' => 'VID-001',
            'age' => 22,
            'sex' => 'Female',
        ])->assertForbidden();
    }

    public function test_department_and_investigation_can_be_created_and_updated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('departments.store'), [
            'name' => 'DEPARTMENT OF BIOCHEMISTRY',
        ])->assertSessionHasNoErrors();

        $department = Department::query()->first();
        $this->assertNotNull($department);

        $this->actingAs($user)->post(route('investigations.store', $department), [
            'department_id' => $department->id,
            'name' => 'Pl. GLUCOSE (FASTING) [GOD POD]',
            'unit' => 'g/dL',
            'bio_ref_interval' => '( 70 - 110 )',
        ])->assertSessionHasNoErrors();

        $investigation = Investigation::query()->first();
        $this->assertNotNull($investigation);

        $this->actingAs($user)->patch(route('investigations.update', $investigation), [
            'department_id' => $department->id,
            'name' => 'Sr.TOTAL BILIRUBIN (DPD Method)',
            'unit' => 'mg/dL',
            'bio_ref_interval' => '( 0.3 - 1.2 )',
        ])->assertSessionHasNoErrors();

        $this->assertSame('Sr.TOTAL BILIRUBIN (DPD Method)', $investigation->fresh()->name);
    }

    public function test_report_can_be_created_and_listed(): void
    {
        $user = User::factory()->create();
        $patient = Patient::query()->create([
            'user_id' => $user->id,
            'name' => 'MRS. ABEDA KHATUN',
            'v_id' => '012601100470',
            'age' => 54,
            'sex' => 'Female',
            'address' => 'Kolkata',
            'referred_by' => 'Dr.OF KOLKATA MEDICAL COLLEGE',
        ]);

        $department = Department::query()->create([
            'user_id' => $user->id,
            'name' => 'DEPARTMENT OF BIOCHEMISTRY',
        ]);

        $investigation = Investigation::query()->create([
            'department_id' => $department->id,
            'name' => 'Pl. GLUCOSE (FASTING) [GOD POD]',
            'unit' => 'g/dL',
            'bio_ref_interval' => '( 70 - 110 )',
        ]);

        $this->actingAs($user)->post(route('reports.store'), [
            'patient_id' => $patient->id,
            'billing_date' => now()->subMinutes(10)->toDateTimeString(),
            'collection_date' => now()->subMinutes(7)->toDateTimeString(),
            'report_date' => now()->toDateTimeString(),
            'department' => 'DEPARTMENT OF HAEMATOLOGY',
            'sample_note' => 'EDTA-Whole Blood',
            'equipment_note' => 'Sysmex XN-1000 Cell Counter',
            'interpretation_note' => 'Please correlate with clinical conditions.',
            'items' => [
                [
                    'department_id' => $department->id,
                    'investigation_id' => $investigation->id,
                    'parameter_name' => 'Pl. GLUCOSE (FASTING) [GOD POD]',
                    'method' => '',
                    'value' => '10.8',
                    'unit' => 'g/dL',
                    'bio_ref_interval' => '( 70 - 110 )',
                ],
            ],
        ])->assertRedirect();

        $report = Report::query()->first();
        $this->assertNotNull($report);
        $this->assertDatabaseCount('report_items', 1);

        $this->actingAs($user)->get(route('reports.index'))->assertOk();
    }

    public function test_pdf_is_available_only_to_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $patient = Patient::query()->create([
            'user_id' => $owner->id,
            'name' => 'Patient',
            'v_id' => 'VID-PDF',
            'age' => 30,
            'sex' => 'Male',
        ]);

        $report = Report::query()->create([
            'user_id' => $owner->id,
            'patient_id' => $patient->id,
            'billing_date' => now()->subMinutes(5),
            'collection_date' => now()->subMinutes(3),
            'report_date' => now(),
            'department' => 'DEPARTMENT OF HAEMATOLOGY',
        ]);

        ReportItem::query()->create([
            'report_id' => $report->id,
            'parameter_name' => 'Hemoglobin (Hb)',
            'value' => '10.8',
            'unit' => 'g/dL',
            'bio_ref_interval' => 'F: 12.0 - 15.0',
            'display_order' => 0,
        ]);

        $this->actingAs($owner)->get(route('reports.pdf', $report))->assertOk();
        $this->actingAs($other)->get(route('reports.pdf', $report))->assertForbidden();
    }
}
