import { Link } from "react-router-dom";
import Badge from "./Badge";
import { cn } from "../../utils/cn";

type Breadcrumb = {
  label: string;
  to?: string;
};

type Props = {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  badge?: { label: string; variant?: "default" | "success" | "warning" | "info" };
  action?: React.ReactNode;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  badge,
  action,
  className,
}: Props) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex flex-col gap-1.5 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-text-soft flex-wrap">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>/</span>}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-primary transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl font-semibold text-text tracking-tight">{title}</h1>
          {badge && (
            <Badge variant={badge.variant ?? "default"}>{badge.label}</Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-text-muted leading-normal max-w-2xl">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}
