import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Upload, 
  FileText, 
  Plus, 
  X, 
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { candidatesApi } from '@/services/api';

interface AddCandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CandidateForm {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
  };
  application: {
    position: string;
    source: string;
    expectedSalary: string;
    availabilityDate: string;
  };
  qualifications: {
    experience: string;
    skills: string[];
    education: string;
    languages: string[];
  };
  screening: {
    initialNotes: string;
    rating: number;
  };
}

const positions = [
  'Senior Developer',
  'UX Designer', 
  'Product Manager',
  'Data Scientist',
  'Marketing Lead',
  'Sales Representative',
  'DevOps Engineer',
  'QA Engineer'
];

const sources = [
  { value: 'company-website', label: 'Company Website' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'referral', label: 'Employee Referral' },
  { value: 'job-board', label: 'Job Board' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'other', label: 'Other' },
];

const commonSkills = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'TypeScript',
  'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'Git',
  'Figma', 'Adobe Creative Suite', 'UI/UX Design', 'Product Management',
  'Data Analysis', 'Machine Learning', 'Marketing', 'Sales'
];

const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Portuguese'];

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  const [formData, setFormData] = useState<CandidateForm>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
    },
    application: {
      position: '',
      source: '',
      expectedSalary: '',
      availabilityDate: '',
    },
    qualifications: {
      experience: '',
      skills: [],
      education: '',
      languages: [],
    },
    screening: {
      initialNotes: '',
      rating: 0,
    },
  });

  const updatePersonalInfo = (field: keyof CandidateForm['personalInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateApplication = (field: keyof CandidateForm['application'], value: string) => {
    setFormData(prev => ({
      ...prev,
      application: { ...prev.application, [field]: value }
    }));
  };

  const updateQualifications = (field: keyof CandidateForm['qualifications'], value: any) => {
    setFormData(prev => ({
      ...prev,
      qualifications: { ...prev.qualifications, [field]: value }
    }));
  };

  const updateScreening = (field: keyof CandidateForm['screening'], value: any) => {
    setFormData(prev => ({
      ...prev,
      screening: { ...prev.screening, [field]: value }
    }));
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.qualifications.skills.includes(skill)) {
      updateQualifications('skills', [...formData.qualifications.skills, skill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    updateQualifications('skills', formData.qualifications.skills.filter(s => s !== skill));
  };

  const addLanguage = (language: string) => {
    if (language && !formData.qualifications.languages.includes(language)) {
      updateQualifications('languages', [...formData.qualifications.languages, language]);
      setLanguageInput('');
    }
  };

  const removeLanguage = (language: string) => {
    updateQualifications('languages', formData.qualifications.languages.filter(l => l !== language));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      // Simulate resume parsing
      toast.atsBlue({
        title: "Resume uploaded",
        description: "Resume has been uploaded and is being parsed for candidate information.",
      });
      
      // Mock auto-fill from resume parsing
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@email.com',
            phone: '+1-555-0123',
            location: 'New York, NY'
          },
          qualifications: {
            ...prev.qualifications,
            experience: '5+ years',
            skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
            education: "Bachelor's in Computer Science",
            languages: ['English', 'Spanish']
          }
        }));
        toast.atsBlue({
          title: "Resume parsed successfully",
          description: "Candidate information has been auto-filled from the resume.",
        });
      }, 1500);
    }
  };

  const validateForm = () => {
    const { personalInfo, application } = formData;
    
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email) {
      toast({
        variant: "destructive",
        title: "Required fields missing",
        description: "Please fill in all required personal information fields.",
      });
      setActiveTab('personal');
      return false;
    }

    if (!application.position) {
      toast({
        variant: "destructive",
        title: "Position required",
        description: "Please select a position for the candidate.",
      });
      setActiveTab('application');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare candidate data for API
      const candidateData = {
        firstName: formData.personalInfo.firstName,
        lastName: formData.personalInfo.lastName,
        email: formData.personalInfo.email,
        phone: formData.personalInfo.phone,
        location: formData.personalInfo.location,
        source: formData.application.source,
        expectedSalary: formData.application.expectedSalary ? parseInt(formData.application.expectedSalary) : undefined,
        availabilityDate: formData.application.availabilityDate || undefined,
        experience: formData.qualifications.experience,
        skills: formData.qualifications.skills,
        education: formData.qualifications.education,
        languages: formData.qualifications.languages,
        initialNotes: formData.screening.initialNotes,
        rating: formData.screening.rating,
        // TODO: Handle resume file upload when file upload API is implemented
        resumeUrl: resumeFile ? `resume_${Date.now()}_${resumeFile.name}` : undefined,
      };

      // Call the real API
      const response = await candidatesApi.createCandidate(candidateData);

      setIsSubmitting(false);

      toast.atsBlue({
        title: "Candidate added successfully",
        description: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName} has been added to the pipeline.`,
      });

      onOpenChange(false);

      // Reset form
      setFormData({
        personalInfo: { firstName: '', lastName: '', email: '', phone: '', location: '' },
        application: { position: '', source: '', expectedSalary: '', availabilityDate: '' },
        qualifications: { experience: '', skills: [], education: '', languages: [] },
        screening: { initialNotes: '', rating: 0 },
      });
      setResumeFile(null);
      setActiveTab('personal');

    } catch (error) {
      setIsSubmitting(false);
      console.error('Error creating candidate:', error);

      toast.atsBlue({
        title: "Failed to add candidate",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
      });
    }
  };

  const isTabComplete = (tab: string) => {
    switch (tab) {
      case 'personal':
        return formData.personalInfo.firstName && formData.personalInfo.lastName && formData.personalInfo.email;
      case 'application':
        return formData.application.position;
      case 'qualifications':
        return formData.qualifications.experience || formData.qualifications.skills.length > 0;
      case 'screening':
        return true; // Optional tab
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-ats-blue" />
            Add New Candidate
          </DialogTitle>
          <DialogDescription>
            Add a new candidate to your recruitment pipeline
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              {isTabComplete('personal') && <CheckCircle className="h-4 w-4 text-green-500" />}
              Personal
            </TabsTrigger>
            <TabsTrigger value="application" className="flex items-center gap-2">
              {isTabComplete('application') && <CheckCircle className="h-4 w-4 text-green-500" />}
              Application
            </TabsTrigger>
            <TabsTrigger value="qualifications" className="flex items-center gap-2">
              {isTabComplete('qualifications') && <CheckCircle className="h-4 w-4 text-green-500" />}
              Qualifications
            </TabsTrigger>
            <TabsTrigger value="screening">
              Screening
            </TabsTrigger>
          </TabsList>

          {/* Resume Upload Section */}
          <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="mt-2">
                <Label htmlFor="resume-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-ats-blue hover:text-ats-dark-blue">
                    Upload Resume
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    to auto-fill candidate information
                  </span>
                </Label>
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {resumeFile && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">{resumeFile.name}</span>
                </div>
              )}
            </div>
          </div>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.personalInfo.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  placeholder="Enter location"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="application" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Select value={formData.application.position} onValueChange={(value) => updateApplication('position', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select value={formData.application.source} onValueChange={(value) => updateApplication('source', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedSalary">Expected Salary</Label>
                <Input
                  id="expectedSalary"
                  value={formData.application.expectedSalary}
                  onChange={(e) => updateApplication('expectedSalary', e.target.value)}
                  placeholder="e.g., $85,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availabilityDate">Availability Date</Label>
                <Input
                  id="availabilityDate"
                  type="date"
                  value={formData.application.availabilityDate}
                  onChange={(e) => updateApplication('availabilityDate', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="qualifications" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                value={formData.qualifications.experience}
                onChange={(e) => updateQualifications('experience', e.target.value)}
                placeholder="e.g., 5+ years"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={() => addSkill(skillInput)}
                  className="bg-ats-blue hover:bg-ats-dark-blue"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {commonSkills.map((skill) => (
                  <Button
                    key={skill}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSkill(skill)}
                    className="text-xs"
                  >
                    {skill}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.qualifications.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={formData.qualifications.education}
                onChange={(e) => updateQualifications('education', e.target.value)}
                placeholder="e.g., Bachelor's in Computer Science"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex gap-2 mb-2">
                <Select value={languageInput} onValueChange={setLanguageInput}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={() => addLanguage(languageInput)}
                  className="bg-ats-blue hover:bg-ats-dark-blue"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.qualifications.languages.map((language) => (
                  <Badge key={language} variant="secondary" className="flex items-center gap-1">
                    {language}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeLanguage(language)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="screening" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initialNotes">Initial Screening Notes</Label>
              <Textarea
                id="initialNotes"
                value={formData.screening.initialNotes}
                onChange={(e) => updateScreening('initialNotes', e.target.value)}
                placeholder="Add any initial notes about the candidate..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Initial Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    type="button"
                    variant={formData.screening.rating >= rating ? "ats-blue" : "outline"}
                    size="sm"
                    onClick={() => updateScreening('rating', rating)}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-ats-blue hover:bg-ats-dark-blue"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Adding Candidate...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateModal;
