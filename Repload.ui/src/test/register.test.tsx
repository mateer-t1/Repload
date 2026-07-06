import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import Register from '../routes/register'
import * as api from '../lib/api'

// MOCKS

const navigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,

  createFileRoute: () => () => ({}),
}))

vi.mock('../lib/api', () => ({
  register: vi.fn(),
  setAuth: vi.fn(),
}))

vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div />,
  Dumbbell: () => <div />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Loader2: () => <div data-testid="loader" />,
}))

// TESTS


describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders form correctly', () => {
    render(<Register />)

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument()
  })

  it('redirects if already logged in', () => {
    localStorage.setItem('token', 't')
    localStorage.setItem('user', JSON.stringify({ id: 1 }))

    render(<Register />)

    expect(navigate).toHaveBeenCalledWith({
      to: '/dashboard',
      replace: true,
    })
  })

  it('updates inputs', async () => {
    const user = userEvent.setup()
    render(<Register />)

    await user.type(screen.getByPlaceholderText('Username'), 'john')
    await user.type(screen.getByPlaceholderText('you@email.com'), 'john@mail.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')

    expect(screen.getByPlaceholderText('Username')).toHaveValue('john')
    expect(screen.getByPlaceholderText('you@email.com')).toHaveValue('john@mail.com')
    expect(screen.getByPlaceholderText('••••••••')).toHaveValue('password123')
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<Register />)

    const input = screen.getByPlaceholderText('••••••••')
    const toggleBtn = input.parentElement!.querySelector('button')!

    expect(input).toHaveAttribute('type', 'password')

    await user.click(toggleBtn)
    expect(input).toHaveAttribute('type', 'text')

    await user.click(toggleBtn)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('validates password length', async () => {
    const user = userEvent.setup()
    render(<Register />)

    await user.type(screen.getByPlaceholderText('Username'), 'john')
    await user.type(screen.getByPlaceholderText('you@email.com'), 'john@mail.com')
    await user.type(screen.getByPlaceholderText('••••••••'), '123')

    await user.click(
      screen.getByRole('button', { name: /create account/i }),
    )

    expect(
      await screen.findByText('Password must be at least 6 characters'),
    ).toBeInTheDocument()

    expect(api.register).not.toHaveBeenCalled()
  })

  it('handles successful registration', async () => {
    const user = userEvent.setup()

    const mockResponse: api.AuthResponse = {
      token: 'token-123',
      user: {
        id: 1,
        username: 'john',
        email: 'john@mail.com',
      },
    }

    vi.mocked(api.register).mockResolvedValue(mockResponse)

    render(<Register />)

    await user.type(screen.getByPlaceholderText('Username'), 'john')
    await user.type(screen.getByPlaceholderText('you@email.com'), 'john@mail.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    })

    await user.click(submitButton)

    await waitFor(() => {
      expect(api.register).toHaveBeenCalled()
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

  it('handles registration error', async () => {
    const user = userEvent.setup()

    vi.mocked(api.register).mockRejectedValue(
      new Error('Email already in use'),
    )

    render(<Register />)

    await user.type(screen.getByPlaceholderText('Username'), 'john')
    await user.type(screen.getByPlaceholderText('you@email.com'), 'john@mail.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')

    await user.click(
      screen.getByRole('button', { name: /create account/i }),
    )

    expect(await screen.findByText('Email already in use')).toBeInTheDocument()

    expect(api.setAuth).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})