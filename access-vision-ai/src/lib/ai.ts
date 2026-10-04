export type Severity = 'High' | 'Medium' | 'Low';

export interface AccessibilityIssue {
  id: string;
  title: string;
  category: 'Mobility' | 'Entrances' | 'Safety' | 'Signage' | 'Visual';
  severity: Severity;
  confidence: number;
  explanation: string;
  recommendation: string;
  boundingBox?: { x: number; y: number; width: number; height: number }; // percentages
  priority: 1 | 2 | 3;
  priorityReason: string;
  status: 'Open' | 'Resolved';
}

export interface AccessibilityReport {
  score: number;
  categories: {
    mobility: number;
    entrances: number;
    safety: number;
    signage: number;
  };
  issues: AccessibilityIssue[];
}

export function simulateAIAnalysis(): AccessibilityReport {
  return {
    score: 72,
    categories: {
      mobility: 78,
      entrances: 82,
      safety: 70,
      signage: 61,
    },
    issues: [
      {
        id: 'issue-1',
        title: 'Blocked Wheelchair Ramp',
        category: 'Mobility',
        severity: 'High',
        confidence: 91,
        explanation: 'The visible ramp appears to have an obstruction within the access path, restricting wheelchair movement.',
        recommendation: 'Remove the obstruction and maintain a clear accessible route.',
        boundingBox: { x: 30, y: 50, width: 25, height: 35 },
        priority: 1,
        priorityReason: 'High severity + affects a primary entrance.',
        status: 'Open',
      },
      {
        id: 'issue-2',
        title: 'Missing Accessibility Signage',
        category: 'Signage',
        severity: 'Medium',
        confidence: 85,
        explanation: 'The main entrance lacks visible signage indicating an accessible route or features.',
        recommendation: 'Install high-contrast, ADA-compliant directional signage near the entrance.',
        boundingBox: { x: 60, y: 20, width: 10, height: 10 },
        priority: 2,
        priorityReason: 'Medium severity + easy fix that improves wayfinding.',
        status: 'Open',
      },
      {
        id: 'issue-3',
        title: 'Uneven Pathway Surface',
        category: 'Mobility',
        severity: 'Low',
        confidence: 68,
        explanation: 'The transition between the walkway and the entrance seems slightly uneven, which could cause tripping.',
        recommendation: 'Ensure a smooth transition (bevel if necessary) with no vertical change greater than 1/4 inch.',
        priority: 3,
        priorityReason: 'Lower severity + needs physical verification.',
        status: 'Open',
      }
    ]
  };
}
