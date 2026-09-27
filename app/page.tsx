import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { TheProblem } from "@/components/TheProblem";
import { ThreePillars } from "@/components/ThreePillars";
import { ComparisonSlider } from "@/components/ComparisonSlider";
import { CloudinaryStrip } from "@/components/CloudinaryStrip";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink text-bone font-sans flex flex-col selection:bg-moss selection:text-bone">
      {/* Top Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: The Problem */}
        <TheProblem />

        {/* Section 3: Three Pillars */}
        <ThreePillars />

        {/* Section 4: Live-feeling Demo (Before/After Slider with useMotionValue) */}
        <ComparisonSlider />

        {/* Section 5: Built on Cloudinary credibility strip */}
        <CloudinaryStrip />
      </main>

      {/* Section 6: Footer */}
      <Footer />
    </div>
  );
}
