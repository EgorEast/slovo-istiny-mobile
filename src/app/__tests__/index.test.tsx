import React from 'react';
import renderer from 'react-test-renderer';

import App from 'app';

describe('<App />', () => {
  it('has 2 child', () => {
    const tree = renderer.create(<App />).toJSON();

    if (tree) {
      if (!Array.isArray(tree) && tree.children) {
        expect(tree.children.length).toBe(2);
      }
    }
  });
});
