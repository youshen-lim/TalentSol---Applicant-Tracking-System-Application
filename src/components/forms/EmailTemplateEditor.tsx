import React, { useState } from 'react';
import {
  Mail,
  Save,
  Eye,
  Copy,
  Trash2,
  Plus,
  Edit,
  Send,
  User,
  Building,
  Calendar,
  FileText
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { EmailTemplate } from '@/types/application';

// Available template variables
const TEMPLATE_VARIABLES = [
  { key: '{{candidate_name}}', label: 'Candidate Name', icon: User, category: 'Candidate' },
  { key: '{{candidate_email}}', label: 'Candidate Email', icon: Mail, category: 'Candidate' },
  { key: '{{job_title}}', label: 'Job Title', icon: FileText, category: 'Job' },
  { key: '{{company_name}}', label: 'Company Name', icon: Building, category: 'Company' },
  { key: '{{application_date}}', label: 'Application Date', icon: Calendar, category: 'Application' },
  { key: '{{interview_date}}', label: 'Interview Date', icon: Calendar, category: 'Interview' },
  { key: '{{interview_time}}', label: 'Interview Time', icon: Calendar, category: 'Interview' },
  { key: '{{recruiter_name}}', label: 'Recruiter Name', icon: User, category: 'Recruiter' },
  { key: '{{recruiter_email}}', label: 'Recruiter Email', icon: Mail, category: 'Recruiter' },
];

// Default email templates
const DEFAULT_TEMPLATES: Partial<EmailTemplate>[] = [
  {
    name: 'Application Confirmation',
    type: 'confirmation',
    subject: 'Thank you for your application - {{job_title}}',
    body: `Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}}.

We have received your application and our team will review it carefully. We will contact you within the next few days if your qualifications match our requirements.

If you have any questions, please don't hesitate to reach out to us.

Best regards,
{{recruiter_name}}
{{company_name}} Recruiting Team`
  },
  {
    name: 'Interview Invitation',
    type: 'interview_invite',
    subject: 'Interview Invitation - {{job_title}} at {{company_name}}',
    body: `Dear {{candidate_name}},

We are pleased to invite you for an interview for the {{job_title}} position at {{company_name}}.

Interview Details:
Date: {{interview_date}}
Time: {{interview_time}}
Location: [To be provided]

Please confirm your availability by replying to this email.

We look forward to meeting you!

Best regards,
{{recruiter_name}}
{{company_name}} Recruiting Team`
  },
  {
    name: 'Application Rejection',
    type: 'rejection',
    subject: 'Update on your application - {{job_title}}',
    body: `Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.

We appreciate your interest in {{company_name}} and encourage you to apply for future opportunities that match your skills and experience.

Best regards,
{{recruiter_name}}
{{company_name}} Recruiting Team`
  }
];

interface EmailTemplateEditorProps {
  templates?: EmailTemplate[];
  onSave: (template: EmailTemplate) => void;
  onDelete?: (templateId: string) => void;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  templates = [],
  onSave,
  onDelete
}) => {
  const { toast } = useToast();
  
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'confirmation' as EmailTemplate['type'],
    subject: '',
    body: ''
  });
  const [previewMode, setPreviewMode] = useState(false);

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setFormData({
      name: '',
      type: 'confirmation',
      subject: '',
      body: ''
    });
    setIsEditing(true);
    setPreviewMode(false);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body
    });
    setIsEditing(true);
    setPreviewMode(false);
  };

  const handleUseDefault = (defaultTemplate: Partial<EmailTemplate>) => {
    setSelectedTemplate(null);
    setFormData({
      name: defaultTemplate.name || '',
      type: defaultTemplate.type || 'confirmation',
      subject: defaultTemplate.subject || '',
      body: defaultTemplate.body || ''
    });
    setIsEditing(true);
    setPreviewMode(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.atsBlue({
        title: 'Validation Error',
        description: 'Please fill in all required fields.'
      });
      return;
    }

    const template: EmailTemplate = {
      id: selectedTemplate?.id || `template_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      subject: formData.subject,
      body: formData.body,
      variables: extractVariables(formData.subject + ' ' + formData.body),
      createdAt: selectedTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(template);
    setIsEditing(false);
    setSelectedTemplate(template);

    toast.atsBlue({
      title: 'Template Saved',
      description: `Email template "${formData.name}" has been saved successfully.`
    });
  };

  const handleDelete = (templateId: string) => {
    if (onDelete) {
      onDelete(templateId);
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
        setIsEditing(false);
      }
      toast.atsBlue({
        title: 'Template Deleted',
        description: 'Email template has been deleted successfully.'
      });
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = formData.body.substring(0, start) + variable + formData.body.substring(end);
      setFormData(prev => ({ ...prev, body: newBody }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{[^}]+\}\}/g);
    return matches ? [...new Set(matches)] : [];
  };

  const renderPreview = () => {
    let previewSubject = formData.subject;
    let previewBody = formData.body;

    // Replace variables with sample data for preview
    const sampleData = {
      '{{candidate_name}}': 'John Doe',
      '{{candidate_email}}': 'john.doe@email.com',
      '{{job_title}}': 'Senior Frontend Developer',
      '{{company_name}}': 'TalentSol Inc.',
      '{{application_date}}': new Date().toLocaleDateString(),
      '{{interview_date}}': 'March 15, 2024',
      '{{interview_time}}': '2:00 PM PST',
      '{{recruiter_name}}': 'Sarah Johnson',
      '{{recruiter_email}}': 'sarah.johnson@talentsol.com'
    };

    Object.entries(sampleData).forEach(([variable, value]) => {
      previewSubject = previewSubject.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
      previewBody = previewBody.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Subject Preview</Label>
          <div className="mt-1 p-3 bg-gray-50 border rounded-md">
            <p className="text-sm">{previewSubject}</p>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Body Preview</Label>
          <div className="mt-1 p-4 bg-gray-50 border rounded-md">
            <pre className="text-sm whitespace-pre-wrap font-sans">{previewBody}</pre>
          </div>
        </div>
      </div>
    );
  };

  const groupedVariables = TEMPLATE_VARIABLES.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {} as Record<string, typeof TEMPLATE_VARIABLES>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Template List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Email Templates</h3>
          <Button onClick={handleCreateNew} size="sm" className="bg-ats-blue hover:bg-ats-dark-blue">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        {/* Default Templates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Default Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEFAULT_TEMPLATES.map((template, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => handleUseDefault(template)}
              >
                <div>
                  <p className="text-sm font-medium">{template.name}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {template.type?.replace('_', ' ')}
                  </Badge>
                </div>
                <Copy className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Custom Templates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Custom Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No custom templates yet
              </p>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-center justify-between p-2 border rounded-md cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id ? 'bg-ats-blue/10 border-ats-blue' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleEditTemplate(template)}
                >
                  <div>
                    <p className="text-sm font-medium">{template.name}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {template.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTemplate(template);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(template.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Template Editor */}
      <div className="lg:col-span-2 space-y-4">
        {isEditing ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-ats-blue" />
                  {selectedTemplate ? 'Edit Template' : 'Create New Template'}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                  <Button onClick={handleSave} className="bg-ats-blue hover:bg-ats-dark-blue">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewMode ? (
                renderPreview()
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name *</Label>
                      <Input
                        id="template-name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter template name..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-type">Template Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as EmailTemplate['type'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmation">Application Confirmation</SelectItem>
                          <SelectItem value="status_update">Status Update</SelectItem>
                          <SelectItem value="interview_invite">Interview Invitation</SelectItem>
                          <SelectItem value="rejection">Application Rejection</SelectItem>
                          <SelectItem value="offer">Job Offer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-subject">Email Subject *</Label>
                    <Input
                      id="template-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter email subject..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-body">Email Body *</Label>
                    <Textarea
                      id="template-body"
                      value={formData.body}
                      onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                      placeholder="Enter email body..."
                      rows={12}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Template Selected</h3>
              <p className="text-gray-500 mb-4">
                Select a template from the list or create a new one to get started.
              </p>
              <Button onClick={handleCreateNew} className="bg-ats-blue hover:bg-ats-dark-blue">
                <Plus className="h-4 w-4 mr-2" />
                Create New Template
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Variables Panel */}
        {isEditing && !previewMode && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Available Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupedVariables).map(([category, variables]) => (
                  <div key={category}>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {variables.map((variable) => {
                        const IconComponent = variable.icon;
                        return (
                          <Button
                            key={variable.key}
                            variant="outline"
                            size="sm"
                            className="justify-start text-xs h-8"
                            onClick={() => insertVariable(variable.key)}
                          >
                            <IconComponent className="h-3 w-3 mr-1" />
                            {variable.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmailTemplateEditor;
