import React, { useState } from 'react';
import { Artifact } from '../types';
import { api } from '../services/api';
import { FileText, Download, Eye, Image as ImageIcon, FileCode, CheckCircle2 } from 'lucide-react';

interface ArtifactViewerProps {
  artifacts: Artifact[];
}

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({ artifacts }) => {
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (artifacts.length === 0) {
    return (
      <div className="p-8 rounded-xl border border-dashed border-dark-border text-center text-slate-500 text-xs">
        No artifacts generated yet. Output files will appear here upon step verification.
      </div>
    );
  }

  const handlePreview = async (art: Artifact) => {
    setLoading(true);
    setPreviewTitle(art.name);
    try {
      const content = await api.getArtifactContent(art.id);
      setPreviewContent(content);
    } catch (e) {
      alert("Could not load preview: " + e);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
          <span>Generated Artifacts & Reports</span>
          <span className="text-xs font-normal text-slate-400">({artifacts.length})</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {artifacts.map((art) => {
          const isPdf = art.file_type === 'pdf';
          const isChart = art.file_type === 'png';
          const isMd = art.file_type === 'markdown';

          return (
            <div
              key={art.id}
              className="p-4 rounded-xl bg-dark-card border border-dark-border hover:border-slate-700 transition flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isPdf ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' :
                  isChart ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25' :
                  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                }`}>
                  {isPdf && <FileText className="w-5 h-5" />}
                  {isChart && <ImageIcon className="w-5 h-5" />}
                  {isMd && <FileCode className="w-5 h-5" />}
                  {!isPdf && !isChart && !isMd && <FileText className="w-5 h-5" />}
                </div>

                <div className="overflow-hidden">
                  <h4 className="text-xs font-semibold text-white truncate" title={art.name}>
                    {art.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 uppercase mt-0.5">
                    {art.file_type} &bull; {formatBytes(art.file_size)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-dark-border/60">
                {isMd && (
                  <button
                    onClick={() => handlePreview(art)}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-dark-surface hover:bg-dark-hover text-slate-200 text-xs font-medium border border-dark-border transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                )}

                <a
                  href={api.getArtifactDownloadUrl(art.id)}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-brand-primary/15 hover:bg-brand-primary/25 text-brand-primary text-xs font-medium border border-brand-primary/30 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* In-Browser Document Preview Modal */}
      {previewContent !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-dark-card border border-dark-border shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-dark-border flex items-center justify-between bg-dark-bg">
              <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>{previewTitle}</span>
              </h4>
              <button
                onClick={() => setPreviewContent(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-dark-hover"
              >
                Close
              </button>
            </div>
            <div className="p-5 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap bg-dark-sidebar/90">
              {previewContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
