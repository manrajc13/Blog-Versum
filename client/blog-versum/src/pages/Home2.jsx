import { useThemeStore } from '../store/useThemeStore'
import PublicNavbar from '../components/home2/PublicNavbar'
import HeroSection from '../components/home2/HeroSection'
import FeaturesGrid from '../components/home2/FeaturesGrid'
import BentoShowcase from '../components/home2/BentoShowcase'
import CtaSection from '../components/home2/CtaSection'
import Footer from '../components/Footer'
import PageDoodles from '../components/shared/PageDoodles'

export default function Home2() {
  const theme = useThemeStore((state) => state.getTheme())

  return (
    <div
      className="text-slate-900 dark:text-slate-100 min-h-screen relative"
      style={{ backgroundColor: theme.homeBackground }}
    >
      <PageDoodles variant="full" />
      <div className="relative z-10 layout-container flex h-full grow flex-col">
        <PublicNavbar />

        <main className="max-w-[1280px] mx-auto w-full px-6 md:px-10 py-10">
          <HeroSection />
          <FeaturesGrid />
          <BentoShowcase />
          <CtaSection />
        </main>

        <Footer iconColor={theme.primary} />
      </div>
    </div>
  )
}
