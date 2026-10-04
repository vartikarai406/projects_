import Link from 'next/link';
import { Activity, ArrowLeft } from 'lucide-react';

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <header className="px-6 h-16 flex items-center border-b border-border bg-background">
        <Link href="/" className="flex items-center gap-2 mr-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Link>
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Activity className="h-5 w-5 text-primary" />
          <span>AccessVision AI Workspace</span>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
