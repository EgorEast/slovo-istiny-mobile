import { Slider, SliderItemSize, SliderItemTransform, WhereIsSlideTitleLocated } from 'shared/ui'

interface SkeletonSectionProps {
  borderRadius?: boolean
  itemsCount?: number
  itemsRows?: number
  itemsSize?: SliderItemSize
  titleFontSize?: number
  transform?: SliderItemTransform
  whereIsSlideTitleLocated?: WhereIsSlideTitleLocated
}

// Первая запись повторяет продакшн-секцию: высокое artwork, Middle, заголовок на карточке.
const SKELETON_SECTIONS: SkeletonSectionProps[] = [
  {
    itemsCount: 6,
    itemsSize: SliderItemSize.Middle,
    transform: SliderItemTransform.High,
    whereIsSlideTitleLocated: WhereIsSlideTitleLocated.On,
  },
  { itemsCount: 6, itemsSize: SliderItemSize.Middle },
  { itemsCount: 4, itemsSize: SliderItemSize.XLarge },
  { itemsCount: 6, itemsSize: SliderItemSize.Middle, transform: SliderItemTransform.Short },
]

export const SectionsSkeleton = () => (
  <>
    {SKELETON_SECTIONS.map((section, index) => (
      <Slider.Skeleton key={index} {...section} />
    ))}
  </>
)
