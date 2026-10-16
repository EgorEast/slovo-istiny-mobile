import AsyncStorage from '@react-native-async-storage/async-storage'
import type z from 'zod'
import { HTTP_URL_PATTERN } from '../model/backupScalars'

/**
 * Читает строку из хранилища и валидирует её схемой (отсутствие/невалидность → `undefined`).
 * @param key - Ключ AsyncStorage.
 * @param schema - Схема валидации прочитанного значения.
 */
export const readString = async <T>(key: string, schema: z.ZodType<T>): Promise<T | undefined> => {
  const raw = await AsyncStorage.getItem(key)
  if (raw === null) return undefined
  const parsed = schema.safeParse(raw)
  return parsed.success ? parsed.data : undefined
}

/**
 * Читает число из хранилища и валидирует его схемой (отсутствие/невалидность → `undefined`).
 * @param key - Ключ AsyncStorage.
 * @param schema - Схема валидации прочитанного числа.
 */
export const readNumber = async <T>(key: string, schema: z.ZodType<T>): Promise<T | undefined> => {
  const raw = await AsyncStorage.getItem(key)
  if (raw === null) return undefined
  const parsed = schema.safeParse(Number(raw))
  return parsed.success ? parsed.data : undefined
}

/**
 * Читает boolean из хранилища: только строка `'true'` означает `true`.
 * @param key - Ключ AsyncStorage.
 */
export const readBoolean = async (key: string): Promise<boolean | undefined> => {
  const raw = await AsyncStorage.getItem(key)
  if (raw === null) return undefined
  return raw === 'true'
}

/**
 * Читает JSON из хранилища и валидирует его схемой (битый JSON/невалидность → `undefined`).
 * @param key - Ключ AsyncStorage.
 * @param schema - Схема валидации разобранного значения.
 */
export const readJson = async <T>(key: string, schema: z.ZodType<T>): Promise<T | undefined> => {
  const raw = await AsyncStorage.getItem(key)
  if (raw === null) return undefined
  try {
    const value: unknown = JSON.parse(raw)
    const parsed = schema.safeParse(value)
    return parsed.success ? parsed.data : undefined
  } catch {
    return undefined
  }
}

/**
 * Читает http(s)-адрес из хранилища (без протокола/отсутствие → `undefined`).
 * @param key - Ключ AsyncStorage.
 */
export const readHttpUrl = async (key: string): Promise<string | undefined> => {
  const raw = await AsyncStorage.getItem(key)
  if (raw === null || !HTTP_URL_PATTERN.test(raw)) return undefined
  return raw
}
