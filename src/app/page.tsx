import { Header } from "@/components/marketing/header";
import { Hero } from "@/components/marketing/hero";
import { Pricing } from "@/components/marketing/pricing";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
