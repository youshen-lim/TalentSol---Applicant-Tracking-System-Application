import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  ChevronDown,
  Circle,
  Square,
  Upload,
  Calendar,
  Hash,
  DollarSign,
  MapPin,
  Plus,
  Settings,
  Eye,
  Save,
  Trash2,
  Copy,
  Move,
  Edit3,
  ArrowLeft,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

import { FormFieldType, FormField, FormSection, ApplicationFormSchema, FormFieldTemplate } from '@/types/application';

// Form Field Templates
const FIELD_TEMPLATES: FormFieldTemplate[] = [
  {
    type: 'TEXT',
    label: 'Text Input',
    icon: 'Type',
    description: 'Single line text input',
    defaultConfig: {
      type: 'TEXT',
      label: 'Text Field',
      placeholder: 'Enter text...',
      required: false,
      order: 0,
      section: 'personal'
    },
    validationOptions: { required: false, minLength: 0, maxLength: 255 }
  },
  {
    type: 'TEXTAREA',
    label: 'Multi-line Text',
    icon: 'AlignLeft',
    description: 'Multi-line text area',
    defaultConfig: {
      type: 'TEXTAREA',
      label: 'Text Area',
      placeholder: 'Enter detailed text...',
      required: false,
      order: 0,
      section: 'personal'
    },
    validationOptions: { required: false, minLength: 0, maxLength: 2000 }
  },
  {
    type: 'EMAIL',
    label: 'Email Address',
    icon: 'Mail',
    description: 'Email input with validation',
    defaultConfig: {
      type: 'EMAIL',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      order: 0,
      section: 'personal'
    },
    validationOptions: { required: true }
  },
  {
    type: 'PHONE',
    label: 'Phone Number',
    icon: 'Phone',
    description: 'Phone number with formatting',
    defaultConfig: {
      type: 'PHONE',
      label: 'Phone Number',
      placeholder: '+1 (555) 123-4567',
      required: false,
      order: 0,
      section: 'personal'
    },
    validationOptions: { required: false }
  },
  {
    type: 'SELECT',
    label: 'Dropdown',
    icon: 'ChevronDown',
    description: 'Dropdown selection',
    defaultConfig: {
      type: 'SELECT',
      label: 'Select Option',
      placeholder: 'Choose an option...',
      required: false,
      order: 0,
      section: 'personal',
      options: ['Option 1', 'Option 2']
    },
    validationOptions: { required: false }
  },
  {
    type: 'RADIO',
    label: 'Radio Buttons',
    icon: 'Circle',
    description: 'Single choice selection',
    defaultConfig: {
      type: 'RADIO',
      label: 'Choose One',
      placeholder: 'Select an option...',
      required: false,
      order: 0,
      section: 'personal',
      options: ['Option 1', 'Option 2', 'Option 3']
    },
    validationOptions: { required: false }
  },
  {
    type: 'CHECKBOX',
    label: 'Checkboxes',
    icon: 'Square',
    description: 'Multiple choice selection',
    defaultConfig: {
      type: 'CHECKBOX',
      label: 'Select All That Apply',
      placeholder: 'Choose options...',
      required: false,
      order: 0,
      section: 'personal',
      options: ['Option 1', 'Option 2', 'Option 3']
    },
    validationOptions: { required: false }
  },
  {
    type: 'FILE',
    label: 'File Upload',
    icon: 'Upload',
    description: 'File upload field',
    defaultConfig: {
      type: 'FILE',
      label: 'Upload File',
      placeholder: 'Choose file...',
      required: false,
      order: 0,
      section: 'documents'
    },
    validationOptions: { 
      required: false, 
      fileTypes: ['.pdf', '.doc', '.docx'],
      maxFileSize: 5242880 // 5MB
    }
  },
  {
    type: 'DATE',
    label: 'Date Picker',
    icon: 'Calendar',
    description: 'Date selection field',
    defaultConfig: {
      type: 'DATE',
      label: 'Select Date',
      placeholder: 'Choose date...',
      required: false,
      order: 0,
      section: 'personal'
    },
    validationOptions: { required: false }
  },
  {
    type: 'SALARY',
    label: 'Salary Range',
    icon: 'DollarSign',
    description: 'Salary expectation field',
    defaultConfig: {
      type: 'SALARY',
      label: 'Expected Salary',
      placeholder: 'Enter salary range...',
      required: false,
      order: 0,
      section: 'professional'
    },
    validationOptions: { required: false, min: 0, max: 1000000 }
  }
];

