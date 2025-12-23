import { render, screen } from '@testing-library/react'
import App from './App'

test('renders app shell', () => {
  render(<App />)
  // App shows a loading progressbar while user state loads.
  expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
