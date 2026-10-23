import { useAction, useAtom } from '@reatom/npm-react'
import { useEffect } from 'react'
import { OnboardingTarget } from 'features/onboarding'
import { type BookData } from 'entities/sermon'
import {
  Slider,
  SliderItemSize,
  SliderItemTextBackgroundStyle,
  SliderItemTransform,
  WhereIsSlideTitleLocated,
} from 'shared/ui'
import { useReadNavigation } from '../lib/useReadNavigation'
import {
  getNotesForPreachersBooksSlider,
  notesForPreachersBooksSliderAtom,
} from '../model-notesForPreachers'

export const NotesForPreachersBooksSlider = ({
  onboardingTargetId,
}: {
  onboardingTargetId?: string
}) => {
  const title = 'Конспекты для проповедников'

  const { navigateToBookReader, navigateToBooksList } = useReadNavigation()

  const notesForPreachersBooks = useAtom(notesForPreachersBooksSliderAtom)[0]
  const fetchNotesForPreachersBooks = useAction(getNotesForPreachersBooksSlider)

  const onItemPress = async (bookList: BookData) => {
    navigateToBookReader(bookList)
  }

  const onPressTitle = (params: BookData[]) => {
    navigateToBooksList(params, title)
  }

  useEffect(() => {
    void fetchNotesForPreachersBooks()
  }, [fetchNotesForPreachersBooks])

  return (
    <OnboardingTarget id={onboardingTargetId}>
      <Slider
        title={title}
        titleTextAlign='center'
        onPressItem={onItemPress}
        itemsSize={SliderItemSize.Large}
        transform={SliderItemTransform.High}
        whereIsSlideTitleLocated={WhereIsSlideTitleLocated.On}
        descriptionBackgroundStyle={SliderItemTextBackgroundStyle.DarkBlur}
        onPressTitle={() => {
          onPressTitle(notesForPreachersBooks)
        }}
        items={notesForPreachersBooks.map(item => ({
          artwork: item.artwork,
          data: item,
          title: item.title,
        }))}
      />
    </OnboardingTarget>
  )
}
