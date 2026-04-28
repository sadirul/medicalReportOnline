<?php

namespace App\Http\Requests;

use App\Models\Doctor;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $doctor = $this->route('doctor');

        return [
            'name' => ['required', 'string', 'max:255'],
            'mobile' => [
                'required',
                'digits:10',
                Rule::unique(Doctor::class, 'mobile')
                    ->where('user_id', $this->user()?->id)
                    ->ignore($doctor?->id),
            ],
            'email' => ['nullable', 'email', 'max:255'],
            'hospital' => ['required', 'string', 'max:255'],
        ];
    }
}
