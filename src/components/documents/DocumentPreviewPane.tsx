import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Download, FileSpreadsheet, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import * as docxPreview from 'docx-preview';

interface DocumentPreviewPaneProps {
  documentName: string;
  documentType: 'PDF' | 'Document' | 'Spreadsheet';
  status: 'Draft' | 'In Review' | 'Signed';
  signatureImg?: string;
  fileUrl?: string;
  onSign: (signature: string) => void;
  onSubmitForReview?: () => void;
  onDecline?: () => void;
  onClose?: () => void;
  className?: string;
}

// ─── File type helpers ────────────────────────────────────────────────────────
function detectFileKind(name: string, url?: string) {
  const n = name.toLowerCase();
  const u = (url ?? '').toLowerCase();
  if (n.endsWith('.pdf') || u.includes('.pdf') || u.includes('dummy.pdf') || u.includes('sample.pdf')) return 'pdf';
  if (n.match(/\.(jpg|jpeg|png|gif|webp|svg)$/) || u.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/) || u.includes('unsplash')) return 'image';
  if (n.match(/\.(docx|doc)$/) || u.includes('.docx') || u.includes('.doc')) return 'office-word';
  if (n.match(/\.(xlsx|xls|csv)$/) || u.includes('.xlsx') || u.includes('.xls') || u.includes('fwlink')) return 'office-excel';
  return 'unknown';
}

// ─── Client-side DOCX renderer (for blob/local files) ───────────────────────
const DocxLocalPreview: React.FC<{ fileUrl: string; zoom: number }> = ({ fileUrl, zoom }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    setLoading(true);
    setError(null);

    fetch(fileUrl)
      .then((res) => res.blob())
      .then((blob) => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = '';
        return docxPreview.renderAsync(blob, containerRef.current, undefined, {
          className: 'docx-preview-root',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          useBase64URL: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
        });
      })
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('docx-preview error:', err);
        setError('Could not render this document. Try downloading it.');
        setLoading(false);
      });
  }, [fileUrl]);

  return (
    <div className="relative w-full h-full overflow-auto bg-gray-100">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10 gap-3">
          <Loader2 size={28} className="animate-spin text-primary-400" />
          <p className="text-xs text-gray-400 font-medium">Rendering document…</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-6 gap-3">
          <AlertCircle size={32} className="text-amber-400" />
          <p className="text-sm font-semibold text-gray-700 text-center">{error}</p>
        </div>
      )}
      {/* docx-preview renders pages inside this div */}
      <div
        ref={containerRef}
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}
        className="docx-preview-wrapper"
      />
    </div>
  );
};

