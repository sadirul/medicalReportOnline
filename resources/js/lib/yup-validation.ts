import { ValidationError } from 'yup';

export function toFieldErrors(error: unknown): Record<string, string> {
    if (!(error instanceof ValidationError)) {
        return {};
    }

    const fieldErrors: Record<string, string> = {};
    for (const issue of error.inner) {
        if (issue.path && !fieldErrors[issue.path]) {
            fieldErrors[issue.path] = issue.message;
        }
    }

    if (error.path && !fieldErrors[error.path]) {
        fieldErrors[error.path] = error.message;
    }

    return fieldErrors;
}
