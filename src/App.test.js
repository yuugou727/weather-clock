import React from 'react';
import { render } from 'enzyme'; 
import App from './App';

it('renders without crashing', () => {
  expect(render(<App />));
});
