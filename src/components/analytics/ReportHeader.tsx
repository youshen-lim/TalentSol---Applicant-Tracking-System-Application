import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  backLink?: string;
  showSave?: boolean;
  showExport?: boolean;
  showLocationFilter?: boolean;
  showUnsavedBadge?: boolean;
}

/**
 * ReportHeader component
 * Consistent header for report pages with navigation and actions
 */
const ReportHeader = ({
  title,
  subtitle,
  backLink = "/analytics",
  showSave = true,
  showExport = true,
  showLocationFilter = false,
  showUnsavedBadge = false,
}: ReportHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center text-sm text-gray-500">
        <Link to={backLink} className="flex items-center hover:text-ats-blue">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Report Home</span>
        </Link>
        {subtitle && (
          <>
            <span className="mx-2">•</span>
            <span>{subtitle}</span>
          </>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {showUnsavedBadge && (
            <Badge variant="outline" className="text-xs">Unsaved</Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showLocationFilter && (
            <Select defaultValue="america">
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="america">America/Los Angeles</SelectItem>
                <SelectItem value="europe">Europe/London</SelectItem>
                <SelectItem value="asia">Asia/Singapore</SelectItem>
                <SelectItem value="australia">Australia/Sydney</SelectItem>
              </SelectContent>
            </Select>
          )}

          {showExport && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          {showSave && (
            <Button size="sm" variant="ats-blue">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
