import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface PageHeaderProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export function PageHeader({
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={iconColor} />
        </div>
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "18px", fontWeight: 600, lineHeight: "1.3" }}>
            {title}
          </h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "12px", lineHeight: "1.4" }}>
            {subtitle}
          </p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface ReportPageHeaderProps {
  reportHome?: string;
  reportName?: string;
  title: string;
  actions?: ReactNode;
}

export function ReportPageHeader({
  reportHome = "Report Home",
  reportName = "Zone Report",
  title,
  actions,
}: ReportPageHeaderProps) {
  return (
    <div className="px-6 pt-3 pb-4 bg-white border-b border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">{reportHome}</span>
            <span className="text-[11px] text-gray-400">›</span>
            <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">{reportName}</span>
          </div>
          <h1 className="text-gray-900" style={{ fontSize: "18px", fontWeight: 600, lineHeight: "1.3" }}>
            {title}
          </h1>
        </div>
        {actions && <div className="flex items-center gap-2 mt-1">{actions}</div>}
      </div>
    </div>
  );
}
