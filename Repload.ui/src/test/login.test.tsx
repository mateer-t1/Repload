import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import Login from '../routes/login'
import * as api from '../lib/api'


// MOCKS

const navigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  createFileRoute: () => () => ({}),
}))

vi.mock('../lib/api', () => ({
  login: vi.fn(),
  setAuth: vi.fn(),
}))

vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Loader2: () => <div data-testid="loader" />,
}))

// TESTSS

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders login form correctly', () => {
    render(<Login />)

    expect(screen.getByPlaceholderText('you@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument()
  })

  it('updates input fields', async () => {
    const user = userEvent.setup()
    render(<Login />)

    await user.type(
      screen.getByPlaceholderText('you@email.com'),
      'test@mail.com',
    )

    await user.type(
      screen.getByPlaceholderText('••••••••'),
      'password123',
    )

    expect(screen.getByPlaceholderText('you@email.com')).toHaveValue(
      'test@mail.com',
    )

    expect(screen.getByPlaceholderText('••••••••')).toHaveValue(
      'password123',
    )
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const input = screen.getByPlaceholderText('••••••••')
    const toggleBtn = input.parentElement!.querySelector('button')!

    expect(input).toHaveAttribute('type', 'password')

    await user.click(toggleBtn)
    expect(input).toHaveAttribute('type', 'text')

    await user.click(toggleBtn)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()

    const mockResponse: api.AuthResponse = {
      token: 'token-123',
      user: {
        id: 1,
        username: 'john',
        email: 'john@mail.com',
      },
    }

    vi.mocked(api.login).mockResolvedValue(mockResponse)

    render(<Login />)

    await user.type(
      screen.getByPlaceholderText('you@email.com'),
      'john@mail.com',
    )

    await user.type(
      screen.getByPlaceholderText('••••••••'),
      'password123',
    )

    await user.click(
      screen.getByRole('button', { name: /sign in/i }),
    )

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith(
        'john@mail.com',
        'password123',
      )
    })

    expect(api.setAuth).toHaveBeenCalledWith(
      mockResponse.token,
      mockResponse.user,
    )

    expect(navigate).toHaveBeenCalledWith({
      to: '/dashboard',
      replace: true,
    })
  })

  it('handles login error', async () => {
    const user = userEvent.setup()

    vi.mocked(api.login).mockRejectedValue(
      new Error('Invalid credentials'),
    )

    render(<Login />)

    await user.type(
      screen.getByPlaceholderText('you@email.com'),
      'wrong@mail.com',
    )

    await user.type(
      screen.getByPlaceholderText('••••••••'),
      'wrongpass',
    )

    await user.click(
      screen.getByRole('button', { name: /sign in/i }),
    )

    expect(
      await screen.findByText('Invalid credentials'),
    ).toBeInTheDocument()

    expect(api.setAuth).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})