import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

it('renders App without crashing', async () => {
  const { getByRole } = render(<App />);

  await waitFor(() => {
    const footer = getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  })
});
