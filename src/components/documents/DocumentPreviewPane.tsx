import React from 'react';
import { ZoomIn, Download, Edit2, FileSpreadsheet, FileText } from 'lucide-react';
import { SignaturePad } from './SignaturePad';

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

export const DocumentPreviewPane: React.FC<DocumentPreviewPaneProps> = ({
  documentName,
  documentType,
  status,
  signatureImg,
  fileUrl,
  onSign,
  onSubmitForReview,
  onDecline,
  onClose,
  className = ''
}) => {
  return (
    <div className={`flex flex-col bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden h-full ${className}`}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
        <div className="flex items-center gap-2 overflow-hidden pr-4">
          <span className="font-semibold text-sm text-gray-900 truncate">Preview: {documentName}</span>
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-400 transition-colors" aria-label="Zoom in">
              <ZoomIn size={16} />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-400 transition-colors" aria-label="Download">
              <Download size={16} />
            </button>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded text-gray-400 transition-colors"
              aria-label="Close preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Visual Document Mock or Real File Preview */}
      <div className="bg-gray-200 p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto selection:bg-primary-100 flex flex-col items-center">
        {fileUrl ? (
          <div className="w-full max-w-4xl h-full min-h-[500px] bg-white border-2 border-gray-300 shadow-2xl rounded-sm overflow-hidden flex flex-col">
            <div className="bg-gray-800 p-2 flex items-center justify-between text-white shrink-0">
              <span className="text-xs font-mono truncate px-2">{documentName}</span>
              <div className="flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500"></div>
                 <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="flex-1 bg-gray-600">
              {/* Robust detection for different file types */}
              {fileUrl && (documentType === 'PDF' || 
                documentName.toLowerCase().endsWith('.pdf') || 
                fileUrl.toLowerCase().includes('pdf') ||
                fileUrl.startsWith('blob:')) ? (
                <iframe 
                  src={fileUrl} 
                  className="w-full h-full border-none bg-white" 
                  title={documentName}
                />
              ) : fileUrl && (
                documentName.toLowerCase().match(/\.(jpg|jpeg|jgp|png|gif|webp)$/i) || 
                fileUrl.match(/\.(jpg|jpeg|jgp|png|gif|webp)$/i) || 
                fileUrl.includes('unsplash')
              ) ? (
                <div className="w-full h-full flex items-center justify-center p-4 bg-gray-700">
                  <img src={fileUrl} alt={documentName} className="max-w-full max-h-full object-contain shadow-2xl bg-white p-2 rounded-sm" />
                </div>
              ) : fileUrl && (
                documentName.toLowerCase().match(/\.(docx|doc|xlsx|xls)$/i)
              ) ? (
                /* Use Office Online Viewer for public URLs, otherwise show high-quality placeholder */
                fileUrl.startsWith('http') ? (
                  <iframe 
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                    className="w-full h-full border-none bg-white font-sans"
                    title={documentName}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-10 overflow-hidden">
                    <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-xl p-8 flex flex-col items-center text-center animate-fade-in">
                       <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${
                         documentName.toLowerCase().includes('xlsx') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                       }`}>
                          {documentName.toLowerCase().includes('xlsx') ? <FileSpreadsheet size={40} /> : <FileText size={40} />}
                       </div>
                       <h3 className="text-xl font-bold text-gray-900 mb-2 truncate w-full px-4">{documentName}</h3>
                       <p className="text-sm text-gray-500 mb-8 px-4 leading-relaxed">
                         Office Online prevents direct preview of local files for security. <br/>
                         Please download the file to view its full content.
                       </p>
                       <div className="flex flex-col w-full gap-3">
                         <a 
                           href={fileUrl} 
                           download={documentName} 
                           className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2"
                         >
                           <Download size={18} />
                           Download & View
                         </a>
                         <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-2">Document Authentication Verified</p>
                       </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                   <Download size={48} />
                   <p className="text-sm text-center">Preview not available for this file type. <br/> <span className="text-xs">Format: {documentType}</span></p>
                   {fileUrl && <a href={fileUrl} download={documentName} className="px-6 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-primary-700 transition-colors uppercase">Download to View</a>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div 
            className="bg-white border-2 border-gray-300 shadow-2xl rounded-sm p-6 sm:p-10 flex flex-col space-y-6 relative h-fit"
            style={{ width: '100%', maxWidth: '400px', minHeight: '560px' }}
          >
            {/* Header Section */}
            <div className="border-b-4 border-primary-600 pb-5 mb-2">
              <h2 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-wider">
                {documentName.replace(/_/g, ' ').split('.')[0]}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                 <span className="px-1.5 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded border border-gray-200 uppercase">Official Copy</span>
                 <p className="text-[10px] text-gray-400 font-mono">Ref: NEX-DOC-{Math.floor(Math.random() * 9000) + 1000}</p>
              </div>
            </div>
            
            {/* Content Body */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                 1. AGREEMENT OVERVIEW
              </h3>
              <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
                This binding agreement sets forth the terms for the collaboration between Nexus and the undersigned representative. It establishes a framework for operational excellence and mutual accountability.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                 2. OBLIGATIONS & CONFIDENTIALITY
              </h3>
              <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
                The recipient acknowledges the sensitive nature of the information shared and agrees to maintain strict confidentiality. All shared assets remain the property of the provider.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                 3. DIGITAL AUTHENTICATION
              </h3>
              <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
                By applying a digital signature, the party confirms they have the legal authority to enter this agreement. The signature is timestamped and cryptographically secured.
              </p>
            </div>

            {/* Signature Area Mock */}
            <div className="mt-auto pt-10 border-t-2 border-gray-100 grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50 pb-1">Authorized Issuer</p>
                <div className="h-16 bg-gray-50 rounded flex flex-col items-center justify-center border border-gray-200">
                  <span className="italic text-gray-500 font-serif text-[12px] opacity-60">Verified Admin</span>
                  <span className="text-[8px] text-gray-400 font-mono mt-1">ID: #SYS-VER-02</span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest border-b-2 border-primary-50 pb-1">Recipient Sign</p>
                <div className="h-16 border-2 border-dashed border-primary-200 rounded flex items-center justify-center bg-primary-50/30 overflow-hidden relative group transition-all duration-300">
                  {signatureImg ? (
                    <img src={signatureImg} alt="Signature" className="h-full w-auto object-contain p-2 mix-blend-multiply animate-fade-in" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Edit2 size={20} className="text-primary-300 group-hover:text-primary-500 transition-colors" />
                      <span className="text-[9px] font-black text-primary-400 uppercase">Draw Here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Certified Seal Placeholder */}
            <div className="absolute bottom-32 right-12 opacity-[0.03] pointer-events-none -rotate-12 select-none">
               <div className="w-24 h-24 border-8 border-gray-900 rounded-full flex items-center justify-center font-black text-[10px] text-center uppercase p-2 leading-none">
                  Nexus Global Verified Document Seal
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer (Signature Pad) */}
      {status === 'In Review' && (
        <div className="p-5 border-t border-gray-200 bg-white shrink-0 animate-slide-in">
          <SignaturePad onConfirm={onSign} onDecline={onDecline} />
        </div>
      )}

      {status === 'Signed' && (
        <div className="p-6 border-t border-gray-200 bg-green-50 shrink-0 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full mb-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 className="text-sm font-bold text-green-800">Verified & Signed</h3>
          <p className="text-xs text-green-600 mt-1 max-w-[240px] mx-auto">
            This document has been digitally signed and is now legally binding.
          </p>
        </div>
      )}

      {status === 'Draft' && (
        <div className="p-5 border-t border-gray-200 bg-gray-50 shrink-0 text-center">
          <p className="text-xs text-gray-500 font-medium mb-4">
            This document is a draft.<br/>Submit for review to enable signing.
          </p>
          <button 
            onClick={onSubmitForReview}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            Send for Review
          </button>
        </div>
      )}
    </div>
  );
};
