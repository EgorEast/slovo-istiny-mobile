import z from 'zod'

// Закэшированная карта флагов: ключ флага → включён.
export const featureFlagsMapSchema = z.record(z.string(), z.boolean())