// ─── Subcomponent: actual content renderer ───────────────────────────────────
const FilePreviewContent: React.FC<{
  fileUrl: string;
  documentName: string;
  kind: string;
  zoom: number;
  onSubmitForReview?: () => void;
}> = ({ fileUrl, documentName, kind, zoom, onSubmitForReview }) => {
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  const isPublicUrl = fileUrl.startsWith('http') && !fileUrl.includes('localhost') && !fileUrl.startsWith('blob:');
  const isBlob = fileUrl.startsWith('blob:');

  // ── PDF ──────────────────────────────────────────────────────────────────
  if (kind === 'pdf') {
    // Use object tag for better cross-browser PDF support
    return (
      <div className="w-full h-full flex flex-col" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}>
        <object
          data={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
          type="application/pdf"
          className="w-full border-none"
          style={{ height: '100%', minHeight: '100%' }}
          onLoad={() => setLoading(false)}
        >
          {/* Fallback for browsers that block object-PDF (e.g. Firefox private mode) */}
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            className="w-full h-full border-none"
            title={documentName}
            onLoad={() => setLoading(false)}
            onError={() => setLoadError(true)}
          />
        </object>
      </div>
    );
  }

  // ── Image ────────────────────────────────────────────────────────────────
  if (kind === 'image') {
    return (
      <div className="w-full h-full flex items-start justify-center overflow-auto bg-gray-800 p-4">
        <img
          src={fileUrl}
          alt={documentName}
          className="rounded shadow-2xl object-contain"
          style={{
            maxWidth: `${100 * zoom}%`,
            height: 'auto',
            transition: 'max-width 0.15s ease',
          }}
          onError={() => setLoadError(true)}
        />
      </div>
    );
  }

  // ── Office (public URLs via Microsoft Office Online viewer) ───────────────
  if ((kind === 'office-word' || kind === 'office-excel') && isPublicUrl) {
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    return (
      <div className="relative w-full h-full flex flex-col">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3">
            <Loader2 size={32} className="animate-spin text-primary-400" />
            <p className="text-xs text-gray-400 font-medium">Loading document…</p>
          </div>
        )}
        <iframe
          src={viewerUrl}
          className="w-full flex-1 border-none"
          title={documentName}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setLoadError(true); }}
        />
        {loadError && (
          <OfficeErrorFallback fileUrl={fileUrl} documentName={documentName} onSubmitForReview={onSubmitForReview} />
        )}
      </div>
    );
  }

  // ── Office WORD blob (local upload) — render inline with docx-preview ────
  if (kind === 'office-word' && isBlob) {
    return <DocxLocalPreview fileUrl={fileUrl} zoom={zoom} />;
  }

  // ── Office Excel blob or any unknown local office file ───────────────────
  if (kind === 'office-word' || kind === 'office-excel') {
    const isExcel = kind === 'office-excel';
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="w-full max-w-xs bg-white border border-gray-200 shadow-2xl rounded-2xl p-7 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-sm ${isExcel ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
            }`}>
            {isExcel ? <FileSpreadsheet size={32} /> : <FileText size={32} />}
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1 break-all px-1">{documentName}</h3>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Preview unavailable — the Office viewer could not load this file.
          </p>
          <div className="flex flex-col w-full gap-3">
            <a
              href={fileUrl}
              download={documentName}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download to View
            </a>
            {onSubmitForReview && (
              <button
                onClick={onSubmitForReview}
                className="text-[10px] font-bold text-gray-400 hover:text-primary-600 transition-colors uppercase tracking-widest"
              >
                Mark as Reviewed
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Unknown ──────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-10 bg-gray-50">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <FileText size={32} className="text-gray-300" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-600">Preview Not Available</p>
        <p className="text-xs text-gray-400 mt-1">{documentName}</p>
      </div>
      <a
        href={fileUrl}
        download={documentName}
        className="mt-2 px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors"
      >
        Download File
      </a>
    </div>
  );
};

// Small helper for Office iframe fallback
const OfficeErrorFallback: React.FC<{
  fileUrl: string;
  documentName: string;
  onSubmitForReview?: () => void;
}> = ({ fileUrl, documentName, onSubmitForReview }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-6 gap-4">
    <AlertCircle size={36} className="text-amber-400" />
    <div className="text-center max-w-xs">
      <p className="text-sm font-semibold text-gray-700">Office viewer unavailable</p>
      <p className="text-xs text-gray-400 mt-1">Microsoft Office Online couldn't load this file. Download it to open locally.</p>
    </div>
    <a
      href={fileUrl}
      download={documentName}
      className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2"
    >
      <Download size={15} />
      Download File
    </a>
    {onSubmitForReview && (
      <button
        onClick={onSubmitForReview}
        className="text-[10px] font-bold text-gray-400 hover:text-primary-600 transition-colors uppercase tracking-widest"
      >
        Mark as Reviewed
      </button>
    )}
  </div>
);

// ─── Mock document (no fileUrl) ───────────────────────────────────────────────
const MockDocumentView: React.FC<{ documentName: string; signatureImg?: string }> = ({
  documentName,
  signatureImg,
}) => (
  <div className="w-full h-full overflow-y-auto bg-gray-100 flex items-start justify-center p-6">
    <div
      className="bg-white border border-gray-200 shadow-2xl rounded-sm p-8 sm:p-10 flex flex-col space-y-6 relative w-full"
      style={{ maxWidth: '420px', minHeight: '560px' }}
    >
      {/* Header */}
      <div className="border-b-4 border-primary-600 pb-5">
        <h2 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-wider">
          {documentName.replace(/_/g, ' ').split('.')[0]}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-1.5 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded border border-gray-200 uppercase">Official Copy</span>
          <p className="text-[10px] text-gray-400 font-mono">Ref: NEX-DOC-{Math.floor(Math.random() * 9000) + 1000}</p>
        </div>
      </div>

      {/* Body */}
      {[
        { title: '1. AGREEMENT OVERVIEW', body: 'This binding agreement sets forth the terms for the collaboration between Nexus and the undersigned representative. It establishes a framework for operational excellence and mutual accountability.' },
        { title: '2. OBLIGATIONS & CONFIDENTIALITY', body: 'The recipient acknowledges the sensitive nature of the information shared and agrees to maintain strict confidentiality. All shared assets remain the property of the provider.' },
        { title: '3. DIGITAL AUTHENTICATION', body: 'By applying a digital signature, the party confirms they have the legal authority to enter this agreement. The signature is timestamped and cryptographically secured.' },
      ].map(({ title, body }) => (
        <div key={title} className="space-y-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
            {title}
          </h3>
          <p className="text-[11px] text-gray-700 leading-relaxed font-medium">{body}</p>
        </div>
      ))}

      {/* Signature row */}
      <div className="mt-auto pt-8 border-t-2 border-gray-100 grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50 pb-1">Authorized Issuer</p>
          <div className="h-16 bg-gray-50 rounded flex flex-col items-center justify-center border border-gray-200">
            <span className="italic text-gray-500 font-serif text-[12px] opacity-60">Verified Admin</span>
            <span className="text-[8px] text-gray-400 font-mono mt-1">ID: #SYS-VER-02</span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest border-b-2 border-primary-50 pb-1">Recipient Sign</p>
          <div className="h-16 border-2 border-dashed border-primary-200 rounded flex items-center justify-center bg-primary-50/30 overflow-hidden">
            {signatureImg ? (
              <img src={signatureImg} alt="Signature" className="h-full w-auto object-contain p-2 mix-blend-multiply" />
            ) : (
              <span className="text-[9px] font-black text-primary-300 uppercase">Draw in Pad Below</span>
            )}
          </div>
        </div>
      </div>

      {/* Watermark seal */}
      <div className="absolute bottom-32 right-10 opacity-[0.03] pointer-events-none -rotate-12 select-none">
        <div className="w-24 h-24 border-8 border-gray-900 rounded-full flex items-center justify-center font-black text-[10px] text-center uppercase p-2 leading-none">
          Nexus Global Verified Document Seal
        </div>
      </div>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const DocumentPreviewPane: React.FC<DocumentPreviewPaneProps> = ({
  documentName,
  documentType: _documentType,
  status,
  signatureImg,
  fileUrl,
  onSign,
  onSubmitForReview,
  onDecline,
  onClose,
  className = '',
}) => {
  const [zoom, setZoom] = useState(1);
  const kind = fileUrl ? detectFileKind(documentName, fileUrl) : 'none';

  const canZoom = kind === 'pdf' || kind === 'image' || kind === 'office-word';

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));

  return (
    <div className={`flex flex-col bg-white rounded-xl overflow-hidden h-full ${className}`} style={{ minHeight: 0 }}>
      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50 gap-2">
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
          {/* File type pill */}
          <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${kind === 'pdf' ? 'bg-red-100 text-red-600'
            : kind === 'image' ? 'bg-purple-100 text-purple-600'
              : kind === 'office-excel' ? 'bg-green-100 text-green-700'
                : kind === 'office-word' ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
            }`}>
            {kind === 'pdf' ? 'PDF'
              : kind === 'image' ? 'IMG'
                : kind === 'office-excel' ? 'XLSX'
                  : kind === 'office-word' ? 'DOCX'
                    : 'FILE'}
          </span>
          <span className="font-semibold text-sm text-gray-800 truncate">{documentName}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {canZoom && (
            <>
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30"
                aria-label="Zoom out"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-[10px] font-mono text-gray-400 w-8 text-center select-none">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 2.5}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30"
                aria-label="Zoom in"
              >
                <ZoomIn size={15} />
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
            </>
          )}
          {fileUrl && (
            <a
              href={fileUrl}
              download={documentName}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Download"
              title="Download file"
            >
              <Download size={15} />
            </a>
          )}
          {onClose && (
            <>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded text-gray-400 transition-colors"
                aria-label="Close preview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Preview Body ── */}
      {/*
        IMPORTANT: this div must be `flex-1 min-h-0 overflow-hidden` so that
        flex children (iframes, images) can fill the remaining height correctly.
        Without `min-h-0`, flex items can overflow their container.
      */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {fileUrl ? (
          <div className="w-full h-full overflow-hidden relative">
            <FilePreviewContent
              fileUrl={fileUrl}
              documentName={documentName}
              kind={kind}
              zoom={zoom}
              onSubmitForReview={onSubmitForReview}
            />
            {/* Signature Overlay for real files */}
            {status === 'Signed' && signatureImg && (
              <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm border-2 border-primary-600 rounded-lg p-2 shadow-2xl animate-fade-in pointer-events-none select-none rotate-[-4deg] z-20 max-w-[140px]">
                <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest border-b border-primary-100 pb-0.5 mb-1">Digital Signature</p>
                <img src={signatureImg} alt="Signature" className="h-10 w-auto object-contain mix-blend-multiply mx-auto" />
                <div className="mt-1 text-[7px] font-mono text-gray-400 text-center uppercase">Verified Nexus Auth</div>
              </div>
            )}
          </div>
        ) : (
          <MockDocumentView documentName={documentName} signatureImg={signatureImg} />
        )}
      </div>

      {/* ── Footer: action zone based on status ── */}
      {status === 'Draft' && (
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 shrink-0 text-center">
          <p className="text-xs text-gray-500 font-medium mb-3">
            This document is a draft. Submit for review to enable signing.
          </p>
          <button
            onClick={onSubmitForReview}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
            Send for Review
          </button>
        </div>
      )}

      {status === 'In Review' && (
        <div className="px-5 py-4 border-t border-gray-200 bg-white shrink-0 animate-slide-in">
          <SignaturePad onConfirm={onSign} onDecline={onDecline} />
        </div>
      )}

      {status === 'Signed' && (
        <div className="px-5 py-4 border-t border-gray-100 bg-green-50 shrink-0 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-9 h-9 bg-green-100 text-green-600 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h3 className="text-sm font-bold text-green-800">Verified &amp; Signed</h3>
          <p className="text-xs text-green-600 mt-1">This document has been digitally signed and is legally binding.</p>
        </div>
      )}
    </div>
  );
};
