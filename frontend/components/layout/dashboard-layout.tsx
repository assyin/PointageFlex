'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-sidebar">
        <Header title={title} subtitle={subtitle} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
