'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error) {
      setError('Invalid email or password.')
      return
    }

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-casino-card border border-casino-border rounded-xl p-6 space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm text-casino-muted mb-1">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
          placeholder="tech@casino.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-casino-muted mb-1">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-casino-dark border border-casino-border rounded-lg px-3 py-2 text-casino-text text-sm focus:outline-none focus:border-casino-accent"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-casino-accent hover:bg-casino-accent-hover disabled:opacity-50 text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}

export { LoginForm }
