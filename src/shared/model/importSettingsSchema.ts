import z from 'zod'
import { splitBasicAuthUrl } from '../lib/basicAuthUrl'

// http:// разрешён: инстанс часто поднимают локально в своей сети.
const isHttpUrl = (value: string): boolean =>
  value.startsWith('http://') || value.startsWith('https://')

const isHttpUrlWithoutUserinfo = (value: string): boolean =>
  isHttpUrl(value) && splitBasicAuthUrl(value).credentials === null

// Значение из хранилища — недоверенный ввод (оно переживает обновления
// приложения), поэтому читаем его через схему, а не доверяя форме. Basic-auth
// живёт в защищённом хранилище, поэтому userinfo (`user:pass@host`) в адресе —
// невалидное значение.
export const importSettingsSchema = z.object({
  invidiousBaseUrl: z.url().refine(isHttpUrlWithoutUserinfo, {
    message: 'Адрес инстанса не должен содержать логин и пароль',
  }),
  source: z.enum(['invidious', 'youtube']),
})

// Историческая форма: до выноса basic-auth адрес хранился целиком с userinfo.
// Нужна только миграции при чтении и разбору старых резервных копий.
export const legacyImportSettingsSchema = z.object({
  invidiousBaseUrl: z.url().refine(isHttpUrl),
  source: z.enum(['invidious', 'youtube']),
})
