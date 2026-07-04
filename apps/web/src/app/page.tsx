import { AnnouncementBar } from "@/components/lp/AnnouncementBar"
import { Navbar } from "@/components/lp/Navbar"
import { HeroSection } from "@/components/lp/HeroSection"
import { TickerSection } from "@/components/lp/TickerSection"
import { CoursesSection } from "@/components/lp/CoursesSection"
import { DifferentialsSection } from "@/components/lp/DifferentialsSection"
import { TeachersSection } from "@/components/lp/TeachersSection"
import { TestimonialsSection } from "@/components/lp/TestimonialsSection"
import { PricingSection } from "@/components/lp/PricingSection"
import { HowItWorksSection } from "@/components/lp/HowItWorksSection"
import { FaqSection } from "@/components/lp/FaqSection"
import { Footer } from "@/components/lp/Footer"
import { LP_DATA } from "@/data/lp-mock"

export default function HomePage() {
  return (
    <main>
      <AnnouncementBar text={LP_DATA.announcement} />
      <Navbar />
      <HeroSection data={LP_DATA.hero} />
      <TickerSection texts={LP_DATA.ticker_texts} />
      <CoursesSection courses={LP_DATA.courses} />
      <DifferentialsSection items={LP_DATA.differentials} />
      <TeachersSection teachers={LP_DATA.teachers} />
      <TestimonialsSection testimonials={LP_DATA.testimonials} />
      <PricingSection courses={LP_DATA.courses} />
      <HowItWorksSection steps={LP_DATA.how_it_works} />
      <FaqSection items={LP_DATA.faq} />
      <Footer />
    </main>
  )
}
