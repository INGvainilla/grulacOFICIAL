import { ENTITIES, TIME_PATTERNS, STATE_WORDS, AGG_WORDS } from './patterns'

export function interpretarComando(texto) {
  const original = texto.trim()
  const normalized = original.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  let confianza = 0
  let entity = null
  let entityScore = 0
  let timeFilter = null
  let timeLabel = null
  let stateFilter = null
  let aggType = 'detail'
  let aggScore = 0
  let searchText = null

  // Detectar entidad
  for (const ent of ENTITIES) {
    for (const kw of ent.keywords) {
      if (normalized.includes(kw)) {
        const score = kw.length / normalized.length
        if (score > entityScore) {
          entityScore = score
          entity = ent
        }
      }
    }
  }

  // Detectar agregación
  for (const [type, words] of Object.entries(AGG_WORDS)) {
    for (const w of words) {
      if (normalized.includes(w)) {
        const s = w.length / normalized.length
        if (s > aggScore) { aggScore = s; aggType = type }
      }
    }
  }

  // Detectar filtro temporal
  for (const tp of TIME_PATTERNS) {
    const match = normalized.match(tp.regex)
    if (match) {
      timeFilter = tp.buildFilter(match)
      timeLabel = tp.label
      confianza += 15
      break
    }
  }

  // Detectar filtro de estado
  if (entity && STATE_WORDS[entity.id]) {
    const sw = STATE_WORDS[entity.id]
    for (const [kw, val] of Object.entries(sw.map)) {
      if (normalized.includes(kw)) {
        stateFilter = { column: sw.column, value: val }
        confianza += 15
        break
      }
    }
  }

  // Detectar búsqueda por nombre (lo que sobre después de quitar palabras clave)
  if (entity) {
    let restante = normalized
    const sortedKeywords = [...entity.keywords].sort((a, b) => b.length - a.length)
    for (const kw of sortedKeywords) { restante = restante.replaceAll(kw, '') }
    if (timeLabel) restante = restante.replaceAll(timeLabel, '')
    if (stateFilter) restante = restante.replaceAll(stateFilter.value.toLowerCase(), '')
    for (const words of Object.values(AGG_WORDS)) {
      for (const w of words) restante = restante.replaceAll(w, '')
    }
    restante = restante.replace(/[^a-z0-9\s]/g, '').trim()
    if (restante && restante.length >= 2 && restante.split(/\s+/).filter(Boolean).length <= 4) {
      searchText = restante
    }
  }

  // Calcular confianza de entidad
  if (entity) {
    confianza += Math.round(entityScore * 60)
  }

  confianza = Math.min(confianza + 20, 100)

  return {
    original,
    normalized,
    entity: entity || null,
    entityLabel: entity?.label || null,
    entityIcon: entity?.icon || null,
    tables: entity?.tables || [],
    aggType,
    timeFilter,
    timeLabel,
    stateFilter,
    searchText,
    confianza,
    valido: confianza >= 30 && entity !== null,
  }
}
