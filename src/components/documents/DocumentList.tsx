import React from 'react';
import { Document } from '@/pages/Documents';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FileText, FileSignature, Mail, Clock, CheckCircle, AlertCircle, File } from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
  onSelectDocument: (document: Document) => void;
  selectedDocumentId?: string;
}

/**
 * DocumentList component
 * Displays a list of documents with status indicators and selection functionality
 */
const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onSelectDocument,
  selectedDocumentId
}) => {
  // Get status icon based on document status
  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'viewed':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'signed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  // Get status badge based on document status
  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sent</Badge>;
      case 'viewed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Viewed</Badge>;
      case 'signed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Signed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get document type icon
  const getDocumentTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'offer_letter':
        return <Mail className="h-4 w-4" />;
      case 'contract':
        return <FileText className="h-4 w-4" />;
      case 'nda':
        return <FileSignature className="h-4 w-4" />;
      case 'background_check':
        return <FileText className="h-4 w-4" />;
      case 'tax_form':
        return <FileText className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-2">
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FileText className="h-12 w-12 mb-2 text-gray-300" />
          <p className="text-lg font-medium">No documents found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        documents.map((document) => (
          <div
            key={document.id}
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition-colors",
              selectedDocumentId === document.id
                ? "border-ats-blue bg-ats-blue/5"
                : "hover:border-gray-300 hover:bg-gray-50"
            )}
            onClick={() => onSelectDocument(document)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-ats-blue/10">
                  {getDocumentTypeIcon(document.type)}
                </div>
                <div>
                  <h3 className="font-medium">{document.title}</h3>
                  <p className="text-sm text-gray-500">{document.candidateName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(document.status)}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                {getStatusIcon(document.status)}
                <span>
                  {document.status === 'signed'
                    ? `Signed on ${formatDate(document.signedAt)}`
                    : document.status === 'sent'
                    ? `Sent on ${formatDate(document.updatedAt)}`
                    : `Updated on ${formatDate(document.updatedAt)}`
                  }
                </span>
              </div>
              {document.dueDate && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Due {formatDate(document.dueDate)}</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DocumentList;
