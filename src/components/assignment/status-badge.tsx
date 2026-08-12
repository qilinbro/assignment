import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SubmissionStatus =
  | "PENDING"
  | "GRADING"
  | "COMPLETED"
  | "RESUBMISSION_REQUIRED"
  | "RESUBMITTED";

interface StatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: SubmissionStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "待处理",
          variant: "secondary" as const,
          className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
        };
      case "GRADING":
        return {
          label: "批改中",
          variant: "default" as const,
          className: "bg-blue-500 text-white hover:bg-blue-600",
        };
      case "COMPLETED":
        return {
          label: "已完成",
          variant: "default" as const,
          className: "bg-green-500 text-white hover:bg-green-600",
        };
      case "RESUBMISSION_REQUIRED":
        return {
          label: "需要重新提交",
          variant: "destructive" as const,
          className: "bg-red-500 text-white hover:bg-red-600",
        };
      case "RESUBMITTED":
        return {
          label: "已重新提交",
          variant: "default" as const,
          className: "bg-amber-500 text-white hover:bg-amber-600",
        };
      default:
        return {
          label: "未知",
          variant: "secondary" as const,
          className: "",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={cn(config.className, className)} variant={config.variant}>
      {config.label}
    </Badge>
  );
}
