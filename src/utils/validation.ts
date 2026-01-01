/**
 * Utilitário de validação para formulários de autenticação
 * As mensagens de erro devem ser traduzidas nas páginas que usam estas funções
 */

export interface ValidationResult {
  valid: boolean
  errorKey?: string // Chave de tradução ao invés de mensagem hardcoded
}

export interface PasswordValidationResult extends ValidationResult {
  strength?: 'weak' | 'medium' | 'strong'
}

/**
 * Valida formato de email
 * Retorna errorKey para ser traduzido na página
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { valid: false, errorKey: 'auth.register.invalidEmail' }
  }

  // Regex básico para validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return { valid: false, errorKey: 'auth.register.invalidEmail' }
  }

  return { valid: true }
}

/**
 * Valida senha
 * Retorna valid: true se a senha atende aos requisitos mínimos
 * Retorna errorKey para ser traduzido na página
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (!password || password.length === 0) {
    return { valid: false, errorKey: 'auth.register.passwordMinLength' }
  }

  if (password.length < 6) {
    return { valid: false, errorKey: 'auth.register.passwordMinLength' }
  }

  // Opcional: calcular força da senha
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    strength = 'strong'
  } else if (password.length >= 8 || /[A-Z]/.test(password) || /[0-9]/.test(password)) {
    strength = 'medium'
  }

  return { valid: true, strength }
}

/**
 * Valida se duas senhas coincidem
 * Retorna errorKey para ser traduzido na página
 */
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (password !== confirmPassword) {
    return { valid: false, errorKey: 'auth.register.passwordsNotMatch' }
  }

  return { valid: true }
}
