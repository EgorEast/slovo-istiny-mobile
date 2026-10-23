import { parseItemsRows } from 'shared/lib/utils/parseItemsRows'
import { maxItemsError, maxLengthError } from 'shared/lib/validation/formValidation'
import { INPUT_LIMITS } from 'shared/lib/validation/inputLimits'
import { type SectionFormValues } from './sectionFormState'

/**
 * Границы спецификации для формы раздела: длины полей, число строк слайдера и
 * размер массива плейлистов. '' — значения в допустимых пределах.
 * @param values - Текущие значения формы.
 */
export const sectionValidationError = (values: SectionFormValues): string => {
  const itemsRows = parseItemsRows(values.itemsRows)

  return (
    maxLengthError(values.title, INPUT_LIMITS.section.title, 'Название') ||
    maxLengthError(values.description, INPUT_LIMITS.section.description, 'Описание') ||
    (itemsRows !== null && itemsRows > INPUT_LIMITS.section.itemsRows
      ? `Строк: не более ${INPUT_LIMITS.section.itemsRows}.`
      : '') ||
    maxItemsError(values.selectedPlaylistIds.length, INPUT_LIMITS.section.playlists, 'Плейлисты')
  )
}
