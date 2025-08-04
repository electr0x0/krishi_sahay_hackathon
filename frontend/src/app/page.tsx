import Header from "@/components/Header";
import HeroSection from "@/components/sections/HeroSection";
import FeatureHighlights from "@/components/sections/FeatureHighlights";
import HowItWorks from "@/components/sections/HowItWorks";
import ImpactSection from "@/components/sections/ImpactSection";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <FeatureHighlights />
        <HowItWorks />
        <ImpactSection />
        <Footer />
      </main>
    </>
  );
}