'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { simulateAIAnalysis, AccessibilityReport, AccessibilityIssue } from '@/lib/ai';
import { AlertTriangle, CheckCircle, Info, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function ResultsPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIssue, setActiveIssue] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, we'd fetch the results by ID. Here we load from session storage for demo.
    const storedImage = sessionStorage.getItem('auditImage');
    if (storedImage) setImageUrl(storedImage);
    else setImageUrl('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop'); // Fallback placeholder

    // Simulate AI delay
    const timer = setTimeout(() => {
      setReport(simulateAIAnalysis());
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const markResolved = (id: string) => {
    if (!report) return;
    setReport({
      ...report,
      score: Math.min(100, report.score + 8), // fake score bump
      issues: report.issues.map(i => i.id === id ? { ...i, status: 'Resolved' } : i)
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-xl font-semibold">Running AI Computer Vision...</h2>
        <p className="text-muted-foreground">Analyzing entrances, pathways, and signage.</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Results</h1>
          <p className="text-muted-foreground mt-1">
            Preliminary recommendations - not a legal certification.
          </p>
        </div>
        <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
          <Download className="mr-2 h-4 w-4" />
          Export PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Image and Score */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-1 overflow-hidden relative">
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {imageUrl && <img src={imageUrl} alt="Analyzed space" className="w-full h-full object-cover" />}
              
              {/* Bounding Boxes */}
              {report.issues.filter(i => i.status === 'Open').map((issue) => (
                issue.boundingBox && (
                  <div
                    key={issue.id}
                    onClick={() => setActiveIssue(issue.id)}
                    className={cn(
                      "absolute border-2 cursor-pointer transition-all duration-200 ease-in-out",
                      activeIssue === issue.id ? "border-primary bg-primary/20 z-10 scale-[1.02]" : "border-destructive bg-destructive/20 hover:bg-destructive/30",
                      issue.severity === 'High' ? "border-red-500 bg-red-500/20" : 
                      issue.severity === 'Medium' ? "border-orange-500 bg-orange-500/20" : "border-yellow-500 bg-yellow-500/20"
                    )}
                    style={{
                      left: `${issue.boundingBox.x}%`,
                      top: `${issue.boundingBox.y}%`,
                      width: `${issue.boundingBox.width}%`,
                      height: `${issue.boundingBox.height}%`,
                    }}
                  >
                    <span className="absolute -top-6 left-0 bg-background text-foreground text-xs font-bold px-2 py-1 rounded border shadow-sm whitespace-nowrap">
                      {issue.title} ({issue.confidence}%)
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-muted-foreground">Overall Score</span>
              <span className="text-4xl font-bold mt-2 text-primary">{report.score}/100</span>
            </div>
            <div className="bg-card border border-border rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-muted-foreground">Mobility</span>
              <span className="text-2xl font-bold mt-2">{report.categories.mobility}</span>
            </div>
            <div className="bg-card border border-border rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-muted-foreground">Entrances</span>
              <span className="text-2xl font-bold mt-2">{report.categories.entrances}</span>
            </div>
            <div className="bg-card border border-border rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-muted-foreground">Safety</span>
              <span className="text-2xl font-bold mt-2">{report.categories.safety}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Priority Engine */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold">Action Plan</h2>
            
            <div className="space-y-6">
              {[1, 2, 3].map((priorityLevel) => {
                const priorityIssues = report.issues.filter(i => i.priority === priorityLevel);
                if (priorityIssues.length === 0) return null;

                const label = priorityLevel === 1 ? 'Fix First' : priorityLevel === 2 ? 'Fix Next' : 'Later';
                const color = priorityLevel === 1 ? 'text-red-500' : priorityLevel === 2 ? 'text-orange-500' : 'text-yellow-500';

                return (
                  <div key={priorityLevel} className="space-y-3">
                    <h3 className={`font-semibold flex items-center gap-2 ${color}`}>
                      <AlertTriangle className="h-4 w-4" />
                      {label}
                    </h3>
                    
                    <div className="space-y-3">
                      {priorityIssues.map(issue => (
                        <div 
                          key={issue.id} 
                          className={cn(
                            "p-3 rounded-md border text-sm transition-colors cursor-pointer",
                            activeIssue === issue.id ? "bg-muted border-primary" : "bg-background hover:bg-muted/50",
                            issue.status === 'Resolved' && "opacity-60 bg-muted"
                          )}
                          onClick={() => setActiveIssue(issue.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={cn("font-semibold", issue.status === 'Resolved' && "line-through")}>
                              {issue.title}
                            </span>
                            {issue.status === 'Resolved' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">
                                {issue.confidence}% Conf.
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-2">{issue.explanation}</p>
                          <div className="mt-3 bg-primary/5 p-2 rounded border border-primary/20 text-xs">
                            <span className="font-semibold block mb-1">Priority Reason:</span>
                            {issue.priorityReason}
                          </div>
                          
                          {issue.status === 'Open' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); markResolved(issue.id); }}
                              className="mt-3 w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium py-1.5 rounded transition-colors"
                            >
                              Mark as Resolved
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
