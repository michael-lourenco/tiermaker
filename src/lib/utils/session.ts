/**
 * Session ID management utility
 * 
 * Gera e gerencia session_id para usuários não autenticados.
 * O session_id é armazenado em cookie e persiste entre sessões do navegador.
 */

import { v4 as uuidv4 } from 'uuid'

const SESSION_ID_COOKIE_NAME = 'tiermaker_session_id'
const SESSION_ID_MAX_AGE = 365 * 24 * 60 * 60 // 1 ano em segundos

/**
 * Gera um novo session_id (UUID v4)
 */
export function generateSessionId(): string {
  return uuidv4()
}

/**
 * Obtém ou cria session_id do cookie
 * Se não existir, cria um novo e retorna
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side: retorna um novo ID (será criado no cliente)
    return generateSessionId()
  }

  // Client-side: tenta obter do cookie
  const cookies = document.cookie.split(';')
  const sessionCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${SESSION_ID_COOKIE_NAME}=`)
  )

  if (sessionCookie) {
    const sessionId = sessionCookie.split('=')[1]?.trim()
    if (sessionId) {
      return sessionId
    }
  }

  // Se não existe, cria um novo
  const newSessionId = generateSessionId()
  setSessionIdCookie(newSessionId)
  return newSessionId
}

/**
 * Define o session_id no cookie
 */
export function setSessionIdCookie(sessionId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  // Define cookie com expiração de 1 ano
  const expires = new Date()
  expires.setTime(expires.getTime() + SESSION_ID_MAX_AGE * 1000)
  
  document.cookie = `${SESSION_ID_COOKIE_NAME}=${sessionId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

/**
 * Remove o session_id do cookie (útil para logout ou limpeza)
 */
export function clearSessionId(): void {
  if (typeof window === 'undefined') {
    return
  }

  document.cookie = `${SESSION_ID_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

