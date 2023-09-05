import { render, screen } from '@testing-library/react-native';
import { ListItem } from './list-item';
// eslint-disable-next-line import/no-internal-modules
import '@testing-library/jest-native/extend-expect';

const previewPlaceholderTextStub = '1';

const titleStub = 'test';

const previewUrlStub = 'google.com';

describe('<TouchableListItem>', () => {
  test('if data defined return View', () => {
    render(<ListItem data={{ title: titleStub }} />);

    const tree = screen.toJSON();

    if (!tree || Array.isArray(tree)) {
      return;
    }

    expect(tree.type).toEqual('View');
  });

  test('if title prop defined title element equals title prop', () => {
    render(<ListItem data={{ title: titleStub }} />);

    const title = screen.getByTestId('title');

    expect(title).toHaveTextContent(titleStub);
  });

  test('displayed placeholder text if previewUrl in data not defined', () => {
    render(
      <ListItem previewPlaceholderText={previewPlaceholderTextStub} data={{ title: titleStub }} />,
    );

    const previewOrCounter = screen.getByTestId('preview-or-counter');
    const preview = screen.queryByTestId('preview');

    expect(preview).toBeNull();
    expect(previewOrCounter).toHaveTextContent(previewPlaceholderTextStub);
  });

  test('displayed preview if previewUrl in data is defined', () => {
    render(
      <ListItem
        previewPlaceholderText={previewPlaceholderTextStub}
        data={{ title: titleStub, previewUrl: previewUrlStub }}
      />,
    );

    const previewOrCounter = screen.getByTestId('preview-or-counter');
    const preview = screen.queryByTestId('preview');

    expect(previewOrCounter).not.toHaveTextContent(previewPlaceholderTextStub);
    expect(preview).not.toBeNull();
    expect(preview?.type).toEqual('Image');
  });
});