const FORM_SECTIONS = [
  { id: 'personal', title: 'Personal Information', description: 'Basic candidate details' },
  { id: 'professional', title: 'Professional Information', description: 'Work experience and skills' },
  { id: 'documents', title: 'Documents', description: 'Resume, cover letter, and other files' },
  { id: 'custom', title: 'Custom Questions', description: 'Job-specific questions' }
];

interface ApplicationFormBuilderProps {
  jobId: string;
  initialSchema?: ApplicationFormSchema;
  onSave: (schema: ApplicationFormSchema) => void;
  onPreview: (schema: ApplicationFormSchema) => void;
  onClose?: () => void;
  onNavigateToPreview?: () => void;
}

const ApplicationFormBuilder: React.FC<ApplicationFormBuilderProps> = ({
  jobId,
  initialSchema,
  onSave,
  onPreview,
  onClose,
  onNavigateToPreview
}) => {
  const { toast } = useToast();
  
  const [schema, setSchema] = useState<ApplicationFormSchema>(
    initialSchema || {
      id: `form_${Date.now()}`,
      jobId,
      title: 'Job Application Form',
      description: 'Please fill out this form to apply for the position.',
      sections: FORM_SECTIONS.map(section => ({
        ...section,
        order: FORM_SECTIONS.indexOf(section),
        fields: []
      })),
      settings: {
        allowSave: true,
        autoSave: true,
        showProgress: true,
        multiStep: true,
        requireLogin: false,
        gdprCompliance: true,
        eeocQuestions: false
      },
      emailSettings: {
        confirmationTemplate: 'default',
        autoResponse: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user',
      version: 1
    }
  );

  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const getFieldIcon = (type: FormFieldType) => {
    const iconMap = {
      TEXT: Type,
      TEXTAREA: AlignLeft,
      EMAIL: Mail,
      PHONE: Phone,
      SELECT: ChevronDown,
      RADIO: Circle,
      CHECKBOX: Square,
      FILE: Upload,
      DATE: Calendar,
      NUMBER: Hash,
      SALARY: DollarSign,
      LOCATION: MapPin
    };
    return iconMap[type] || Type;
  };

  const addField = useCallback((template: FormFieldTemplate, sectionId: string) => {
    const newField: FormField = {
      ...template.defaultConfig,
      id: `field_${Date.now()}`,
      section: sectionId,
      order: schema.sections.find(s => s.id === sectionId)?.fields.length || 0
    } as FormField;

    setSchema(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      ),
      updatedAt: new Date().toISOString()
    }));

    setSelectedField(newField.id);

    toast.atsBlue({
      title: 'Field Added',
      description: `${template.label} has been added to the form.`
    });
  }, [schema.sections, toast]);

  // Drag and drop handler
  const onDragEnd = useCallback((result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    // If dropped in the same place, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Handle dragging from field library to sections
    if (source.droppableId === 'field-library') {
      const template = FIELD_TEMPLATES.find(t => t.type === draggableId);
      if (template && destination.droppableId.startsWith('section-')) {
        const sectionId = destination.droppableId.replace('section-', '');
        addField(template, sectionId);
      }
      return;
    }

    // Handle reordering fields within sections or moving between sections
    if (source.droppableId.startsWith('section-') && destination.droppableId.startsWith('section-')) {
      const sourceSectionId = source.droppableId.replace('section-', '');
      const destSectionId = destination.droppableId.replace('section-', '');

      setSchema(prev => {
        const newSections = [...prev.sections];
        const sourceSection = newSections.find(s => s.id === sourceSectionId);
        const destSection = newSections.find(s => s.id === destSectionId);

        if (!sourceSection || !destSection) return prev;

        // Remove field from source
        const [movedField] = sourceSection.fields.splice(source.index, 1);

        // Update field's section if moving between sections
        if (sourceSectionId !== destSectionId) {
          movedField.section = destSectionId;
        }

        // Add field to destination
        destSection.fields.splice(destination.index, 0, movedField);

        // Update field orders
        sourceSection.fields.forEach((field, index) => {
          field.order = index;
        });
        destSection.fields.forEach((field, index) => {
          field.order = index;
        });

        return {
          ...prev,
          sections: newSections,
          updatedAt: new Date().toISOString()
        };
      });
    }
  }, [addField]);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setSchema(prev => ({
      ...prev,
      sections: prev.sections.map(section => ({
        ...section,
        fields: section.fields.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        )
      })),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setSchema(prev => ({
      ...prev,
      sections: prev.sections.map(section => ({
        ...section,
        fields: section.fields.filter(field => field.id !== fieldId)
      })),
      updatedAt: new Date().toISOString()
    }));

    if (selectedField === fieldId) {
      setSelectedField(null);
    }

    toast.atsBlue({
      title: 'Field Removed',
      description: 'The field has been removed from the form.'
    });
  }, [selectedField, toast]);

  const handleSave = () => {
    onSave(schema);
    toast.atsBlue({
      title: 'Form Saved',
      description: 'The application form has been saved successfully.'
    });
  };

  const handlePreview = () => {
    // Save the current schema first
    onSave(schema);

    // Navigate to the preview page if handler is provided
    if (onNavigateToPreview) {
      onNavigateToPreview();
    } else {
      // Fallback to the original preview handler
      onPreview(schema);
      setPreviewMode(true);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-screen bg-gray-50">
        {/* Field Library Panel */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Form Fields</h2>
            <p className="text-sm text-gray-500 mt-1">Drag fields to add them to your form</p>
          </div>

          <Droppable droppableId="field-library" isDropDisabled={true}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="p-4 space-y-3"
              >
                {FIELD_TEMPLATES.map((template, index) => {
                  const IconComponent = getFieldIcon(template.type);
                  return (
                    <Draggable
                      key={template.type}
                      draggableId={template.type}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`cursor-pointer hover:shadow-md transition-shadow border-gray-200 ${
                            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                          }`}
                          onClick={() => {
                            if (!snapshot.isDragging) {
                              addField(template, 'personal');
                            }
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-ats-blue/10 rounded-md">
                                <IconComponent className="h-4 w-4 text-ats-blue" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-sm text-gray-900">{template.label}</h3>
                                <p className="text-xs text-gray-500">{template.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

      {/* Form Canvas */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Form Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {onClose && (
                  <Button variant="outline" size="sm" onClick={onClose}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSave} className="bg-ats-blue hover:bg-ats-dark-blue">
                  <Save className="h-4 w-4 mr-2" />
                  Save Form
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="form-title">Form Title</Label>
                <Input
                  id="form-title"
                  value={schema.title}
                  onChange={(e) => setSchema(prev => ({ 
                    ...prev, 
                    title: e.target.value,
                    updatedAt: new Date().toISOString()
                  }))}
                  placeholder="Enter form title..."
                />
              </div>
              <div>
                <Label htmlFor="form-description">Description</Label>
                <Input
                  id="form-description"
                  value={schema.description || ''}
                  onChange={(e) => setSchema(prev => ({ 
                    ...prev, 
                    description: e.target.value,
                    updatedAt: new Date().toISOString()
                  }))}
                  placeholder="Enter form description..."
                />
              </div>
            </div>
          </div>

          {/* Form Sections */}
          {schema.sections.map((section) => (
            <Card key={section.id} className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{section.title}</span>
                  <Badge variant="outline">{section.fields.length} fields</Badge>
                </CardTitle>
                {section.description && (
                  <p className="text-sm text-gray-500">{section.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <Droppable droppableId={`section-${section.id}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[100px] ${
                        snapshot.isDraggingOver
                          ? 'bg-ats-blue/10 border-2 border-dashed border-ats-blue rounded-lg'
                          : ''
                      }`}
                    >
                      {section.fields.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No fields in this section yet.</p>
                          <p className="text-sm">Drag fields from the left panel to add them here.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {section.fields.map((field, index) => {
                            const IconComponent = getFieldIcon(field.type);
                            return (
                              <Draggable key={field.id} draggableId={field.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                      selectedField === field.id
                                        ? 'border-ats-blue bg-ats-blue/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                    } ${
                                      snapshot.isDragging ? 'shadow-lg rotate-1' : ''
                                    }`}
                                    onClick={() => setSelectedField(field.id)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                                        >
                                          <Move className="h-3 w-3 text-gray-400" />
                                        </div>
                                        <IconComponent className="h-4 w-4 text-gray-500" />
                                        <div>
                                          <h4 className="font-medium text-sm">{field.label}</h4>
                                          <p className="text-xs text-gray-500">{field.type}</p>
                                        </div>
                                        {field.required && (
                                          <Badge variant="destructive" className="text-xs">Required</Badge>
                                        )}
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedField(field.id);
                                          }}
                                        >
                                          <Edit3 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-red-500 hover:text-red-700"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeField(field.id);
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Field Settings Panel */}
      {selectedField && (() => {
        const field = schema.sections
          .flatMap(s => s.fields)
          .find(f => f.id === selectedField);

        if (!field) return null;

        return (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Field Settings</h2>
              <p className="text-sm text-gray-500 mt-1">Configure the selected field</p>
            </div>

            <div className="p-4 space-y-4">
              {/* Field Label */}
              <div>
                <Label htmlFor="field-label">Field Label</Label>
                <Input
                  id="field-label"
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  placeholder="Enter field label"
                />
              </div>

              {/* Field Placeholder */}
              <div>
                <Label htmlFor="field-placeholder">Placeholder Text</Label>
                <Input
                  id="field-placeholder"
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                />
              </div>

              {/* Required Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-required"
                  checked={field.required}
                  onCheckedChange={(checked) => updateField(field.id, { required: !!checked })}
                />
                <Label htmlFor="field-required">Required field</Label>
              </div>

              {/* Field Type Display */}
              <div>
                <Label>Field Type</Label>
                <div className="p-2 bg-gray-50 rounded border text-sm text-gray-600">
                  {field.type}
                </div>
              </div>

              {/* Options for SELECT, RADIO, CHECKBOX fields */}
              {(field.type === 'SELECT' || field.type === 'RADIO' || field.type === 'CHECKBOX') && (
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {field.options?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(field.options || [])];
                            newOptions[index] = e.target.value;
                            updateField(field.id, { options: newOptions });
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newOptions = field.options?.filter((_, i) => i !== index) || [];
                            updateField(field.id, { options: newOptions });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )) || []}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = [...(field.options || []), ''];
                        updateField(field.id, { options: newOptions });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              {/* File validation for FILE fields */}
              {field.type === 'FILE' && (
                <div className="space-y-3">
                  <div>
                    <Label>Allowed File Types</Label>
                    <Input
                      value={field.validation?.fileTypes?.join(', ') || ''}
                      onChange={(e) => {
                        const fileTypes = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                        updateField(field.id, {
                          validation: {
                            ...field.validation,
                            fileTypes
                          }
                        });
                      }}
                      placeholder=".pdf, .doc, .docx"
                    />
                  </div>
                  <div>
                    <Label>Max File Size (MB)</Label>
                    <Input
                      type="number"
                      value={field.validation?.maxFileSize ? field.validation.maxFileSize / (1024 * 1024) : ''}
                      onChange={(e) => {
                        const maxFileSize = parseFloat(e.target.value) * 1024 * 1024;
                        updateField(field.id, {
                          validation: {
                            ...field.validation,
                            maxFileSize: isNaN(maxFileSize) ? undefined : maxFileSize
                          }
                        });
                      }}
                      placeholder="5"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
    </DragDropContext>
  );
};

export default ApplicationFormBuilder;
