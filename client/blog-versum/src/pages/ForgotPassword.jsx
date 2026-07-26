import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmailVerificationCard from '../components/EmailVerificationCard'
import PageDoodles from '../components/shared/PageDoodles'
import BrandLogo from '../components/shared/BrandLogo'
import { useAuthStore } from '../store/useAuthStore'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

// Three-step reset: enter email → verify emailed OTP → set a new password.
export default function ForgotPassword() {
  const navigate = useNavigate()
  const { forgotPassword, verifyResetOTP, resetPassword } = useAuthStore()

  const [step, setStep] = useState('email') // 'email' | 'otp' | 'password'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [passwords, setPasswords] = useState({ next: '', confirm: '' })

  const [isSending, setIsSending] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Step 1 — request an OTP for the account on file.
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (email.trim().length === 0) {
      toast.error('Please enter your email or username')
      return
    }
    setIsSending(true)
    const sent = await forgotPassword({ email: email.trim() })
    setIsSending(false)
    if (sent) setStep('otp')
  }

  // Step 2 — confirm the OTP (kept in state for the final reset call).
  const handleVerifyOtp = async (code) => {
    const verified = await verifyResetOTP({ email: email.trim(), otp: code })
    if (verified) {
      setOtp(code)
      setStep('password')
      return true
    }
    return false
  }

  const handleResendOtp = async () => {
    return await forgotPassword({ email: email.trim() })
  }

  // Step 3 — set the new password (server re-validates the OTP).
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (passwords.next.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (passwords.next !== passwords.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setIsResetting(true)
    const done = await resetPassword({ email: email.trim(), otp, newPassword: passwords.next })
    setIsResetting(false)
    if (done) navigate('/login')
  }

  return (
    <div className="layout-container flex h-full grow flex-col min-h-screen bg-[#f8f5f6] dark:bg-[#221014] font-display relative">
      <PageDoodles variant="corners" />

      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 md:px-10 py-4 bg-white dark:bg-[#221014]">
        <BrandLogo onClick={() => navigate('/')} />
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/')} className="text-slate-700 dark:text-slate-300 text-sm font-bold hover:text-primary transition-colors">Home</button>
          </nav>
          <button
            onClick={() => navigate('/login')}
            className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-full h-11 px-5 bg-primary text-white text-sm font-black shadow-lg hover:scale-105 transition-transform"
          >
            Log In
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-[480px]">
          <div className="bg-white dark:bg-[#221014] p-8 md:p-10 rounded-xl border-4 border-whimsical-purple shadow-2xl">

            {step === 'email' && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="bg-primary/10 text-primary p-4 rounded-full">
                    <span className="material-symbols-outlined text-4xl">lock_reset</span>
                  </div>
                </div>
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Forgot Password?</h2>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    No worries! Enter your email and we&apos;ll send you a code to reset it.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleRequestOtp}>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1">Email or Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-bubbly-teal">alternate_email</span>
                      </div>
                      <input
                        className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-bubbly-teal focus:ring-4 focus:ring-bubbly-teal/20 focus:border-bubbly-teal outline-none transition-all font-medium text-slate-900 dark:text-slate-100"
                        placeholder="awesome.writer@blogverse.com"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-14 bg-primary text-white text-lg font-black rounded-xl bouncy-shadow-primary hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-70"
                    disabled={isSending}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Code'
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center font-bold text-slate-600 dark:text-slate-400">
                  Remembered it?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-whimsical-purple hover:text-primary underline decoration-2 underline-offset-4 transition-colors font-black"
                  >
                    Back to Login
                  </button>
                </p>
              </>
            )}

            {step === 'otp' && (
              <div className="space-y-6">
                <EmailVerificationCard
                  email={email}
                  onResend={handleResendOtp}
                  onVerify={handleVerifyOtp}
                  title="Enter Reset Code"
                  description={`We've sent a one-time code to your email${email ? ` (${email})` : ''}. Enter it below to continue.`}
                  buttonLabel="VERIFY CODE"
                />
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full py-3 rounded-xl border-2 border-primary/20 text-primary font-bold hover:bg-primary/10 transition-all"
                >
                  Use a different email
                </button>
              </div>
            )}

            {step === 'password' && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="bg-primary/10 text-primary p-4 rounded-full">
                    <span className="material-symbols-outlined text-4xl">password</span>
                  </div>
                </div>
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Set New Password</h2>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Choose a strong password you&apos;ll remember.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleResetPassword}>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-bubbly-teal">lock</span>
                      </div>
                      <input
                        className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-bubbly-teal focus:ring-4 focus:ring-bubbly-teal/20 focus:border-bubbly-teal outline-none transition-all font-medium text-slate-900 dark:text-slate-100"
                        placeholder="At least 8 characters"
                        type="password"
                        value={passwords.next}
                        onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-bubbly-teal">lock</span>
                      </div>
                      <input
                        className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-bubbly-teal focus:ring-4 focus:ring-bubbly-teal/20 focus:border-bubbly-teal outline-none transition-all font-medium text-slate-900 dark:text-slate-100"
                        placeholder="Re-enter your new password"
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-14 bg-primary text-white text-lg font-black rounded-xl bouncy-shadow-primary hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-70"
                    disabled={isResetting}
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
        <p>© 2024 BlogVerse. Made with magic and coffee.</p>
      </footer>
    </div>
  )
}
