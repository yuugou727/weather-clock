import { shallow, mount, render } from 'enzyme';
import React from 'react';
import Clock from './Clock.js';

it('expect to render Clock component', () => {
  expect(render(<Clock />));
});

it('expect to tick after mounted', () => {
  const clock = mount(<Clock />);
  expect(clock.state().date).not.toBeNull();

  setTimeout(() => {
    expect(clock.state().date).toBeNull();
  }, 1000);
});