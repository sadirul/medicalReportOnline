<?php

namespace App\Http\Requests\Clinic;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class CreateClinicAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'clinic_name' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'digits:10', 'unique:users,mobile'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'address' => ['required', 'string', 'max:1000'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
}

