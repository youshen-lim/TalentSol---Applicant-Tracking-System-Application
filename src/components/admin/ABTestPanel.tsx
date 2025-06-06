import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useABTest, trackABTestEvent, ABTestVariant } from '@/hooks/useABTest';
import { BarChart3, Settings, Users, TrendingUp, Eye, EyeOff } from 'lucide-react';

/**
 * A/B Testing Admin Panel for TalentSol Standardized Components
 * Allows developers and admins to control A/B test configurations
 */

interface ABTestMetrics {
  testName: string;
  variant: ABTestVariant;
  impressions: number;
  interactions: number;
  conversionRate: number;
}

const ABTestPanel: React.FC = () => {
  const { getAllTests, setTestConfig, getVariant } = useABTest();
  const [isVisible, setIsVisible] = useState(false);
  const tests = getAllTests();

  // Mock metrics data (in real implementation, this would come from analytics)
  const getMockMetrics = (testName: string): ABTestMetrics[] => {
    return [
      {
        testName,
        variant: 'control',
        impressions: Math.floor(Math.random() * 1000) + 500,
        interactions: Math.floor(Math.random() * 100) + 50,
        conversionRate: Math.random() * 0.1 + 0.05,
      },
      {
        testName,
        variant: 'standardized',
        impressions: Math.floor(Math.random() * 1000) + 500,
        interactions: Math.floor(Math.random() * 100) + 50,
        conversionRate: Math.random() * 0.1 + 0.05,
      },
    ];
  };

  const handleToggleTest = (testName: string, enabled: boolean) => {
    setTestConfig(testName, { enabled });
    trackABTestEvent(testName, getVariant(testName), 'test_toggled', { enabled });
  };

  const handleRolloutChange = (testName: string, rolloutPercentage: number) => {
    setTestConfig(testName, { rolloutPercentage });
    trackABTestEvent(testName, getVariant(testName), 'rollout_changed', { rolloutPercentage });
  };

  const getTestStatusBadge = (test: any) => {
    if (!test.enabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    if (test.rolloutPercentage === 0) {
      return <Badge variant="outline">0% Rollout</Badge>;
    }
    if (test.rolloutPercentage === 100) {
      return <Badge variant="status-hired">100% Rollout</Badge>;
    }
    return <Badge variant="status-screening">{test.rolloutPercentage}% Rollout</Badge>;
  };

  const getCurrentUserVariant = (testName: string) => {
    const variant = getVariant(testName);
    return variant === 'standardized' ? 
      <Badge variant="status-applied">Standardized</Badge> : 
      <Badge variant="outline">Control</Badge>;
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border-2 border-ats-blue/20 hover:border-ats-blue/40"
        >
          <Settings className="h-4 w-4 mr-2" />
          A/B Tests
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-hidden">
      <Card className="shadow-xl border-2 border-ats-blue/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-ats-blue" />
                A/B Test Control Panel
              </CardTitle>
              <CardDescription>
                Manage standardized component rollouts
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="max-h-[60vh] overflow-y-auto">
          <Tabs defaultValue="tests" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tests">Tests</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tests" className="space-y-4 mt-4">
              {Object.entries(tests).map(([testName, test]) => (
                <Card key={testName} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {test.testName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </CardTitle>
                      {getTestStatusBadge(test)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Your variant:</span>
                      {getCurrentUserVariant(testName)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${testName}-enabled`} className="text-sm">
                        Enabled
                      </Label>
                      <Switch
                        id={`${testName}-enabled`}
                        checked={test.enabled}
                        onCheckedChange={(enabled) => handleToggleTest(testName, enabled)}
                      />
                    </div>
                    
                    {test.enabled && (
                      <div className="space-y-2">
                        <Label className="text-sm">
                          Rollout: {test.rolloutPercentage}%
                        </Label>
                        <Slider
                          value={[test.rolloutPercentage]}
                          onValueChange={([value]) => handleRolloutChange(testName, value)}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="metrics" className="space-y-4 mt-4">
              {Object.keys(tests).map((testName) => {
                const metrics = getMockMetrics(testName);
                return (
                  <Card key={testName} className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        {testName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {metrics.map((metric) => (
                        <div key={metric.variant} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">
                              {metric.variant}
                            </span>
                            <Badge variant={metric.variant === 'standardized' ? 'status-applied' : 'outline'}>
                              {(metric.conversionRate * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {metric.impressions} views
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {metric.interactions} clicks
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ABTestPanel;
