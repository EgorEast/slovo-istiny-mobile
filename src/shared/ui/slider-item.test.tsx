import { render, screen } from '@testing-library/react-native';
import { SliderItem } from './slider-item';
// eslint-disable-next-line import/no-internal-modules
import '@testing-library/jest-native/extend-expect';

const propsStub = {
  previewURL: 'https://traveltimes.ru/wp-content/uploads/2021/07/image-4-2048x1366.jpg',
  description: 'Hello',
};

describe('<SliderItem/>', () => {
  test('return null if previewURL prop is undefined', () => {
    // @ts-expect-error - undefined is a not a valid previewURL
    render(<SliderItem previewURL={undefined} />);

    const tree = screen.toJSON();
    expect(tree).toBeNull();
  });

  test('return null, if previewURL === ""', () => {
    render(<SliderItem previewURL='' />);

    const tree = screen.toJSON();
    expect(tree).toBeNull();
  });

  test('not return null or array, if previewURL is valid', () => {
    render(<SliderItem previewURL={propsStub.previewURL} />);

    const tree = screen.toJSON();
    expect(tree).not.toBeNull();
    expect(Array.isArray(tree)).toEqual(false);
  });

  test('return TouchableImageBackground, if previewURL is valid', () => {
    render(<SliderItem previewURL={propsStub.previewURL} />);

    const tree = screen.toJSON();

    if (!tree || Array.isArray(tree)) {
      return;
    }

    expect(tree.type).toEqual('View');

    expect(tree.children).not.toBeNull();
    expect(tree.children?.length).toEqual(1);
  });

  test('description visible, if description prop defined', () => {
    render(<SliderItem previewURL={propsStub.previewURL} description={propsStub.description} />);

    const tree = screen.toJSON();

    if (!tree || Array.isArray(tree)) {
      return;
    }

    const sliderItemDescription = screen.getByTestId('slider-item-description');

    expect(sliderItemDescription).not.toBeFalsy();
  });
  test('description component type is View', () => {
    render(<SliderItem previewURL={propsStub.previewURL} description={propsStub.description} />);

    const tree = screen.toJSON();

    if (!tree || Array.isArray(tree)) {
      return;
    }

    const sliderItemDescription = screen.getByTestId('slider-item-description');

    expect(sliderItemDescription?.type).toEqual('View');
  });
  test('description child component type is Text in View', () => {
    render(<SliderItem previewURL={propsStub.previewURL} description={propsStub.description} />);

    const sliderItemDescription = screen.getByTestId('slider-item-description');
    const sliderItemDescriptionText = screen.getByTestId('slider-item-description-text');

    expect(sliderItemDescription?.children.length).toEqual(1);

    expect(sliderItemDescriptionText?.type).toEqual('Text');
    expect(typeof sliderItemDescriptionText?.children[0]).toEqual('string');
  });

  test('text in description field equals to description prop', () => {
    render(<SliderItem previewURL={propsStub.previewURL} description={propsStub.description} />);

    const sliderItemDescriptionText = screen.getByTestId('slider-item-description-text');

    expect(sliderItemDescriptionText).toHaveTextContent(propsStub.description);
  });
});