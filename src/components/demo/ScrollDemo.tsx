import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedHorizontalScroll, KanbanScrollContainer } from '@/components/ui/enhanced-scroll';
import { Users, Briefcase, Calendar, Star } from 'lucide-react';

/**
 * Demo component to showcase enhanced horizontal scrolling capabilities
 * This demonstrates the improvements made to the Candidates page scrolling
 */

const ScrollDemo: React.FC = () => {
  // Sample data for demonstration
  const sampleCards = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `This is a sample card ${i + 1} to demonstrate horizontal scrolling`,
    icon: [Users, Briefcase, Calendar, Star][i % 4],
    color: ['blue', 'purple', 'green', 'orange'][i % 4],
  }));

  const sampleColumns = Array.from({ length: 8 }, (_, i) => ({
    id: `column-${i + 1}`,
    title: `Column ${i + 1}`,
    items: Array.from({ length: 3 }, (_, j) => ({
      id: `item-${i}-${j}`,
      title: `Item ${j + 1}`,
      description: `Sample item in column ${i + 1}`,
    })),
  }));

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enhanced Horizontal Scrolling Demo
        </h1>
        <p className="text-gray-600">
          Demonstrating the improved scrolling experience for the Candidates page
        </p>
      </div>

      {/* Basic Enhanced Scroll Container */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Basic Enhanced Scroll Container
        </h2>
        <p className="text-sm text-gray-600">
          Horizontal scroll with navigation buttons and smooth scrolling
        </p>
        
        <EnhancedHorizontalScroll
          showScrollButtons={true}
          showScrollIndicators={true}
          className="enhanced-scrollbar-blue"
        >
          <div className="flex space-x-4 pb-4">
            {sampleCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Card key={card.id} className="min-w-[280px] flex-shrink-0">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{card.description}</p>
                    <Button className="mt-3 w-full" variant="outline" size="sm">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </EnhancedHorizontalScroll>
      </section>

      {/* Kanban-Style Scroll Container */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Kanban-Style Scroll Container
        </h2>
        <p className="text-sm text-gray-600">
          Similar to the Candidates page pipeline with optimized column scrolling
        </p>
        
        <KanbanScrollContainer>
          {sampleColumns.map((column) => (
            <div
              key={column.id}
              className="min-w-[320px] w-[320px] bg-gray-50 rounded-lg border-2 border-gray-200 flex-shrink-0"
            >
              {/* Column Header */}
              <div className="p-4 border-b-2 border-gray-200 bg-white rounded-t-lg">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-700">
                  {column.title}
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  {column.items.length} items
                </span>
              </div>
              
              {/* Column Content */}
              <div className="p-3 space-y-3 min-h-[400px]">
                {column.items.map((item) => (
                  <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-xs text-gray-600">{item.description}</p>
                      <div className="flex space-x-2 mt-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </KanbanScrollContainer>
      </section>

      {/* Mobile Optimized Scroll */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Mobile Optimized Scroll
        </h2>
        <p className="text-sm text-gray-600">
          Touch-friendly scrolling with auto-hide scrollbar
        </p>
        
        <EnhancedHorizontalScroll
          showScrollButtons={false}
          showScrollIndicators={true}
          autoHideScrollbar={true}
          className="touch-scroll"
        >
          <div className="flex space-x-3 pb-4">
            {sampleCards.slice(0, 6).map((card) => {
              const IconComponent = card.icon;
              return (
                <Card key={card.id} className="min-w-[240px] flex-shrink-0">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                      <CardTitle className="text-sm">{card.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600">{card.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </EnhancedHorizontalScroll>
      </section>

      {/* Instructions */}
      <section className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          How to Test Enhanced Scrolling
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>Desktop:</strong> Use scroll buttons or mouse wheel to navigate horizontally</li>
          <li>• <strong>Mobile:</strong> Swipe left/right to scroll through content</li>
          <li>• <strong>Keyboard:</strong> Use arrow keys when focused on scroll container</li>
          <li>• <strong>Resize:</strong> Make your browser window smaller to see scrolling in action</li>
          <li>• <strong>Smooth scrolling:</strong> Notice the smooth animation when using scroll buttons</li>
        </ul>
      </section>
    </div>
  );
};

export default ScrollDemo;
