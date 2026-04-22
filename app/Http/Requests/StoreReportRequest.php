<?php

namespace App\Http\Requests;

use Illuminate\Database\Query\Builder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'patient_name' => ['required', 'string', 'max:255'],
            'patient_age' => ['required', 'integer', 'min:0', 'max:150'],
            'patient_sex' => ['required', Rule::in(['Male', 'Female', 'Other'])],
            'patient_address' => ['nullable', 'string', 'max:1000'],
            'patient_referred_by' => ['nullable', 'string', 'max:255'],
            'patient_whatsapp_number' => ['nullable', 'digits:10'],
            'billing_date' => ['required', 'date'],
            'collection_date' => ['required', 'date'],
            'report_date' => ['required', 'date'],
            'include_header_footer' => ['nullable', 'boolean'],
            'sample_note' => ['nullable', 'string', 'max:255'],
            'equipment_note' => ['nullable', 'string', 'max:255'],
            'interpretation_note' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.test_master_id' => ['nullable', 'integer'],
            'items.*.department_id' => [
                'required',
                Rule::exists('departments', 'id')->where('user_id', $this->user()?->id),
            ],
            'items.*.investigation_id' => [
                'required',
                Rule::exists('investigations', 'id')->where(function (Builder $query): void {
                    $query->whereIn('department_id', function ($departmentQuery): void {
                        $departmentQuery
                            ->select('id')
                            ->from('departments')
                            ->where('user_id', $this->user()?->id);
                    });
                }),
            ],
            'items.*.parameter_name' => ['required', 'string', 'max:255'],
            'items.*.method' => ['nullable', 'string', 'max:255'],
            'items.*.value' => ['nullable', 'string', 'max:255'],
            'items.*.unit' => ['nullable', 'string', 'max:100'],
            'items.*.bio_ref_interval' => ['nullable', 'string', 'max:255'],
        ];
    }
}
