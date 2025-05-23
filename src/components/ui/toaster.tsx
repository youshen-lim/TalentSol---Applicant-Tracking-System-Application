import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

/**
 * Enhanced Toaster component for TalentSol ATS application
 * Includes ATS-specific styling and improved layout
 */
interface ToasterProps {
  variant?: "default" | "destructive" | "ats-blue" | "ats-purple";
}

export function Toaster({ variant }: ToasterProps = {}) {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Use the variant from props if provided, otherwise use the one from the toast
        const toastVariant = variant || props.variant;

        return (
          <Toast key={id} {...props} variant={toastVariant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
