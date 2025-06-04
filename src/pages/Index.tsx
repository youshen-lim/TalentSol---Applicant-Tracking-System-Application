import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart2, Users, Briefcase, Calendar } from 'lucide-react';

/**
 * Index page component
 * Serves as the landing page for the TalentSol ATS application
 * Provides quick access to main features and dashboard
 */
const Index = () => {
  const navigate = useNavigate();
  const [autoRedirect, setAutoRedirect] = useState(false);

  useEffect(() => {
    // Only redirect automatically if the flag is set to true
    if (autoRedirect) {
      navigate('/dashboard');
    }
  }, [navigate, autoRedirect]);

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-ats-blue mb-4">TalentSol</h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            The Modern Applicant Tracking System for streamlined recruitment
          </p>
          <div className="mt-8">
            <Button
              onClick={handleGetStarted}
              className="bg-ats-blue hover:bg-ats-dark-blue text-white px-8 py-6 rounded-md text-lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigateTo('/dashboard')}
          >
            <div className="h-12 w-12 bg-ats-blue/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart2 className="h-6 w-6 text-ats-blue" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
            <p className="text-gray-600">Get a comprehensive overview of your recruitment metrics and activities</p>
          </div>

          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigateTo('/candidates')}
          >
            <div className="h-12 w-12 bg-ats-blue/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-ats-blue" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Candidates</h3>
            <p className="text-gray-600">Manage your candidate pipeline with an intuitive kanban board interface</p>
          </div>

          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigateTo('/jobs')}
          >
            <div className="h-12 w-12 bg-ats-blue/10 rounded-lg flex items-center justify-center mb-4">
              <Briefcase className="h-6 w-6 text-ats-blue" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Jobs</h3>
            <p className="text-gray-600">Create and manage job postings across multiple channels</p>
          </div>

          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigateTo('/interviews')}
          >
            <div className="h-12 w-12 bg-ats-blue/10 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-ats-blue" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Interviews</h3>
            <p className="text-gray-600">Schedule and manage interviews with an integrated calendar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
