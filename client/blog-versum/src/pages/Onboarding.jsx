import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import MascortCard from "../components/MascortCard";
import StepInterests from "../components/onboarding/StepInterests";
import StepAvatar from "../components/onboarding/StepAvatar";
import StepBio from "../components/onboarding/StepBio";
import StepPrivacy from "../components/onboarding/StepPrivacy";
import StepTheme from "../components/onboarding/StepTheme";
import PageDoodles from "../components/shared/PageDoodles";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { DEFAULT_AVATAR_URL } from "../lib/defaultAvatar";
import { consumePostAuthRedirect } from "../lib/authRedirect";

const STEPS = [
  StepInterests,
  StepAvatar,
  StepBio,
  StepPrivacy,
  StepTheme,
];

const INITIAL_FORM = {
  interests: [],
  avatar: null,
  bio: "",
  isPrivate: false,
  themePreference: "plain",
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {updateProfile} = useAuthStore();
  const setTheme = useThemeStore((state) => state.setTheme);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...form,
        avatar: form.avatar || DEFAULT_AVATAR_URL,
      };

      console.log("Submitting onboarding form:", payload);
      const didUpdate = await updateProfile(payload, { silent: true });
      if (!didUpdate) {
        return;
      }

      setTheme(form.themePreference);
      toast.success("Profile created successfully");
      navigate(consumePostAuthRedirect() || "/home");
    } catch (error) {
      console.error("Onboarding submission failed:", error);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepComponent = STEPS[step];

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <PageDoodles variant="sparse" />

      {/* Left Panel — 40% */}
      <div className="hidden lg:flex w-[40%] min-h-screen items-center justify-center bg-gray-50 px-8">
        <MascortCard />
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-gray-200 sticky top-0 h-screen" />

      {/* Right Panel — 60% */}
      <div className="w-full lg:w-[60%] min-h-screen flex items-center justify-center px-12 py-12">
        <div className="w-full flex flex-col min-h-[580px]">

          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-green-700 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Step component */}
          <div className="flex-1 flex flex-col">
            <StepComponent
              value={form}
              update={update}
              onNext={handleNext}
              onBack={handleBack}
              isFirst={step === 0}
              isLast={step === STEPS.length - 1}
              isSubmitting={isSubmitting}
            />
          </div>

        </div>
      </div>

    </div>
  );
}