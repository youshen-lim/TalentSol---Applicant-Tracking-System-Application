import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { shadows } from "@/components/ui/shadow";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, FileText, FileSignature, Mail, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DocumentList from "@/components/documents/DocumentList";
import DocumentChat from "@/components/documents/DocumentChat";
import DocumentSignatureView from "@/components/documents/DocumentSignatureView";
import PageHeader from "@/components/layout/PageHeader";
import DocumentRequestForm, { DocumentRequestData } from "@/components/documents/DocumentRequestForm";
import { toast } from "sonner";
import { generateId } from "@/lib/utils";

// Document types
export type DocumentStatus = 'pending' | 'sent' | 'viewed' | 'signed' | 'rejected' | 'expired';
export type DocumentType = 'offer_letter' | 'contract' | 'nda' | 'background_check' | 'tax_form' | 'other';

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  candidateId: string;
  candidateName: string;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  signedAt?: Date;
  fileUrl?: string;
  notes?: string;
}

// Mock data for documents
const mockDocuments: Document[] = [
  {
    id: generateId(),
    title: 'Non-Disclosure Agreement',
    type: 'nda',
    candidateId: '1',
    candidateName: 'Bruce Bryant',
    status: 'sent',
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-10'),
    dueDate: new Date('2023-04-17'),
  },
  {
    id: generateId(),
    title: 'Offer Letter - Senior Developer',
    type: 'offer_letter',
    candidateId: '1',
    candidateName: 'Bruce Bryant',
    status: 'pending',
    createdAt: new Date('2023-04-08'),
    updatedAt: new Date('2023-04-08'),
  },
  {
    id: generateId(),
    title: 'Employment Contract',
    type: 'contract',
    candidateId: '1',
    candidateName: 'Bruce Bryant',
    status: 'pending',
    createdAt: new Date('2023-04-08'),
    updatedAt: new Date('2023-04-08'),
  },
  {
    id: generateId(),
    title: 'Background Check Authorization',
    type: 'background_check',
    candidateId: '2',
    candidateName: 'Sara Henderson',
    status: 'signed',
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2023-04-07'),
    signedAt: new Date('2023-04-07'),
  },
  {
    id: generateId(),
    title: 'W-4 Tax Form',
    type: 'tax_form',
    candidateId: '2',
    candidateName: 'Sara Henderson',
    status: 'viewed',
    createdAt: new Date('2023-04-06'),
    updatedAt: new Date('2023-04-08'),
    dueDate: new Date('2023-04-15'),
  },
];

/**
 * Documents page component
 * Manages document workflows including e-signatures, offer letters, and contracts
 * Includes a chat interface for natural language querying
 */
const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Filter documents based on search query and selected tab
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.candidateName.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'pending') return matchesSearch && doc.status === 'pending';
    if (selectedTab === 'sent') return matchesSearch && doc.status === 'sent';
    if (selectedTab === 'signed') return matchesSearch && doc.status === 'signed';
    if (selectedTab === 'action_required') {
      return matchesSearch && (doc.status === 'viewed' || doc.status === 'rejected');
    }

    return matchesSearch;
  });

  // Handle document selection
  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  return (
    <div className="ats-page-layout">
      <div className="ats-content-container">
      <PageHeader
        title="Documents"
        subtitle="Manage document workflows with candidates and employees"
        icon={FileText}
      >
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setIsRequestDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Request Document
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)]">
        {/* Left side - Document management */}
        <div className="w-full md:w-2/3 flex flex-col">
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documents..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="all" className="flex-1 flex flex-col" onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-5 mb-4" variant="ats-blue">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="signed">Signed</TabsTrigger>
              <TabsTrigger value="action_required">Action Required</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-auto">
              <DocumentList
                documents={filteredDocuments}
                onSelectDocument={handleSelectDocument}
                selectedDocumentId={selectedDocument?.id}
              />
            </TabsContent>

            <TabsContent value="pending" className="flex-1 overflow-auto">
              <DocumentList
                documents={filteredDocuments}
                onSelectDocument={handleSelectDocument}
                selectedDocumentId={selectedDocument?.id}
              />
            </TabsContent>

            <TabsContent value="sent" className="flex-1 overflow-auto">
              <DocumentList
                documents={filteredDocuments}
                onSelectDocument={handleSelectDocument}
                selectedDocumentId={selectedDocument?.id}
              />
            </TabsContent>

            <TabsContent value="signed" className="flex-1 overflow-auto">
              <DocumentList
                documents={filteredDocuments}
                onSelectDocument={handleSelectDocument}
                selectedDocumentId={selectedDocument?.id}
              />
            </TabsContent>

            <TabsContent value="action_required" className="flex-1 overflow-auto">
              <DocumentList
                documents={filteredDocuments}
                onSelectDocument={handleSelectDocument}
                selectedDocumentId={selectedDocument?.id}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right side - Document details and chat interface */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          {/* Document details when selected */}
          {selectedDocument && (
            <div className="mb-4">
              <DocumentSignatureView
                document={selectedDocument}
                onSendReminder={() => {
                  toast.success("Reminder sent", {
                    description: `A reminder has been sent to ${selectedDocument.candidateName}`,
                  });
                }}
                onDownload={() => {
                  toast.success("Document downloaded", {
                    description: `${selectedDocument.title} has been downloaded`,
                  });
                }}
                onViewHistory={() => {
                  toast.info("Viewing document", {
                    description: `Opening ${selectedDocument.title}`,
                  });
                }}
              />
            </div>
          )}

          {/* Chat interface */}
          <div className={`${shadows.card} overflow-hidden flex flex-col flex-1`}>
            <DocumentChat selectedDocument={selectedDocument} />
          </div>
        </div>
      </div>

      {/* Document Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Request Document</DialogTitle>
          </DialogHeader>
          <DocumentRequestForm
            onSubmit={(data) => {
              // Create a new document from the form data
              const newDocument: Document = {
                id: generateId(),
                title: data.title,
                type: data.type,
                candidateId: data.candidateId,
                candidateName: data.candidateName,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                dueDate: data.dueDate,
                notes: data.notes,
              };

              // Add the new document to the list
              setDocuments([newDocument, ...documents]);

              // Close the dialog
              setIsRequestDialogOpen(false);

              // Show success toast
              toast.success("Document request created", {
                description: `${data.title} has been requested from ${data.candidateName}`,
              });
            }}
            onCancel={() => setIsRequestDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default Documents;
