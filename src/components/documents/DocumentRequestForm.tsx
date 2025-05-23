import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentType } from '@/pages/Documents';

interface DocumentRequestFormProps {
  onSubmit: (data: DocumentRequestData) => void;
  onCancel: () => void;
}

export interface DocumentRequestData {
  title: string;
  type: DocumentType;
  candidateId: string;
  candidateName: string;
  dueDate?: Date;
  notes?: string;
  template?: string;
}

/**
 * DocumentRequestForm component
 * Form for requesting documents from candidates
 */
const DocumentRequestForm: React.FC<DocumentRequestFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<DocumentRequestData>({
    title: '',
    type: 'offer_letter',
    candidateId: '',
    candidateName: '',
    notes: '',
    template: '',
  });
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  // Mock candidate data for dropdown
  const mockCandidates = [
    { id: '1', name: 'Bruce Bryant' },
    { id: '2', name: 'Sara Henderson' },
    { id: '3', name: 'John Smith' },
    { id: '4', name: 'Emily Johnson' },
    { id: '5', name: 'Michael Chen' },
  ];

  // Mock document templates
  const documentTemplates = {
    offer_letter: [
      'Standard Offer Letter',
      'Senior Position Offer Letter',
      'Executive Offer Letter',
      'Remote Work Offer Letter',
    ],
    contract: [
      'Full-time Employment Contract',
      'Part-time Employment Contract',
      'Contractor Agreement',
      'Temporary Employment Contract',
    ],
    nda: [
      'Standard Non-Disclosure Agreement',
      'Mutual Non-Disclosure Agreement',
      'Interview NDA',
    ],
    background_check: [
      'Standard Background Check Authorization',
      'Executive Background Check Authorization',
    ],
    tax_form: [
      'W-4 Form',
      'W-9 Form',
      'I-9 Form',
    ],
    other: [
      'Custom Document',
    ],
  };

  // Get templates based on selected document type
  const getTemplatesForType = (type: DocumentType) => {
    return documentTemplates[type] || documentTemplates.other;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate,
    });
  };

  const handleCandidateChange = (candidateId: string) => {
    const candidate = mockCandidates.find(c => c.id === candidateId);
    if (candidate) {
      setFormData({
        ...formData,
        candidateId,
        candidateName: candidate.name,
      });
    }
  };

  const handleTypeChange = (type: DocumentType) => {
    setFormData({
      ...formData,
      type,
      template: '', // Reset template when type changes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Document Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter document title"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Document Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleTypeChange(value as DocumentType)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="offer_letter">Offer Letter</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
              <SelectItem value="background_check">Background Check</SelectItem>
              <SelectItem value="tax_form">Tax Form</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="template">Document Template</Label>
          <Select
            value={formData.template}
            onValueChange={(value) => setFormData({ ...formData, template: value })}
          >
            <SelectTrigger id="template">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {getTemplatesForType(formData.type).map((template) => (
                <SelectItem key={template} value={template}>
                  {template}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="candidate">Candidate</Label>
        <Select
          value={formData.candidateId}
          onValueChange={handleCandidateChange}
        >
          <SelectTrigger id="candidate">
            <SelectValue placeholder="Select candidate" />
          </SelectTrigger>
          <SelectContent>
            {mockCandidates.map((candidate) => (
              <SelectItem key={candidate.id} value={candidate.id}>
                {candidate.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : "Select due date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any additional instructions or notes"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-ats-blue hover:bg-ats-dark-blue text-white">
          Request Document
        </Button>
      </div>
    </form>
  );
};

export default DocumentRequestForm;
