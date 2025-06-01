import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react';

/**
 * LandingPage component
 * Main landing page for the TalentSol ATS application
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-ats-blue">TalentSol</div>
            <div className="hidden md:flex ml-10 space-x-8">
              <a href="#features" className="text-gray-600 hover:text-ats-blue">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-ats-blue">Pricing</a>
              <a href="#customers" className="text-gray-600 hover:text-ats-blue">Customers</a>
              <a href="#resources" className="text-gray-600 hover:text-ats-blue">Resources</a>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-ats-blue"
              onClick={handleLogin}
            >
              Log in
            </Button>
            <Button
              className="bg-ats-blue hover:bg-ats-dark-blue text-white"
              onClick={handleGetStarted}
            >
              Get started
            </Button>
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-gray-200">
            <div className="container mx-auto px-4 space-y-3">
              <a href="#features" className="block text-gray-600 hover:text-ats-blue">Features</a>
              <a href="#pricing" className="block text-gray-600 hover:text-ats-blue">Pricing</a>
              <a href="#customers" className="block text-gray-600 hover:text-ats-blue">Customers</a>
              <a href="#resources" className="block text-gray-600 hover:text-ats-blue">Resources</a>
              <div className="pt-4 flex flex-col space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={handleLogin}
                >
                  Log in
                </Button>
                <Button
                  className="w-full justify-center bg-ats-blue hover:bg-ats-dark-blue text-white"
                  onClick={handleGetStarted}
                >
                  Get started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-blue-50 text-ats-blue px-4 py-1 rounded-full text-sm font-medium mb-6">
              <span className="mr-2">✨</span>
              <span>Rated #1 in applicant tracking systems by G2</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Turn recruitment chaos into hiring success.</h1>
            <p className="text-xl text-gray-600 mb-4">
              ✨Your AI co-recruiter that sorts, scores, and surfaces top talents automatically. Empowering HR teams to hire faster and fairer.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                className="bg-ats-blue hover:bg-ats-dark-blue text-white px-8 py-6 text-lg"
                onClick={handleGetStarted}
              >
                Get started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="px-8 py-6 text-lg"
              >
                Watch demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Logos */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-gray-500 text-sm uppercase font-medium tracking-wider">
              Trusted by thousands of companies worldwide
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-12 w-32 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 font-medium">
                Logo {index + 1}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Recruiting Platform Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The Modern Recruiting Platform</h2>
              <p className="text-lg text-gray-600 mb-8">
                Streamline your hiring process with our all-in-one solution designed to help you attract, evaluate, and hire top talent efficiently.
              </p>
              <div className="flex items-center">
                <Button
                  variant="link"
                  className="text-ats-blue font-medium flex items-center p-0"
                >
                  Learn more
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src="https://placehold.co/600x400/e6f0ff/3B82F6?text=ATS+Dashboard"
                  alt="ATS Dashboard"
                  className="w-full h-auto"
                />
              </div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src="https://placehold.co/600x400/e6f0ff/3B82F6?text=Candidate+Profile"
                  alt="Candidate Profile"
                  className="w-full h-auto"
                />
              </div>
              <div className="col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src="https://placehold.co/800x300/e6f0ff/3B82F6?text=Recruitment+Analytics"
                  alt="Recruitment Analytics"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
