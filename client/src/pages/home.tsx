import React from "react";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import CodeExamplesSection from "@/components/code-examples-section";
import PackageRegistrySection from "@/components/package-registry-section";
import PublicationSection from "@/components/publication-section";
import CommunitySection from "@/components/community-section";
import GetStartedSection from "@/components/get-started-section";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <CodeExamplesSection />
        <PackageRegistrySection />
        <PublicationSection />
        <CommunitySection />
        <GetStartedSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
