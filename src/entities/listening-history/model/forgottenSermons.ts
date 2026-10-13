// «Тамбстоуны» удалённых записей: защита от воссоздания записи следующим
// flush'ом после удаления. Пользователь удалил проповедь из истории в этой
// сессии — фоновые писатели (10с-флаш, переключение, старт воспроизведения)
// не должны вернуть её обратно. Память сессионная: после перезапуска записи
// и так нет (история на диске), поэтому хранить тамбстоуны на диске незачем.
const forgottenSermonIds = new Set<string>()

export const forgetSermon = (sermonId: string): void => {
  forgottenSermonIds.add(sermonId)
}

export const isSermonForgotten = (sermonId: string): boolean => forgottenSermonIds.has(sermonId)
