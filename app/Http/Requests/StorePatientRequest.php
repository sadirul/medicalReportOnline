<?php

namespace App\Http\Requests;

use App\Models\Patient;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatientRequest extends FormRequest
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
        $patient = $this->route('patient');

        return [
            'name' => ['required', 'string', 'max:255'],
            'v_id' => [
                'required',
                'string',
                'max:50',
                Rule::unique(Patient::class, 'v_id')->ignore($patient?->id),
            ],
            'age' => ['required', 'integer', 'min:0', 'max:150'],
            'sex' => ['required', 'string', 'in:Male,Female,Other'],
            'address' => ['nullable', 'string', 'max:1000'],
            'referred_by' => ['nullable', 'string', 'max:255'],
        ];
    }
}
