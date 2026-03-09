import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Menu, X, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-indigo-600" style={{ fontSize: 16, fontWeight: 700 }}>TalentSol</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors" style={{ fontSize: 13 }}>Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors" style={{ fontSize: 13 }}>Pricing</a>
              <a href="#customers" className="text-gray-600 hover:text-gray-900 transition-colors" style={{ fontSize: 13 }}>Customers</a>
              <a href="#resources" className="text-gray-600 hover:text-gray-900 transition-colors" style={{ fontSize: 13 }}>Resources</a>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Log in
            </button>
            <button
              onClick={handleGetStarted}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Get started
            </button>
          </div>
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 px-6 py-4 space-y-3 bg-white">
            <a href="#features" className="block text-gray-600 hover:text-gray-900 py-1.5" style={{ fontSize: 13 }}>Features</a>
            <a href="#pricing" className="block text-gray-600 hover:text-gray-900 py-1.5" style={{ fontSize: 13 }}>Pricing</a>
            <a href="#customers" className="block text-gray-600 hover:text-gray-900 py-1.5" style={{ fontSize: 13 }}>Customers</a>
            <a href="#resources" className="block text-gray-600 hover:text-gray-900 py-1.5" style={{ fontSize: 13 }}>Resources</a>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <button
                onClick={handleLogin}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition-all"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                Log in
              </button>
              <button
                onClick={handleGetStarted}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                Get started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full mb-6" style={{ fontSize: 12, fontWeight: 500 }}>
              <span>✨</span>
              <span>Rated #1 in applicant tracking systems by G2</span>
            </div>
            <h1 className="text-gray-900 mb-6" style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15 }}>
              Turn recruitment chaos into hiring success.
            </h1>
            <p className="text-gray-500 mb-10" style={{ fontSize: 16, lineHeight: 1.7 }}>
              Your AI co-recruiter that sorts, scores, and surfaces top talent automatically. Empowering HR teams to hire faster and fairer.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleGetStarted}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
                style={{ fontSize: 14, fontWeight: 600 }}
              >
                Get started
                <ArrowRight size={16} />
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition-all"
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                Watch demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Logos */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-400 uppercase tracking-wider mb-8" style={{ fontSize: 11, fontWeight: 500 }}>
            Trusted by thousands of companies worldwide
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-10 w-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400" style={{ fontSize: 12 }}>
                Logo {index + 1}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-gray-900 mb-4" style={{ fontSize: 32, fontWeight: 700 }}>
                The Modern Recruiting Platform
              </h2>
              <p className="text-gray-500 mb-6" style={{ fontSize: 15, lineHeight: 1.7 }}>
                Streamline your hiring process with our all-in-one solution designed to help you attract, evaluate, and hire top talent efficiently.
              </p>
              <button
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                Learn more
                <ChevronRight size={15} />
              </button>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <img
                  src="https://placehold.co/600x400/EEF2FF/4F46E5?text=ATS+Dashboard"
                  alt="ATS Dashboard"
                  className="w-full h-auto"
                />
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <img
                  src="https://placehold.co/600x400/EEF2FF/4F46E5?text=Candidate+Profile"
                  alt="Candidate Profile"
                  className="w-full h-auto"
                />
              </div>
              <div className="col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
                <img
                  src="https://placehold.co/800x300/EEF2FF/4F46E5?text=Recruitment+Analytics"
                  alt="Recruitment Analytics"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-indigo-600" style={{ fontSize: 13, fontWeight: 700 }}>TalentSol</span>
          </div>
          <p className="text-gray-400" style={{ fontSize: 12 }}>
            © 2026 TalentSol. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600 transition-colors" style={{ fontSize: 12 }}>Privacy</button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors" style={{ fontSize: 12 }}>Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
