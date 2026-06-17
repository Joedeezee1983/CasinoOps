import { LoginForm } from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-casino-dark px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-casino-accent">CasinoOps</h1>
          <p className="text-casino-muted mt-2">Slot Tech Shift Management</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
