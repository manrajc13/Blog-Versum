import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SocialAuthButtons from '../components/SocialAuthButtons'
import EmailVerificationCard from '../components/EmailVerificationCard'
import PageDoodles from '../components/shared/PageDoodles'
import { useAuthStore } from "../store/useAuthStore";
import {toast} from "react-hot-toast";
import {Loader2} from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [showVerification, setShowVerification] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const {signup, sendOTP, verifyOTP, login, isSigningUp} = useAuthStore();

    const [formData, setformData] = useState({
        fullname: "",
        username: "",
        email: "",
        password: "",
    });

    const validateForm = () => {
        const {fullname, username, email, password} = formData;
        if(!fullname || !username || !email || !password) {
            toast.error("Please fill in all fields");
            return false;
        }
        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        if(password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return false;
        }

        return true;
    };


  const handleSignup = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if(success) {
        try {
          const signupSuccess = await signup(formData);
          if (!signupSuccess) {
            setShowVerification(false);
            return;
          }

          setIsSendingOtp(true);
          const otpSent = await sendOTP({
            username: formData.username,
            email: formData.email,
          });

          if (otpSent) {
            setShowVerification(true);
          } else {
            setShowVerification(false);
          }
        } catch (error) {
          console.error("Signup failed:", error);
          setShowVerification(false);
        } finally {
          setIsSendingOtp(false);
        }
    }
  }

  const handleResendOtp = async () => {
    return await sendOTP({
      username: formData.username,
      email: formData.email,
    });
  };

  const handleVerifyOtp = async (otp) => {
    setIsVerifyingOtp(true);
    try {
      const verified = await verifyOTP({ username: formData.username, otp }, { silent: true });
      if (!verified) {
        return false;
      }

      const loggedIn = await login({
        username: formData.username,
        password: formData.password,
      }, { silent: true });

      if (loggedIn) {
        navigate('/onboarding');
        return true;
      }

      return false;
    }
    catch (error) {
      console.error("OTP verification failed:", error);
      return false;
    }
    finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="layout-container flex h-full grow flex-col min-h-screen bg-[#f7f5f8] dark:bg-[#1b1022] font-display relative">
      <PageDoodles variant="corners" />
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap px-10 py-5">
        <div
          className="flex items-center gap-4 text-primary cursor-pointer"
          onClick={() => navigate('/home')}
        >
          <div className="size-8">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black leading-tight tracking-tight">BlogVerse</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Already a member?</span>
          <button
            onClick={() => navigate('/login')}
            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-10 px-5 bg-primary/10 text-primary text-sm font-bold border-2 border-primary/20 hover:bg-primary/20 transition-all"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Panel — Cartoon Mascot */}
          <div className="hidden lg:flex flex-col items-center justify-center relative">
            <div className="relative w-full aspect-square max-w-md bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
              {/* CSS art character */}
              <div className="w-64 h-80 bg-accent-orange rounded-t-full relative shadow-xl border-4 border-slate-900 overflow-hidden">
                <div className="absolute top-10 left-10 w-12 h-12 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <div className="w-4 h-4 bg-slate-900 rounded-full"></div>
                </div>
                <div className="absolute top-10 right-10 w-12 h-12 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <div className="w-4 h-4 bg-slate-900 rounded-full"></div>
                </div>
                <div className="absolute top-32 left-1/2 -translate-x-1/2 w-16 h-8 border-b-8 border-slate-900 rounded-full"></div>
                <div className="absolute bottom-0 w-full h-20 bg-slate-200 border-t-4 border-slate-900"></div>
              </div>

              {/* Speech Bubble */}
              <div className="absolute -top-10 -right-5 bg-white p-6 rounded-xl border-4 border-slate-900 shadow-lg transform rotate-6">
                <p className="font-bold text-xl text-slate-900">Ready to write?</p>
                <div className="absolute -bottom-4 left-4 w-6 h-6 bg-white border-r-4 border-b-4 border-slate-900 transform rotate-45"></div>
              </div>

              {/* Decorative Stars */}
              <span className="material-symbols-outlined absolute top-0 left-0 text-5xl text-accent-orange animate-pulse">star</span>
              <span className="material-symbols-outlined absolute bottom-10 right-0 text-4xl text-secondary">auto_awesome</span>
            </div>

            <div className="mt-12 text-center">
              <h1 className="text-5xl font-black text-slate-900 dark:text-slate-100 mb-4 tracking-tight">Join the Verse!</h1>
              <p className="text-xl text-slate-600 dark:text-slate-400">The world&apos;s first blog where pencils talk back.</p>
            </div>
          </div>

          {/* Right Panel — Sign Up Form / Verification */}
          <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-lg shadow-2xl border-b-8 border-r-8 border-primary/20">
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
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Create Account</h2>
                  <p className="text-slate-500 dark:text-slate-400">Fill in the bubbly boxes to get started!</p>
                </div>

                <form className="space-y-6" onSubmit={handleSignup}>

                {/* Fullname */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Fullname</label>
                    <input
                      className="w-full px-6 py-4 rounded-xl bubbly-border border-secondary focus:ring-4 focus:ring-secondary/20 outline-none transition-all dark:bg-slate-900 dark:text-slate-100"
                      placeholder="CoolPencilUser"
                      type="text"
                      value={formData.fullname}
                      onChange={(e) => setformData({...formData, fullname: e.target.value})}
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Username</label>
                    <input
                      className="w-full px-6 py-4 rounded-xl bubbly-border border-secondary focus:ring-4 focus:ring-secondary/20 outline-none transition-all dark:bg-slate-900 dark:text-slate-100"
                      placeholder="CoolPencilUser"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setformData({...formData, username: e.target.value})}

                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                    <input
                      className="w-full px-6 py-4 rounded-xl bubbly-border border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all dark:bg-slate-900 dark:text-slate-100"
                      placeholder="hello@blogverse.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setformData({...formData, email: e.target.value})}

                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                    <input
                      className="w-full px-6 py-4 rounded-xl bubbly-border border-secondary focus:ring-4 focus:ring-secondary/20 outline-none transition-all dark:bg-slate-900 dark:text-slate-100"
                      placeholder="••••••••"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setformData({...formData, password: e.target.value})}

                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 bg-accent-orange hover:bg-accent-orange/90 text-white text-xl font-black rounded-xl shadow-lg active:scale-95 transition-all mt-4 border-b-4 border-accent-orange/70 flex items-center justify-center gap-2"
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Signing Up...
                      </>
                    ) : (
                      "SIGN UP NOW!"
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-10 text-center">
                  <span className="bg-white dark:bg-slate-800 px-4 relative z-10 text-sm font-bold text-slate-400 uppercase tracking-widest">Or sign up with</span>
                  <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 dark:bg-slate-700"></div>
                </div>

                <SocialAuthButtons />

                <p className="mt-8 text-center text-xs text-slate-400 font-medium">
                  By signing up, you agree to our{' '}
                  <a className="text-primary hover:underline" href="#">Terms of Fun</a> and{' '}
                  <a className="text-primary hover:underline" href="#">Ink Policy</a>.
                </p>
              </>
            ) : (
              <div className="space-y-6">
                <EmailVerificationCard
                  email={formData.email}
                  onResend={handleResendOtp}
                  onVerify={handleVerifyOtp}
                />
                <button
                  type="button"
                  onClick={() => setShowVerification(false)}
                  className="w-full py-3 rounded-xl border-2 border-primary/20 text-primary font-bold hover:bg-primary/10 transition-all"
                >
                  Back to Sign Up Form
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-10 text-center text-slate-400 text-sm">
        <p>© 2024 BlogVerse. Crafted with ✏️ and lots of 💜</p>
      </footer>
    </div>
  )
}
