// Одноразовый capture-перехватчик click: свайп, закончившийся на карточке,
// не должен превратиться в press по ней. Снимает себя сам после первого click
// или принудительно — свежий тач/отмена/cleanup (та же схема, что у мыши).
export const attachClickGuard = (node: HTMLElement) => {
  let guard: ((event: Event) => void) | null = null

  const remove = () => {
    if (!guard) return
    node.removeEventListener('click', guard, true)
    guard = null
  }

  const arm = () => {
    if (guard) return
    guard = event => {
      event.preventDefault()
      event.stopPropagation()
      remove()
    }
    node.addEventListener('click', guard, true)
  }

  return { arm, remove }
}
