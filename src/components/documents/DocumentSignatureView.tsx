import React from 'react';
import { Document } from '@/pages/Documents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  FileSignature,
  Download,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface DocumentSignatureViewProps {
  document: Document;
  onSendReminder?: () => void;
  onDownload?: () => void;
  onViewHistory?: () => void;
}

/**
 * DocumentSignatureView component
 * Displays document details and signature status with actions
 */
const DocumentSignatureView: React.FC<DocumentSignatureViewProps> = ({
  document,
  onSendReminder,
  onDownload,
  onViewHistory
}) => {
  // Get status badge based on document status
  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4" />
            <span>Pending</span>
          </div>
        );
      case 'sent':
        return (
          <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            <Send className="h-4 w-4" />
            <span>Sent</span>
          </div>
        );
      case 'viewed':
        return (
          <div className="flex items-center gap-2 text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
            <Eye className="h-4 w-4" />
            <span>Viewed</span>
          </div>
        );
      case 'signed':
        return (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full">
            <CheckCircle className="h-4 w-4" />
            <span>Signed</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-1 rounded-full">
            <AlertCircle className="h-4 w-4" />
            <span>Rejected</span>
          </div>
        );
      case 'expired':
        return (
          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1 rounded-full">
            <AlertCircle className="h-4 w-4" />
            <span>Expired</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1 rounded-full">
            <FileText className="h-4 w-4" />
            <span>Unknown</span>
          </div>
        );
    }
  };

  // Get document type icon and label
  const getDocumentTypeInfo = (type: Document['type']) => {
    switch (type) {
      case 'offer_letter':
        return { icon: <FileText className="h-5 w-5" />, label: 'Offer Letter' };
      case 'contract':
        return { icon: <FileText className="h-5 w-5" />, label: 'Contract' };
      case 'nda':
        return { icon: <FileSignature className="h-5 w-5" />, label: 'Non-Disclosure Agreement' };
      case 'background_check':
        return { icon: <FileText className="h-5 w-5" />, label: 'Background Check' };
      case 'tax_form':
        return { icon: <FileText className="h-5 w-5" />, label: 'Tax Form' };
      default:
        return { icon: <FileText className="h-5 w-5" />, label: 'Document' };
    }
  };

  const documentTypeInfo = getDocumentTypeInfo(document.type);

  return (
    <Card className="border-ats-blue/20">
      <CardHeader className="bg-ats-blue/5 border-b border-ats-blue/10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-ats-blue/10 text-ats-blue">
              {documentTypeInfo.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{document.title}</CardTitle>
              <p className="text-sm text-gray-500">{documentTypeInfo.label} for {document.candidateName}</p>
            </div>
          </div>
          {getStatusBadge(document.status)}
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium">{formatDate(document.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">{formatDate(document.updatedAt)}</p>
            </div>
            {document.dueDate && (
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">{formatDate(document.dueDate)}</p>
              </div>
            )}
            {document.signedAt && (
              <div>
                <p className="text-sm text-gray-500">Signed Date</p>
                <p className="font-medium">{formatDate(document.signedAt)}</p>
              </div>
            )}
          </div>

          {document.notes && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Notes</p>
              <p className="text-sm bg-gray-50 p-3 rounded-md">{document.notes}</p>
            </div>
          )}

          {/* Document timeline/status visualization would go here */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Document Timeline</h4>
            <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
              <div className="relative">
                <div className="absolute -left-[25px] p-1 rounded-full bg-ats-blue/20 border-2 border-white">
                  <FileText className="h-3 w-3 text-ats-blue" />
                </div>
                <p className="text-sm font-medium">Document Created</p>
                <p className="text-xs text-gray-500">{formatDate(document.createdAt)}</p>
              </div>

              {document.status !== 'pending' && (
                <div className="relative">
                  <div className="absolute -left-[25px] p-1 rounded-full bg-blue-100 border-2 border-white">
                    <Send className="h-3 w-3 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">Document Sent</p>
                  <p className="text-xs text-gray-500">{formatDate(document.updatedAt)}</p>
                </div>
              )}

              {(document.status === 'viewed' || document.status === 'signed') && (
                <div className="relative">
                  <div className="absolute -left-[25px] p-1 rounded-full bg-purple-100 border-2 border-white">
                    <Eye className="h-3 w-3 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium">Document Viewed</p>
                  <p className="text-xs text-gray-500">{formatDate(document.updatedAt)}</p>
                </div>
              )}

              {document.status === 'signed' && document.signedAt && (
                <div className="relative">
                  <div className="absolute -left-[25px] p-1 rounded-full bg-green-100 border-2 border-white">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Document Signed</p>
                  <p className="text-xs text-gray-500">{formatDate(document.signedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={onViewHistory}>
          <Eye className="h-4 w-4 mr-2" />
          View Document
        </Button>

        <div className="flex gap-2">
          {document.status !== 'signed' && (
            <Button variant="outline" onClick={onSendReminder}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
          )}

          <Button
            className="bg-ats-blue hover:bg-ats-dark-blue text-white"
            onClick={onDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentSignatureView;
