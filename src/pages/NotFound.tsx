import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * NotFound page component
 * Displayed when a user navigates to a non-existent route
 * Logs the attempted route access for troubleshooting
 */
const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Log the 404 error for troubleshooting
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center bg-gray-50 px-4">
      <div className="max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-ats-blue/10 flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-ats-blue" />
          </div>
        </div>

        <h1 className="text-9xl font-bold text-ats-blue">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mt-4 text-gray-600">
          The page you are looking for doesn't exist or has been moved.
          <br />
          Please check the URL or navigate back to the dashboard.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="bg-ats-blue hover:bg-ats-dark-blue w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
