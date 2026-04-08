import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SocialAuthButtons from '../components/SocialAuthButtons'
import EmailVerificationCard from '../components/EmailVerificationCard'
import PageDoodles from '../components/shared/PageDoodles'
import { useAuthStore } from "../store/useAuthStore";
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [showVerification, setShowVerification] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const {isLoggingIn, login, sendOTP, verifyOTP} = useAuthStore();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (formData.username.length === 0 || formData.password.length === 0){
      toast.error("All fields necessary");
      return false;
    }
    try{
      const loggedIn = await login({
        username: formData.username,
        password: formData.password,
      });

      if (loggedIn) {
        navigate('/home');
        return true;
      }
      return false;
    } catch (error){
      // Handle 403 verification error
      if (error.response?.status === 403 && error.response?.data?.message?.includes("not verified")) {
        setIsSendingOtp(true);
        const otpSent = await sendOTP({
          username: formData.username,
          email: error.response?.data?.email, // Assuming username could be email, adjust if needed
        });
        setIsSendingOtp(false);

        if (otpSent) {
          setShowVerification(true);
        }
        return false;
      }
      console.log(error);
    }
  }

  const handleResendOtp = async () => {
    return await sendOTP({
      username: formData.username,
      email: formData.username,
    });
  };

  const handleVerifyOtp = async (otp) => {
    setIsVerifyingOtp(true);
    try {
      const verified = await verifyOTP({ username: formData.username, otp });
      if (!verified) {
        return false;
      }

      const loggedIn = await login({
        username: formData.username,
        password: formData.password,
      });

      if (loggedIn) {
        navigate('/onboarding');
        return true;
      }

      return false;
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="layout-container flex h-full grow flex-col min-h-screen bg-[#f8f5f6] dark:bg-[#221014] font-display relative">
      <PageDoodles variant="corners" />
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 md:px-10 py-4 bg-white dark:bg-[#221014]">
        <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100 cursor-pointer" onClick={() => navigate('/home')}>
          <span className="material-symbols-outlined text-4xl text-primary">auto_stories</span>
          <h2 className="text-2xl font-black leading-tight tracking-tight">BlogVerse</h2>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/home')} className="text-slate-700 dark:text-slate-300 text-sm font-bold hover:text-primary transition-colors">Home</button>
            <a className="text-slate-700 dark:text-slate-300 text-sm font-bold hover:text-primary transition-colors" href="#">Explore</a>
            <a className="text-slate-700 dark:text-slate-300 text-sm font-bold hover:text-primary transition-colors" href="#">Community</a>
          </nav>
          <button
            onClick={() => navigate('/signup')}
            className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-full h-11 px-5 bg-primary text-white text-sm font-black shadow-lg hover:scale-105 transition-transform"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-10">
        <div className="max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left Panel — Mascot & Doodles */}
          <div className="hidden lg:flex flex-col items-center justify-center relative bg-bubbly-teal/20 rounded-xl p-12 min-h-[600px] overflow-hidden">
            {/* Background icon pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-4 gap-10 p-10">
              <span className="material-symbols-outlined text-6xl">coffee</span>
              <span className="material-symbols-outlined text-6xl rotate-12">lightbulb</span>
              <span className="material-symbols-outlined text-6xl -rotate-12">edit</span>
              <span className="material-symbols-outlined text-6xl">emoji_objects</span>
              <span className="material-symbols-outlined text-6xl rotate-45">auto_awesome</span>
              <span className="material-symbols-outlined text-6xl">draw</span>
              <span className="material-symbols-outlined text-6xl -rotate-45">stylus</span>
              <span className="material-symbols-outlined text-6xl">menu_book</span>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-bubbly-teal mb-8">
                <img
                  className="w-48 h-48 object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjOMH5E-7pL9oozwTRtmZM5UbUAFgVbZ1_LzYLmnsSJkFMl-QzLuMA65DOlBt4oTxWWhdC-QAaQpAL3NUJtg1_UAQ2JBudhkt4NXsjqWFC1VfIf0kyf_YKng9YSj6bRMmjUJfxYSlWRZJsrdZjvbY0PQFwudD11LYpK300xrk3pRiXhWgW2GdWH3nWwaFh7nfEQt380Wn9jdNIVWS5AiCdXsPnktZh5W8sJYYTpyrhGEVrpvALApq3uvnDFpl7dKo2ZCux3IYKrg"
                  alt="Cheerful cartoon book mascot waving happily"
                />
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-4">Ready to write?</h1>
              <p className="text-lg font-medium text-slate-700 max-w-sm">Your magical library of stories is just one click away!</p>
              <div className="mt-8 flex gap-4">
                <div className="w-12 h-16 bg-primary rounded-lg shadow-md -rotate-12 border-4 border-primary"></div>
                <div className="w-12 h-20 bg-whimsical-purple rounded-lg shadow-md rotate-6 border-4 border-whimsical-purple"></div>
                <div className="w-12 h-14 bg-bubbly-teal rounded-lg shadow-md -rotate-6 border-4 border-bubbly-teal"></div>
              </div>
            </div>
          </div>

          {/* Right Panel — Login Form */}
          <div className="flex justify-center w-full">
            <div className="w-full max-w-[480px] bg-white dark:bg-[#221014] p-8 md:p-10 rounded-xl border-4 border-whimsical-purple shadow-2xl">
              {isSendingOtp || isVerifyingOtp ? (
                <div className="min-h-[420px] flex flex-col items-center justify-center text-center space-y-4">
                  <Loader2 className="size-12 text-primary animate-spin" />
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {isSendingOtp ? "Sending OTP..." : "Verifying OTP..."}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {isSendingOtp
                      ? "Please wait while we prepare your verification step."
                      : "Please wait while we verify your code and sign you in."}
                  </p>
                </div>
              ) : !showVerification ? (
                <>
                  <div className="mb-8 text-center lg:text-left">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Welcome Back!</h2>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Log in to your BlogVerse account</p>
                  </div>

                  <form className="space-y-6" onSubmit={handleLogin}>
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="material-symbols-outlined text-bubbly-teal">alternate_email</span>
                        </div>
                        <input
                          className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-bubbly-teal focus:ring-4 focus:ring-bubbly-teal/20 focus:border-bubbly-teal outline-none transition-all font-medium text-slate-900 dark:text-slate-100"
                          placeholder="awesome.writer@blogverse.com"
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="material-symbols-outlined text-bubbly-teal">lock</span>
                        </div>
                        <input
                          className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-bubbly-teal focus:ring-4 focus:ring-bubbly-teal/20 focus:border-bubbly-teal outline-none transition-all font-medium text-slate-900 dark:text-slate-100"
                          placeholder="••••••••"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Remember me / Forgot */}
                    <div className="flex items-center justify-between px-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input className="w-5 h-5 rounded border-2 border-bubbly-teal text-bubbly-teal focus:ring-bubbly-teal/30" type="checkbox" />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Remember me</span>
                      </label>
                      <a className="text-sm font-black text-primary hover:underline" href="#">Forgot Password?</a>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full h-14 bg-primary text-white text-lg font-black rounded-xl bouncy-shadow-primary hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Loggning In...
                      </>
                    ) : (
                      "Log In"
                    )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-slate-100 dark:border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-[#221014] text-slate-500 font-bold uppercase tracking-widest">Or continue with</span>
                    </div>
                  </div>

                  <SocialAuthButtons />

                  <p className="mt-8 text-center font-bold text-slate-600 dark:text-slate-400">
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={() => navigate('/signup')}
                      className="text-whimsical-purple hover:text-primary underline decoration-2 underline-offset-4 transition-colors font-black"
                    >
                      Sign Up
                    </button>
                  </p>
                </>
              ) : (
                <div className="space-y-6">
                  <EmailVerificationCard
                    email={formData.username}
                    onResend={handleResendOtp}
                    onVerify={handleVerifyOtp}
                  />
                  <button
                    type="button"
                    onClick={() => setShowVerification(false)}
                    className="w-full py-3 rounded-xl border-2 border-primary/20 text-primary font-bold hover:bg-primary/10 transition-all"
                  >
                    Back to Login Form
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
        <p>© 2024 BlogVerse. Made with magic and coffee.</p>
      </footer>
    </div>
  )
}
