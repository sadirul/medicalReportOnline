<?php

namespace Tests\Feature\Reports;

use App\Models\Department;
use App\Models\Investigation;
use App\Models\Report;
use App\Models\ReportItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportWorkflowTest extends TestCase
{
    use RefreshDatabase;

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
            'amount' => 150,
        ])->assertSessionHasNoErrors();

        $investigation = Investigation::query()->first();
        $this->assertNotNull($investigation);

        $this->actingAs($user)->patch(route('investigations.update', $investigation), [
            'department_id' => $department->id,
            'name' => 'Sr.TOTAL BILIRUBIN (DPD Method)',
            'unit' => 'mg/dL',
            'bio_ref_interval' => '( 0.3 - 1.2 )',
            'amount' => 220.5,
        ])->assertSessionHasNoErrors();

        $this->assertSame('Sr.TOTAL BILIRUBIN (DPD Method)', $investigation->fresh()->name);
        $this->assertSame('220.50', $investigation->fresh()->amount);
    }

    public function test_report_can_be_created_and_listed(): void
    {
        $user = User::factory()->create();
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
            'patient_name' => 'MRS. ABEDA KHATUN',
            'patient_age' => 54,
            'patient_sex' => 'Female',
            'patient_address' => 'Kolkata',
            'patient_referred_by' => 'Dr.OF KOLKATA MEDICAL COLLEGE',
            'billing_date' => now()->subMinutes(10)->toDateTimeString(),
            'collection_date' => now()->subMinutes(7)->toDateTimeString(),
            'report_date' => now()->toDateTimeString(),
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
        $this->assertSame(1, $report->memo_sequence);
        $this->assertSame('000000001', $report->memo_number);
        $this->assertSame('unpublished', $report->publication_status);
        $this->assertDatabaseCount('report_items', 1);

        $this->actingAs($user)->get(route('reports.index'))->assertOk();
    }

    public function test_report_can_be_updated(): void
    {
        $user = User::factory()->create();
        $department = Department::query()->create([
            'user_id' => $user->id,
            'name' => 'DEPARTMENT OF BIOCHEMISTRY',
        ]);
        $investigation = Investigation::query()->create([
            'department_id' => $department->id,
            'name' => 'TEST OLD',
            'unit' => 'mg/dL',
            'bio_ref_interval' => '( 1 - 2 )',
        ]);

        $report = Report::query()->create([
            'user_id' => $user->id,
            'memo_number' => '000000001',
            'memo_sequence' => 1,
            'patient_name' => 'Old Patient',
            'patient_age' => 30,
            'patient_sex' => 'Male',
            'billing_date' => now()->subMinutes(5),
            'collection_date' => now()->subMinutes(3),
            'report_date' => now(),
            'department' => 'DEPARTMENT OF BIOCHEMISTRY',
        ]);

        $this->actingAs($user)->patch(route('reports.update', $report), [
            'patient_name' => 'Updated Patient',
            'patient_age' => 31,
            'patient_sex' => 'Female',
            'billing_date' => now()->subMinutes(10)->toDateTimeString(),
            'collection_date' => now()->subMinutes(7)->toDateTimeString(),
            'report_date' => now()->toDateTimeString(),
            'items' => [
                [
                    'department_id' => $department->id,
                    'investigation_id' => $investigation->id,
                    'parameter_name' => 'TEST UPDATED',
                    'method' => '',
                    'value' => '2.2',
                    'unit' => 'mg/dL',
                    'bio_ref_interval' => '( 1 - 2 )',
                ],
            ],
        ])->assertRedirect(route('reports.show', $report));

        $report->refresh();
        $this->assertSame('Updated Patient', $report->patient_name);
        $this->assertSame(31, $report->patient_age);
        $this->assertSame('000000001', $report->memo_number);
        $this->assertDatabaseHas('report_items', [
            'report_id' => $report->id,
            'parameter_name' => 'TEST UPDATED',
        ]);
    }

    public function test_report_list_can_be_filtered_by_name_and_address(): void
    {
        $user = User::factory()->create();

        $reportA = Report::query()->create([
            'user_id' => $user->id,
            'memo_number' => '000000001',
            'memo_sequence' => 1,
            'patient_name' => 'ABEDA KHATUN',
            'patient_age' => 30,
            'patient_sex' => 'Female',
            'patient_address' => 'Kolkata',
            'billing_date' => now()->subMinutes(5),
            'collection_date' => now()->subMinutes(3),
            'report_date' => now(),
            'department' => 'BIOCHEMISTRY',
        ]);

        $reportB = Report::query()->create([
            'user_id' => $user->id,
            'memo_number' => '000000002',
            'memo_sequence' => 2,
            'patient_name' => 'RAHUL SEN',
            'patient_age' => 40,
            'patient_sex' => 'Male',
            'patient_address' => 'Delhi',
            'billing_date' => now()->subMinutes(6),
            'collection_date' => now()->subMinutes(4),
            'report_date' => now(),
            'department' => 'HAEMATOLOGY',
        ]);

        $this->assertNotNull($reportA);
        $this->assertNotNull($reportB);

        $this->actingAs($user)
            ->get(route('reports.index', ['patient_name' => 'ABEDA']))
            ->assertOk()
            ->assertSee('ABEDA KHATUN')
            ->assertDontSee('RAHUL SEN');

        $this->actingAs($user)
            ->get(route('reports.index', ['patient_address' => 'Delhi']))
            ->assertOk()
            ->assertSee('RAHUL SEN')
            ->assertDontSee('ABEDA KHATUN');
    }

    public function test_pdf_is_not_available_until_report_is_released(): void
    {
        $owner = User::factory()->create();

        $report = Report::query()->create([
            'user_id' => $owner->id,
            'patient_name' => 'Patient',
            'memo_number' => '000000001',
            'memo_sequence' => 1,
            'publication_status' => 'unpublished',
            'released_at' => null,
            'patient_age' => 30,
            'patient_sex' => 'Male',
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

        $this->get(route('reports.pdf', $report->uuid))
            ->assertForbidden()
            ->assertSee('Report yet not Released');

        $this->actingAs($owner)
            ->post(route('reports.release', $report))
            ->assertRedirect();

        $this->get(route('reports.pdf', $report->uuid))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_bill_is_available_only_to_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $report = Report::query()->create([
            'user_id' => $owner->id,
            'patient_name' => 'Bill Patient',
            'memo_number' => '000000001',
            'memo_sequence' => 1,
            'patient_age' => 32,
            'patient_sex' => 'Female',
            'billing_date' => now()->subMinutes(10),
            'collection_date' => now()->subMinutes(7),
            'report_date' => now(),
            'department' => 'DEPARTMENT OF BIOCHEMISTRY',
        ]);

        $this->actingAs($owner)->get(route('reports.bill', $report))->assertOk();
        $this->actingAs($other)->get(route('reports.bill', $report))->assertForbidden();
    }

    public function test_public_bill_is_available_by_uuid_without_auth(): void
    {
        $owner = User::factory()->create();

        $report = Report::query()->create([
            'user_id' => $owner->id,
            'patient_name' => 'Public Bill Patient',
            'memo_number' => '000000001',
            'memo_sequence' => 1,
            'patient_age' => 32,
            'patient_sex' => 'Male',
            'billing_date' => now()->subMinutes(10),
            'collection_date' => now()->subMinutes(7),
            'report_date' => now(),
            'department' => 'DEPARTMENT OF BIOCHEMISTRY',
        ]);

        $response = $this->get(route('reports.public.bill', $report->uuid));
        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_memo_number_sequence_is_independent_per_clinic(): void
    {
        $clinicA = User::factory()->create();
        $clinicB = User::factory()->create();

        $departmentA = Department::query()->create(['user_id' => $clinicA->id, 'name' => 'BIOCHEMISTRY']);
        $departmentB = Department::query()->create(['user_id' => $clinicB->id, 'name' => 'BIOCHEMISTRY']);

        $investigationA = Investigation::query()->create([
            'department_id' => $departmentA->id,
            'name' => 'TEST A',
            'unit' => 'mg/dL',
            'bio_ref_interval' => '( 1 - 2 )',
        ]);
        $investigationB = Investigation::query()->create([
            'department_id' => $departmentB->id,
            'name' => 'TEST B',
            'unit' => 'mg/dL',
            'bio_ref_interval' => '( 1 - 2 )',
        ]);

        $payloadFor = fn (int $departmentId, int $investigationId) => [
            'patient_name' => 'Patient',
            'patient_age' => 30,
            'patient_sex' => 'Male',
            'billing_date' => now()->toDateTimeString(),
            'collection_date' => now()->toDateTimeString(),
            'report_date' => now()->toDateTimeString(),
            'items' => [
                [
                    'department_id' => $departmentId,
                    'investigation_id' => $investigationId,
                    'parameter_name' => 'Test',
                    'value' => '1.0',
                    'unit' => 'mg/dL',
                    'bio_ref_interval' => '( 1 - 2 )',
                ],
            ],
        ];

        $this->actingAs($clinicA)->post(route('reports.store'), $payloadFor($departmentA->id, $investigationA->id))->assertRedirect();
        $this->actingAs($clinicA)->post(route('reports.store'), $payloadFor($departmentA->id, $investigationA->id))->assertRedirect();
        $this->actingAs($clinicB)->post(route('reports.store'), $payloadFor($departmentB->id, $investigationB->id))->assertRedirect();

        $clinicAReports = Report::query()->where('user_id', $clinicA->id)->orderBy('id')->get();
        $clinicBReports = Report::query()->where('user_id', $clinicB->id)->orderBy('id')->get();

        $this->assertSame([1, 2], $clinicAReports->pluck('memo_sequence')->all());
        $this->assertSame(['000000001', '000000002'], $clinicAReports->pluck('memo_number')->all());
        $this->assertSame([1], $clinicBReports->pluck('memo_sequence')->all());
        $this->assertSame(['000000001'], $clinicBReports->pluck('memo_number')->all());
    }
}
