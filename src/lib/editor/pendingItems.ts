export const PENDING_ITEM_PREFIX = 'pending-'

export function isPendingTemplateItemId(id: string): boolean {
  return id.startsWith(PENDING_ITEM_PREFIX)
}

export function createPendingItemId(): string {
  return `${PENDING_ITEM_PREFIX}${crypto.randomUUID()}`
}
