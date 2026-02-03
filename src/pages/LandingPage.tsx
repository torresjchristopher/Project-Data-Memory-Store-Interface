import type { MemoryTree } from '../types';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';

interface LandingPageProps {
  tree: MemoryTree;
}

export default function LandingPage({ tree }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header familyName={tree.familyName} />
      <Hero 
        familyName={tree.familyName}
        totalArtifacts={tree.memories.length}
        totalPeople={tree.people.length}
      />
    </div>
  );
}
