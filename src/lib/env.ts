/**
 * Environment detection utility
 * Detects current environment based on domain or NODE_ENV
 */

export type Environment = 'development' | 'production' | 'local'

export function getEnvironment(): Environment {
  // Server-side detection
  if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      return 'local'
    }
    // For deployed environments, use NEXT_PUBLIC_ENVIRONMENT
    return (process.env.NEXT_PUBLIC_ENVIRONMENT as Environment) || 'production'
  }

  // Client-side detection based on hostname
  const hostname = window.location.hostname

  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'local'
  }

  if (hostname.includes('-dev.fun')) {
    return 'development'
  }

  return 'production'
}

export function isDevelopment(): boolean {
  return getEnvironment() === 'development'
}

export function isProduction(): boolean {
  return getEnvironment() === 'production'
}

export function isLocal(): boolean {
  return getEnvironment() === 'local'
}

/**
 * Get the base domain for current environment
 */
export function getBaseDomain(): string {
  const env = getEnvironment()

  switch (env) {
    case 'development':
      return '-dev.fun'
    case 'production':
      return '.cz'
    default:
      return 'localhost:3000'
  }
}

/**
 * Get the main domain for current environment
 */
export function getMainDomain(): string {
  const env = getEnvironment()

  switch (env) {
    case 'development':
      return 'prokarieru-dev.fun'
    case 'production':
      return 'prokarieru.cz'
    default:
      return 'localhost:3000'
  }
}
