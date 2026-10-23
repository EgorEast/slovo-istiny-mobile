import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  type ImportSettings,
  loadImportSettings,
  persistImportSettings,
} from 'shared/model'

// Свой инстанс часто поднимают в локальной сети и вводят без схемы («192.168.1.10:8080»),
// но хранить такой адрес нельзя: fetch без схемы не разберёт хост. Нормализуем адрес
// на границе ввода (в коммите поля), поэтому в хранилище попадает только URL со схемой;
// схема в zod-схеме хранилища (`shared/model`) остаётся страховкой для чужих/битых данных.
// Учётные данные (basic auth) допустимы во вводе: адрес вида «user:pass@host»
// нормализуется в «https://user:pass@host», а при сохранении `persistImportSettings`
// выносит креды в защищённое хранилище и пишет адрес без userinfo. В памяти адрес
// остаётся как введён, поэтому текущий запрос использует креды из него.
const URL_WITH_SCHEME = /^https?:\/\//i
const FALLBACK_SCHEME = 'http://'

/**
 * Приводит введённый адрес инстанса к URL со схемой: пустое значение и уже
 * готовый URL меняет только схему, хвостовые слэши убирает. Учётные данные
 * (user:pass@host) сохраняются в значении как часть ввода — в хранилище их
 * выносит `persistImportSettings`.
 * @param invidiousBaseUrl - Адрес инстанса, введённый администратором.
 */
export const normalizeInvidiousBaseUrl = (invidiousBaseUrl: string): string => {
  const trimmed = invidiousBaseUrl.trim()

  if (!trimmed) return ''
  const withScheme = URL_WITH_SCHEME.test(trimmed) ? trimmed : `${FALLBACK_SCHEME}${trimmed}`

  return withScheme.replace(/\/+$/, '')
}

/**
 * Настройки источника импорта с ленивой загрузкой из хранилища: в памяти держим
 * дефолт до монтирования, изменения применяются сразу и пишутся в хранилище без
 * ожидания.
 */
export const useImportSettings = () => {
  const [settings, setSettings] = useState<ImportSettings>(DEFAULT_SETTINGS)
  // Последние известные настройки держим ещё и в ref: апдейтер state обязан быть
  // чистым (никаких записей в хранилище внутри setSettings), а сохранять нужно уже
  // посчитанное значение. Пишет ref только код фичи — загрузка при монтировании и
  // updateSettings, поэтому база патча всегда актуальна.
  const settingsRef = useRef<ImportSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      const stored = await loadImportSettings()
      if (!isMounted) return
      settingsRef.current = stored
      setSettings(stored)
    }
    void load()

    return () => {
      isMounted = false
    }
  }, [])

  const updateSettings = useCallback((patch: Partial<ImportSettings>) => {
    let next: ImportSettings = settingsRef.current

    if (patch.invidiousBaseUrl !== undefined) {
      const normalized = normalizeInvidiousBaseUrl(patch.invidiousBaseUrl)
      // Храним в хранилище нормализованное значение: пустой адрес не валиден по
      // схеме, поэтому сохраняем только когда нормализация дала непустой результат.
      if (normalized === '') return
      next = { ...settingsRef.current, invidiousBaseUrl: normalized }
    }

    if (patch.source !== undefined) next = { ...next, source: patch.source }

    settingsRef.current = next
    setSettings(next)
    void persistImportSettings(next)
  }, [])

  return { settings, updateSettings }
}
