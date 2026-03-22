const DEFAULT_AUTH_REDIRECT = '/'

export function sanitizeAuthRedirect(target: unknown) {
  if (typeof target !== 'string') {
    return DEFAULT_AUTH_REDIRECT
  }

  if (!target.startsWith('/') || target.startsWith('//')) {
    return DEFAULT_AUTH_REDIRECT
  }

  if (target.startsWith('/login')) {
    return DEFAULT_AUTH_REDIRECT
  }

  return target
}
