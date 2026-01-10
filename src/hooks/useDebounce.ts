import { useCallback, useRef, useEffect } from 'react'
import debounce from 'lodash.debounce'

/**
 * Hook customizado para debounce de funções
 * Útil para otimizar eventos que ocorrem frequentemente (ex: dragOver)
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback)

  // Atualiza a referência do callback quando ele muda
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cria uma versão debounced do callback que sempre usa a versão mais recente
  const debouncedCallbackRef = useRef(
    debounce((...args: Parameters<T>) => {
      callbackRef.current(...args)
    }, delay)
  )

  // Atualiza o debounced callback quando delay muda
  useEffect(() => {
    debouncedCallbackRef.current.cancel()
    debouncedCallbackRef.current = debounce((...args: Parameters<T>) => {
      callbackRef.current(...args)
    }, delay)
  }, [delay])

  // Limpa o debounce quando o componente desmonta
  useEffect(() => {
    return () => {
      debouncedCallbackRef.current.cancel()
    }
  }, [])

  return debouncedCallbackRef.current as unknown as T
}
