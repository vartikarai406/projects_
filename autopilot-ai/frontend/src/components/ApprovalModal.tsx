import React, { useState } from 'react';
import { ApprovalRequest } from '../types';
import { ShieldAlert, CheckCircle2, XCircle, Mail, AlertTriangle, X } from 'lucide-react';

interface ApprovalModalProps {
  approval: ApprovalRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onDecide: (id: string, decision: 'approved' | 'rejected', comments: string) => Promise<void>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  approval,
  isOpen,
  onClose,
  onDecide
}) => {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !approval) return null;

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await onDecide(approval.id, decision, comments);
      onClose();
    } catch (e) {
      alert("Error resolving approval: " + e);
    } finally {
      setLoading(false);
    }
  };

  const payload = approval.payload_summary || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-dark-card border border-amber-500/40 shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-dark-border bg-gradient-to-r from-amber-950/40 to-dark-card flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Consequential Action Approval Required</h3>
              <p className="text-xs text-amber-300/80">Human-in-the-Loop Security Guard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Security Gate: </span>
              {approval.action_description}
            </div>
          </div>

          {/* Action Payload Preview */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Action Execution Payload</label>
            <div className="p-4 rounded-xl bg-dark-bg border border-dark-border space-y-2 text-xs">
              {payload.recipient && (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-mono w-20">Recipient:</span>
                  <span className="text-white font-medium">{payload.recipient}</span>
                </div>
              )}
              {payload.subject && (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-mono w-20">Subject:</span>
                  <span className="text-slate-200">{payload.subject}</span>
                </div>
              )}
              {payload.body && (
                <div className="pt-2 border-t border-dark-border/60">
                  <span className="text-slate-400 font-mono block mb-1">Body Preview:</span>
                  <div className="p-2.5 rounded bg-dark-surface/60 text-slate-300 whitespace-pre-wrap font-sans text-xs max-h-36 overflow-y-auto">
                    {payload.body}
                  </div>
                </div>
              )}
              {!payload.recipient && (
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto max-h-40">
                  {JSON.stringify(payload, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* Reviewer Comments */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Reviewer Notes (Optional)</label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide context or authorization notes for the audit trail..."
              className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition resize-none"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-dark-border bg-dark-bg/60 flex items-center justify-end space-x-3">
          <button
            onClick={() => handleDecision('rejected')}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject & Halt</span>
          </button>

          <button
            onClick={() => handleDecision('approved')}
            disabled={loading}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-brand-primary hover:bg-indigo-600 text-white text-xs font-medium transition shadow-lg shadow-brand-primary/25 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Resume Execution</span>
          </button>
        </div>
      </div>
    </div>
  );
};
