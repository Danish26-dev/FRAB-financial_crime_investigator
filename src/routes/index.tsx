import { createFileRoute } from "@tanstack/react-router";
import Hero from "../components/frab/Hero";
import Nav from "../components/frab/Nav";
import {
  HeroTransition,
  ProblemSection,
  SolutionSection,
} from "../components/frab/sections/Problem";
import {
  PipelineSection,
  AgentsSection,
} from "../components/frab/sections/Pipeline";
import { ArchitectureSection } from "../components/frab/sections/Architecture";
import { OutputSection } from "../components/frab/sections/Output";
import { FinalCta, Footer } from "../components/frab/sections/Close";

const title = "FRAB — Financial Crime Investigation Lab";
const description =
  "FRAB turns suspicious transaction alerts into investigation-ready intelligence: behavior reconstruction, evidence, regulatory risk and audit-ready cases for AML analysts.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div id="top" className="min-h-screen bg-background font-sans antialiased">
      <Nav />
      <main>
        <Hero />
        <HeroTransition />
        <ProblemSection />
        <SolutionSection />
        <PipelineSection />
        <AgentsSection />
        <ArchitectureSection />
        <OutputSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
