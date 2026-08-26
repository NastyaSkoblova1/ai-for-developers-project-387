import type { ApiError } from '@generated/types.gen'

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    if (e.message && typeof e.message === 'string') {
      return e.message
    }
    if (e.error && typeof e.error === 'string') {
      return e.error
    }
  }
  if (typeof err === 'string') {
    return err
  }
  return 'Произошла неизвестная ошибка. Попробуйте ещё раз.'
}

export function isApiError(err: unknown): err is ApiError {
  return (
    err !== null &&
    typeof err === 'object' &&
    'code' in err &&
    typeof (err as ApiError).code === 'number' &&
    'message' in err &&
    typeof (err as ApiError).message === 'string'
  )
}
