import { action } from '@reatom/framework'
import { commitHistory } from '../model/commitHistory'
import { forgetSermon } from '../model/forgottenSermons'
import { historyAtom } from '../model/historyAtom'
import { getEntrySermon } from './getEntrySermon'
import { clearLiveProgressSnapshot } from './liveProgressStorage'

export const removeHistoryEntryAction = action(async (ctx, sermonId: string) => {
  const current = ctx.get(historyAtom)
  const next = current.filter(e => getEntrySermon(e)?.id !== sermonId)

  if (next.length === current.length) return

  // Тамбстоун ставим ДО коммита: следующий flush, прочитавший атом после
  // удаления, уже увидит защиту и не воскресит запись.
  forgetSermon(sermonId)
  await commitHistory(ctx, next)
  clearLiveProgressSnapshot()
}, 'removeHistoryEntry')
