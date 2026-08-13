import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BrandMarquee from "@/components/BrandMarquee";
import About from "@/components/About";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <BrandMarquee />
        <About />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
