import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  HelpCircle,
  Search,
  Book,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  Users,
  Briefcase,
  Calendar,
  BarChart2,
  Settings,
  Shield,
} from 'lucide-react';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqItems = [
    {
      id: '1',
      category: 'Getting Started',
      question: 'How do I create a new job posting?',
      answer: 'Navigate to the Jobs page and click the "Create New Job" button. Fill in the job details, requirements, and publish when ready.',
    },
    {
      id: '2',
      category: 'Candidates',
      question: 'How do I move candidates through the pipeline?',
      answer: 'Use the drag-and-drop interface on the Candidates Pipeline page to move candidates between different stages.',
    },
    {
      id: '3',
      category: 'Interviews',
      question: 'How do I schedule an interview?',
      answer: 'Go to the Interviews page, click "Schedule Interview", select the candidate, interviewers, and available time slots.',
    },
    {
      id: '4',
      category: 'Reports',
      question: 'How do I generate recruitment reports?',
      answer: 'Visit the Analytics page where you can access Core Reports, Custom Reports, and ML-powered insights.',
    },
    {
      id: '5',
      category: 'Settings',
      question: 'How do I change my notification preferences?',
      answer: 'Go to Settings > Notifications to customize your email, browser, and mobile notification preferences.',
    },
    {
      id: '6',
      category: 'Security',
      question: 'How do I enable two-factor authentication?',
      answer: 'Navigate to Profile > Security tab and toggle the Two-Factor Authentication switch.',
    },
  ];

  const quickLinks = [
    { title: 'User Guide', icon: <Book className="h-4 w-4" />, description: 'Complete guide to using TalentSol' },
    { title: 'Video Tutorials', icon: <ExternalLink className="h-4 w-4" />, description: 'Step-by-step video walkthroughs' },
    { title: 'API Documentation', icon: <ExternalLink className="h-4 w-4" />, description: 'Integration and API reference' },
    { title: 'Best Practices', icon: <Users className="h-4 w-4" />, description: 'Recruitment best practices guide' },
  ];

  const contactOptions = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: <MessageCircle className="h-5 w-5" />,
      action: 'Start Chat',
      available: true,
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: <Mail className="h-5 w-5" />,
      action: 'Send Email',
      available: true,
    },
    {
      title: 'Phone Support',
      description: 'Call us during business hours',
      icon: <Phone className="h-5 w-5" />,
      action: 'Call Now',
      available: false,
    },
  ];

  const filteredFAQs = faqItems.filter(
    item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-ats-blue" />
            Help & Support
          </h1>
          <p className="text-sm text-gray-500">
            Find answers to your questions and get support
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <div className="grid gap-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{faq.question}</CardTitle>
                    <Badge variant="secondary" className="bg-ats-blue/10 text-ats-blue">
                      {faq.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLinks.map((link, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-ats-blue/10 rounded-md text-ats-blue">
                        {link.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{link.title}</h3>
                        <p className="text-sm text-gray-500">{link.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Feature Guides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-ats-blue" />
                    <span className="font-medium">Job Management</span>
                  </div>
                  <p className="text-sm text-gray-600">Learn how to create, manage, and track job postings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-ats-blue" />
                    <span className="font-medium">Candidate Pipeline</span>
                  </div>
                  <p className="text-sm text-gray-600">Master the candidate review and pipeline management</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 className="h-4 w-4 text-ats-blue" />
                    <span className="font-medium">Analytics & Reports</span>
                  </div>
                  <p className="text-sm text-gray-600">Generate insights and track recruitment metrics</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-4">
            {contactOptions.map((option, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-ats-blue/10 rounded-md text-ats-blue">
                        {option.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{option.title}</h3>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </div>
                    <Button 
                      variant={option.available ? "default" : "outline"} 
                      disabled={!option.available}
                      className={option.available ? "bg-ats-blue hover:bg-ats-dark-blue" : ""}
                    >
                      {option.action}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Additional ways to reach our support team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Business Hours</h4>
                  <p className="text-sm text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                  <p className="text-sm text-gray-600">Saturday: 10:00 AM - 4:00 PM EST</p>
                  <p className="text-sm text-gray-600">Sunday: Closed</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Response Times</h4>
                  <p className="text-sm text-gray-600">Live Chat: Immediate</p>
                  <p className="text-sm text-gray-600">Email: Within 24 hours</p>
                  <p className="text-sm text-gray-600">Phone: During business hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;
