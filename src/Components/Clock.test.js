import { cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Clock from './Clock';

afterEach(cleanup);

it('should ticks in 1 second', async () => {
  const { getByRole } = render(<Clock />);
  const second = getByRole('seconds').innerHTML;

  await waitFor(() => {
    const nextSecond = getByRole('seconds').innerHTML;
    expect(nextSecond).not.toEqual(second);
  }, { interval: 1000 });
});
