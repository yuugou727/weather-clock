import { shallow, mount, render } from 'enzyme';
import React from 'react';
import Clock from './Clock.js';

it.skip('renders without crashing', () => {
  shallow(<Clock />);
});

describe('Clock', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('expect update interval works', () => {
    const component = mount(<Clock />);
    expect(setInterval).toHaveBeenCalledTimes(1);
    component.unmount();
    expect(clearInterval).toHaveBeenCalledTimes(1);
  });

});