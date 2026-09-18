import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  className = '',
  footer,
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden ${className}`}
      {...props}
    >
      <div className="p-6">
        {(title || subtitle || Icon) && (
          <div className="flex items-center gap-4 mb-4">
            {Icon && (
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors">
                <Icon className="w-6 h-6" />
              </div>
            )}
            <div>
              {title && <h3 className="text-xl font-bold text-slate-900 leading-tight">{title}</h3>}
              {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
            </div>
          </div>
        )}
        <div className="text-slate-600 leading-relaxed text-sm">
          {children}
        </div>
      </div>
      {footer && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3 font-medium">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
