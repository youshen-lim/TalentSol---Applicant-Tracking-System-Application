import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HorizontalScroll, 
  CardScroll, 
  KanbanScroll, 
  TabScroll, 
  MediaScroll 
} from '@/components/ui/horizontal-scroll';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Star, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

/**
 * TalentSol Horizontal Scroll Design System Examples
 * 
 * This component demonstrates all the horizontal scroll variants
 * and provides usage examples for different TalentSol pages
 */

const HorizontalScrollExamples: React.FC = () => {
  // Sample data for demonstrations
  const sampleMetrics = [
    { icon: Users, title: 'Total Candidates', value: '1,234', change: '+12%', color: 'blue' },
    { icon: Briefcase, title: 'Active Jobs', value: '45', change: '+5%', color: 'purple' },
    { icon: Calendar, title: 'Interviews Today', value: '8', change: '+2%', color: 'green' },
    { icon: Star, title: 'Offers Made', value: '12', change: '+8%', color: 'orange' },
    { icon: TrendingUp, title: 'Hire Rate', value: '78%', change: '+3%', color: 'blue' },
    { icon: Clock, title: 'Avg. Time to Hire', value: '14 days', change: '-2 days', color: 'green' },
  ];

  const sampleColumns = [
    { id: 'applied', title: 'Applied', count: 45, color: 'blue' },
    { id: 'screening', title: 'Screening', count: 23, color: 'purple' },
    { id: 'interview', title: 'Interview', count: 12, color: 'indigo' },
    { id: 'assessment', title: 'Assessment', count: 8, color: 'cyan' },
    { id: 'offer', title: 'Offer', count: 5, color: 'green' },
    { id: 'hired', title: 'Hired', count: 3, color: 'emerald' },
    { id: 'rejected', title: 'Rejected', count: 15, color: 'red' },
  ];

  const sampleTabs = [
    { id: 'overview', label: 'Overview', active: true },
    { id: 'applications', label: 'Applications', badge: '23' },
    { id: 'forms', label: 'Forms', badge: '5' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'performance', label: 'Performance' },
    { id: 'settings', label: 'Settings' },
    { id: 'integrations', label: 'Integrations' },
  ];

  return (
    <div className="space-y-12 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          TalentSol Horizontal Scroll Design System
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          A comprehensive horizontal scrolling solution that integrates seamlessly with 
          TalentSol's design system, providing consistent behavior across all pages.
        </p>
      </div>

      {/* Basic Horizontal Scroll */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Basic Horizontal Scroll</h2>
          <p className="text-gray-600">
            The foundation component with customizable variants, indicators, and accessibility features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blue variant */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-700">Blue Variant (Default)</h3>
            <HorizontalScroll variant="blue" indicatorType="dots">
              <div className="flex gap-4 pb-4">
                {sampleMetrics.map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <Card key={index} className="min-w-[240px] flex-shrink-0">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-8 w-8 text-ats-blue" />
                          <div>
                            <p className="text-sm text-gray-600">{metric.title}</p>
                            <p className="text-xl font-bold">{metric.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </HorizontalScroll>
          </div>

          {/* Purple variant */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-700">Purple Variant</h3>
            <HorizontalScroll variant="purple" indicatorType="bars">
              <div className="flex gap-4 pb-4">
                {sampleMetrics.slice(0, 4).map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <Card key={index} className="min-w-[200px] flex-shrink-0">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <IconComponent className="h-6 w-6 text-ats-purple mx-auto mb-2" />
                          <p className="text-lg font-bold">{metric.value}</p>
                          <p className="text-sm text-gray-600">{metric.title}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </HorizontalScroll>
          </div>
        </div>
      </section>

      {/* Card Scroll Component */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Card Scroll</h2>
          <p className="text-gray-600">
            Optimized for dashboard metrics, job cards, and other card-based content.
          </p>
        </div>
        
        <CardScroll 
          variant="blue" 
          cardGap="md" 
          cardMinWidth="280px"
          ariaLabel="Dashboard metrics"
        >
          {sampleMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <Card key={index} className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <IconComponent className="h-5 w-5 text-ats-blue" />
                    <Badge variant="secondary" className="text-xs">
                      {metric.change}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{metric.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-600 mt-1">vs last month</p>
                </CardContent>
              </Card>
            );
          })}
        </CardScroll>
      </section>

      {/* Kanban Scroll Component */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Kanban Scroll</h2>
          <p className="text-gray-600">
            Perfect for candidate pipelines and workflow columns with drag-and-drop support.
          </p>
        </div>
        
        <KanbanScroll 
          variant="blue" 
          columnWidth="300px" 
          columnGap="md"
          ariaLabel="Candidate pipeline"
        >
          {sampleColumns.map((column) => (
            <Card key={column.id} className="h-[400px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm uppercase tracking-wide">
                    {column.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {column.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: Math.min(column.count, 3) }, (_, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-ats-blue rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {String.fromCharCode(65 + i)}
                        </span>
                      </div>
                      <span className="text-sm font-medium">Candidate {i + 1}</span>
                    </div>
                    <p className="text-xs text-gray-600">Applied 2 days ago</p>
                  </div>
                ))}
                {column.count > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{column.count - 3} more candidates
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </KanbanScroll>
      </section>

      {/* Tab Scroll Component */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Tab Scroll</h2>
          <p className="text-gray-600">
            Horizontal tab navigation that gracefully handles overflow on smaller screens.
          </p>
        </div>
        
        <TabScroll variant="subtle" tabGap="sm">
          {sampleTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={tab.active ? "default" : "ghost"}
              size="sm"
              className="flex-shrink-0 whitespace-nowrap"
            >
              {tab.label}
              {tab.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {tab.badge}
                </Badge>
              )}
            </Button>
          ))}
        </TabScroll>
      </section>

      {/* Media Scroll Component */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Media Scroll</h2>
          <p className="text-gray-600">
            For image galleries, document previews, and other media content.
          </p>
        </div>
        
        <MediaScroll 
          variant="default" 
          itemWidth="160px" 
          aspectRatio="square"
          indicatorType="bars"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div 
              key={i} 
              className="bg-gradient-to-br from-ats-blue to-ats-purple rounded-lg flex items-center justify-center text-white font-semibold"
            >
              {i + 1}
            </div>
          ))}
        </MediaScroll>
      </section>

      {/* Usage Guidelines */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Usage Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Use consistent variants across similar content types</li>
              <li>• Enable snap-to-items for better alignment in kanban layouts</li>
              <li>• Provide meaningful aria-labels for accessibility</li>
              <li>• Use appropriate indicator types for content length</li>
              <li>• Test on mobile devices for touch interactions</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Accessibility Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Keyboard navigation with arrow keys</li>
              <li>• Screen reader compatible with ARIA labels</li>
              <li>• Focus management and visible focus indicators</li>
              <li>• Reduced motion support for sensitive users</li>
              <li>• High contrast mode compatibility</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HorizontalScrollExamples;
