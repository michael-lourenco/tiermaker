/**
 * Valida formato de email e senha para autenticação.
 * errorKey = chave i18n.
 */

export interface ValidationResult {
  valid: boolean
  errorKey?: string
}

export interface PasswordValidationResult extends ValidationResult {
  strength?: 'weak' | 'medium' | 'strong'
}

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { valid: false, errorKey: 'auth.register.invalidEmail' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, errorKey: 'auth.register.invalidEmail' }
  }

  return { valid: true }
}

/**
 * Senha forte: mín. 8, maiúscula, minúscula e número.
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (!password || password.length === 0) {
    return { valid: false, errorKey: 'auth.register.passwordMinLength', strength: 'weak' }
  }

  if (password.length < 8) {
    return { valid: false, errorKey: 'auth.register.passwordMinLength', strength: 'weak' }
  }

  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (!hasUpper || !hasLower || !hasNumber) {
    return {
      valid: false,
      errorKey: 'auth.register.passwordRequirements',
      strength: 'weak',
    }
  }

  let strength: 'weak' | 'medium' | 'strong' = 'medium'
  if (password.length >= 10 && hasSpecial) {
    strength = 'strong'
  }

  return { valid: true, strength }
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (password !== confirmPassword) {
    return { valid: false, errorKey: 'auth.register.passwordsNotMatch' }
  }
  return { valid: true }
}
