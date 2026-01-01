/**
 * Utilitário para traduzir mensagens de erro do Supabase Auth
 */

type Language = 'pt' | 'en'

interface ErrorTranslation {
  pt: string
  en: string
}

// Mapeamento de mensagens de erro comuns do Supabase
const ERROR_TRANSLATIONS: Record<string, ErrorTranslation> = {
  // Erros de credenciais
  'Invalid login credentials': {
    pt: 'Credenciais inválidas',
    en: 'Invalid login credentials',
  },
  'invalid_credentials': {
    pt: 'Credenciais inválidas',
    en: 'Invalid login credentials',
  },
  
  // Erros de email
  'Email not confirmed': {
    pt: 'Email não confirmado. Verifique sua caixa de entrada',
    en: 'Email not confirmed. Please check your inbox',
  },
  'email_not_confirmed': {
    pt: 'Email não confirmado. Verifique sua caixa de entrada',
    en: 'Email not confirmed. Please check your inbox',
  },
  'Email already exists': {
    pt: 'Este email já está cadastrado',
    en: 'Email already exists',
  },
  'User already registered': {
    pt: 'Este usuário já está cadastrado',
    en: 'User already registered',
  },
  'user_already_registered': {
    pt: 'Este usuário já está cadastrado',
    en: 'User already registered',
  },
  'User already exists': {
    pt: 'Este email já está cadastrado',
    en: 'User already exists',
  },
  'user_already_exists': {
    pt: 'Este email já está cadastrado',
    en: 'User already exists',
  },
  'A user with this email address has already been registered': {
    pt: 'Este email já está cadastrado',
    en: 'A user with this email address has already been registered',
  },
  'Invalid email': {
    pt: 'Email inválido',
    en: 'Invalid email',
  },
  'invalid_email': {
    pt: 'Email inválido',
    en: 'Invalid email',
  },
  'Email rate limit exceeded': {
    pt: 'Muitas tentativas. Tente novamente mais tarde',
    en: 'Too many attempts. Please try again later',
  },
  'email_rate_limit_exceeded': {
    pt: 'Muitas tentativas. Tente novamente mais tarde',
    en: 'Too many attempts. Please try again later',
  },
  
  // Erros de senha
  'Password should be at least 6 characters': {
    pt: 'A senha deve ter pelo menos 6 caracteres',
    en: 'Password should be at least 6 characters',
  },
  'Password must be at least 6 characters': {
    pt: 'A senha deve ter pelo menos 6 caracteres',
    en: 'Password must be at least 6 characters',
  },
  'weak_password': {
    pt: 'A senha é muito fraca',
    en: 'Password is too weak',
  },
  'Password is too weak': {
    pt: 'A senha é muito fraca',
    en: 'Password is too weak',
  },
  
  // Outros erros
  'Signup is disabled': {
    pt: 'Cadastro está desabilitado',
    en: 'Signup is disabled',
  },
  'signup_disabled': {
    pt: 'Cadastro está desabilitado',
    en: 'Signup is disabled',
  },
  'Token has expired or is invalid': {
    pt: 'Token expirado ou inválido',
    en: 'Token has expired or is invalid',
  },
  'Session expired': {
    pt: 'Sessão expirada. Faça login novamente',
    en: 'Session expired. Please log in again',
  },
}

/**
 * Traduz uma mensagem de erro do Supabase Auth
 * @param error - Objeto de erro do Supabase ou mensagem de erro
 * @param lang - Idioma para tradução ('pt' ou 'en')
 * @returns Mensagem de erro traduzida
 */
export function translateAuthError(
  error: { message?: string; code?: string } | string | null,
  lang: Language = 'pt'
): string {
  if (!error) {
    return lang === 'pt' ? 'Ocorreu um erro. Tente novamente' : 'An error occurred. Please try again'
  }

  // Se for string, usar diretamente
  const errorMessage = typeof error === 'string' ? error : error.message || ''
  const errorCode = typeof error === 'object' && error.code ? error.code : ''

  // Tentar encontrar tradução pela mensagem
  if (errorMessage && ERROR_TRANSLATIONS[errorMessage]) {
    return ERROR_TRANSLATIONS[errorMessage][lang]
  }

  // Tentar encontrar tradução pelo código
  if (errorCode && ERROR_TRANSLATIONS[errorCode]) {
    return ERROR_TRANSLATIONS[errorCode][lang]
  }

  // Verificar se alguma chave parcial corresponde
  for (const [key, translation] of Object.entries(ERROR_TRANSLATIONS)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return translation[lang]
    }
  }

  // Se não encontrar tradução, retornar mensagem genérica ou original
  if (errorMessage) {
    // Retornar mensagem original se não encontrar tradução
    return errorMessage
  }

  return lang === 'pt' ? 'Ocorreu um erro. Tente novamente' : 'An error occurred. Please try again'
}
