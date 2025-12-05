'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-text-primary">{title}</h1>
          {subtitle && (
            <p className="text-small text-text-secondary mt-1">{subtitle}</p>
          )}
        </div>
        {children && <div className="flex gap-3">{children}</div>}
      </div>
    </div>
  );
}
