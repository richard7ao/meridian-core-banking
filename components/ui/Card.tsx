import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
};

export function Card({ title, children, className, footer }: CardProps) {
  return (
    <div
      className={`border border-gray-200 rounded-lg bg-white shadow-sm ${className ?? ""}`}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
}
