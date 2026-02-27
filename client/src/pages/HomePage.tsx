import Navbar from '../components/home/Navbar';
import HeroSection from '../components/home/HeroSection';
import ProblemSection from '../components/home/ProblemSection';
import SolutionSection from '../components/home/SolutionSection';
import WorkflowSection from '../components/home/WorkflowSection';
import ImpactSection from '../components/home/ImpactSection';
import CTASection from '../components/home/CTASection';
import Footer from '../components/home/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-godam-cream">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <WorkflowSection />
      <ImpactSection />
      <CTASection />
      <Footer />
    </div>
  );
}
