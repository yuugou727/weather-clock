import { shallow, monunt, render } from 'enzyme';
import React from 'react';
import Clock from './Clock.js';

it('expect to render Clock component', () => {
  expect(shallow(<Clock/>).length).toEqual(1);
});