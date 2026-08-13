/**
 * Regras de visibilidade pública: conteúdo público exige imagem de capa do template.
 */

export function hasCoverImage(url: string | null | undefined): boolean {
  return Boolean(url?.trim())
}

/** Público só se o usuário pediu e existe capa. */
export function resolveIsPublic(
  wantsPublic: boolean | undefined,
  coverImageUrl: string | null | undefined
): boolean {
  return Boolean(wantsPublic) && hasCoverImage(coverImageUrl)
}
