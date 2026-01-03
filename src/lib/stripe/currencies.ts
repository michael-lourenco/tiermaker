/**
 * Stripe Currencies Configuration
 * Configuração de moedas - Desacoplada para fácil expansão
 */

export interface CurrencyConfig {
  code: string // ISO 4217 currency code (BRL, USD, etc)
  symbol: string // R$, $, etc
  name: string // Real Brasileiro, US Dollar, etc
  stripeSupported: boolean // Se é suportado pelo Stripe
}

/**
 * Configuração de moedas disponíveis
 * Estrutura desacoplada para fácil adição/remoção de moedas
 */
export const CURRENCIES: Record<string, CurrencyConfig> = {
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Real Brasileiro',
    stripeSupported: true,
  },
  // Exemplo de como adicionar mais moedas no futuro:
  // USD: {
  //   code: 'USD',
  //   symbol: '$',
  //   name: 'US Dollar',
  //   stripeSupported: true,
  // },
}

/**
 * Moeda padrão (BRL para Brasil)
 */
export const DEFAULT_CURRENCY = 'BRL'

/**
 * Obter configuração de moeda
 */
export function getCurrencyConfig(currencyCode: string): CurrencyConfig | null {
  return CURRENCIES[currencyCode.toUpperCase()] || null
}

/**
 * Verificar se moeda é suportada
 */
export function isCurrencySupported(currencyCode: string): boolean {
  const config = getCurrencyConfig(currencyCode)
  return config?.stripeSupported ?? false
}

/**
 * Listar todas as moedas disponíveis
 */
export function getAvailableCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCIES).filter((c) => c.stripeSupported)
}
