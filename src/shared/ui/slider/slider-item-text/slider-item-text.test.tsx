import { screen } from '@testing-library/react-native'
import { renderWithProviders } from '../../../mocks/renderWithProviders'
import { SliderItemText } from './slider-item-text'

const propsStub = {
  subTitle: 'Sub',
  title: 'Hello',
}

describe('<SliderItemText/>', () => {
  test('return null if title prop is undefined', async () => {
    await renderWithProviders(
      <SliderItemText
        // @ts-expect-error - undefined is not a valid title
        title={undefined}
      />,
    )

    expect(screen.queryByText(propsStub.title)).toBeNull()
  })

  test('return null, if title === ""', async () => {
    await renderWithProviders(<SliderItemText title='' />)

    expect(screen.queryByText(propsStub.title)).toBeNull()
  })

  test('renders the title text when title is valid', async () => {
    await renderWithProviders(<SliderItemText title={propsStub.title} />)

    const title = screen.getAllByText(propsStub.title)[0]

    expect(title).toBeTruthy()
    expect(title.type).toEqual('Text')
    expect(title).toHaveTextContent(propsStub.title, { exact: false })
  })

  test('keeps the title on one line by default', async () => {
    await renderWithProviders(<SliderItemText title={propsStub.title} />)

    expect(screen.getByText(propsStub.title).props.numberOfLines).toEqual(1)
  })

  test('honours the maxLines and titleFontSize overrides', async () => {
    await renderWithProviders(
      <SliderItemText maxLines={2} titleFontSize={20} title={propsStub.title} />,
    )

    const title = screen.getByText(propsStub.title)

    expect(title.props.numberOfLines).toEqual(2)
    expect(title).toHaveStyle({ fontSize: 20 })
  })

  test('renders the sub title when subTitle prop is defined', async () => {
    await renderWithProviders(
      <SliderItemText title={propsStub.title} subTitle={propsStub.subTitle} />,
    )

    const subTitle = screen.getByText(propsStub.subTitle)

    expect(subTitle.type).toEqual('Text')
    expect(subTitle).toHaveTextContent(propsStub.subTitle, { exact: false })
  })
})
