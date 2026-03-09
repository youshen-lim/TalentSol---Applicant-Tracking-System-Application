import { ChevronRight, Download, Save } from "lucide-react";
import { Link } from "react-router-dom";

interface ReportHeaderProps {
  title: string;
  backLink?: string;
  showSave?: boolean;
  showExport?: boolean;
  saveLabel?: string;
}

const ReportHeader = ({
  title,
  backLink = "/analytics",
  showSave = true,
  showExport = true,
  saveLabel = "Save",
}: ReportHeaderProps) => {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Link
          to={backLink}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          style={{ fontSize: 12 }}
        >
          Report Home
        </Link>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-gray-400" style={{ fontSize: 12 }}>Zone Report</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900" style={{ fontSize: 22, fontWeight: 700 }}>{title}</h1>
        <div className="flex items-center gap-2">
          {showExport && (
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition-all">
              <Download size={14} />
              <span style={{ fontSize: 13 }}>Export</span>
            </button>
          )}
          {showSave && (
            <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all">
              <Save size={14} />
              <span style={{ fontSize: 13 }}>{saveLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
