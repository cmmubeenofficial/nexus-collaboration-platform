import React, { useState, useCallback, useRef } from 'react';
import {
  Search, Upload,
  FileText, File, FileSpreadsheet, FilePlus, X
} from 'lucide-react';
import { DocumentPreviewPane } from '../../components/documents/DocumentPreviewPane';

// --- Types ---
type DocStatus = 'Signed' | 'In Review' | 'Draft';
type DocType = 'PDF' | 'Document' | 'Spreadsheet';
type TabFilter = 'All Documents' | 'Drafts' | 'In Review' | 'Signed';

interface DocumentItem {
  id: number;
  name: string;
  type: DocType;
  status: DocStatus;
  lastModified: string;
  size: string;
  signatureImg?: string;
  fileUrl?: string;
}

// --- Icon helper (matches Stitch design: red for PDF, blue for DOCX, gray for drafts) ---
const getDocIcon = (type: DocType, status: DocStatus) => {
  if (type === 'PDF') {
    return (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status === 'Signed' ? 'bg-red-50' : status === 'In Review' ? 'bg-blue-50' : 'bg-gray-100'}`}>
        <FileText size={18} className={status === 'Signed' ? 'text-red-500' : status === 'In Review' ? 'text-blue-500' : 'text-gray-400'} />
      </div>
    );
  }
  if (type === 'Document') {
    return (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status === 'In Review' ? 'bg-blue-50' : status === 'Draft' ? 'bg-gray-100' : 'bg-green-50'}`}>
        <File size={18} className={status === 'In Review' ? 'text-blue-500' : status === 'Draft' ? 'text-gray-400' : 'text-green-600'} />
      </div>
    );
  }
  if (type === 'Spreadsheet') {
    return (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50">
        <FileSpreadsheet size={18} className="text-green-600" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
      <File size={18} className="text-gray-400" />
    </div>
  );
};

// --- Initial data ---
const initialDocuments: DocumentItem[] = [
  {
    id: 1,
    name: 'Partnership_Agreement_2024.pdf',
    type: 'PDF',
    status: 'Signed',
    lastModified: '2 hours ago',
    size: '1.2 MB',
    // ✅ This URL serves PDFs with Content-Disposition: inline (no download trigger)
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 2,
    name: 'Project_Nexus_Brief.jpg',
    type: 'Document',
    status: 'In Review',
    lastModified: 'Yesterday, 4:20 PM',
    size: '840 KB',
    fileUrl: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 3,
    name: 'Contract_Template_v2.docx',
    type: 'Document',
    status: 'Draft',
    lastModified: 'Oct 24, 2023',
    size: '450 KB',
    // ✅ Public URL — Office Online Viewer will handle this
    fileUrl: 'https://calibre-ebook.com/downloads/demos/demo.docx'
  },
  {
    id: 4,
    name: 'Financial_Projections_Q3.xlsx',
    type: 'Spreadsheet',
    status: 'Signed',
    lastModified: 'Sep 15, 2023',
    size: '3.1 MB',
    // ✅ Public URL — Office Online Viewer will handle this
    fileUrl: 'https://go.microsoft.com/fwlink/?LinkID=521962'
  },
  {
    id: 5,
    name: 'Service_Agreement_Draft.pdf',
    type: 'PDF',
    status: 'In Review',
    lastModified: '3 days ago',
    size: '2.4 MB',
    fileUrl: 'https://www.africau.edu/images/default/sample.pdf'
  },
  {
    id: 6,
    name: 'Employee_NDA_v2.docx',
    type: 'Document',
    status: 'Draft',
    lastModified: '1 week ago',
    size: '680 KB',
    // No fileUrl — will show the document mock placeholder
  },
];

// --- Component ---
export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [activeTab, setActiveTab] = useState<TabFilter>('All Documents');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem>(documents[0]);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- Filter documents by tab + search --
  const filteredDocs = documents.filter(doc => {
    const matchesTab =
      activeTab === 'All Documents' ||
      (activeTab === 'Drafts' && doc.status === 'Draft') ||
      (activeTab === 'In Review' && doc.status === 'In Review') ||
      (activeTab === 'Signed' && doc.status === 'Signed');

    const matchesSearch = searchQuery.trim() === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // -- Status badge (using colors that exist in Tailwind defaults + project config) --
  const getStatusBadge = (status: DocStatus) => {
    switch (status) {
      case 'Signed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Signed
          </span>
        );
      case 'In Review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            In Review
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  // -- Action button per status --
  const getActionLabel = (status: DocStatus) => {
    if (status === 'Signed') return 'View';
    if (status === 'In Review') return 'Review';
    return 'Edit';
  };

  // -- Handle document selection --
  const handleSelectDoc = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setShowMobilePreview(true);
  };

  // -- Handle Review --
  const handleReview = useCallback(() => {
    setDocuments(prev =>
      prev.map(d =>
        d.id === selectedDoc.id ? { ...d, status: 'In Review' as DocStatus, lastModified: 'Just now' } : d
      )
    );
    setSelectedDoc(prev => ({ ...prev, status: 'In Review' as DocStatus, lastModified: 'Just now' }));
  }, [selectedDoc.id]);

  // -- Handle sign --
  const handleSign = useCallback((signature: string) => {
    console.log('Document signed with:', signature);
    setDocuments(prev =>
      prev.map(d =>
        d.id === selectedDoc.id ? { ...d, status: 'Signed' as DocStatus, lastModified: 'Just now', signatureImg: signature } : d
      )
    );
    setSelectedDoc(prev => ({ ...prev, status: 'Signed' as DocStatus, lastModified: 'Just now', signatureImg: signature }));
  }, [selectedDoc.id]);

  // -- File upload helpers --
  const getFileType = (fileName: string): DocType => {
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) return 'Spreadsheet';
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return 'Document';
    return 'PDF';
  };

  const handleFiles = useCallback((files: FileList) => {
    const newDocs: DocumentItem[] = Array.from(files).map((file, i) => ({
      id: Date.now() + i,
      name: file.name,
      type: getFileType(file.name),
      status: 'Draft' as DocStatus,
      lastModified: 'Just now',
      size: file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`,
      fileUrl: URL.createObjectURL(file),
    }));
    setDocuments(prev => [...newDocs, ...prev]);
    if (newDocs.length > 0) {
      setSelectedDoc(newDocs[0]);
      setShowMobilePreview(true);
    }
  }, []);

  // -- Drag and drop handlers --
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  // -- Stats --
  const pendingCount = documents.filter(d => d.status === 'In Review').length;
  const completedCount = documents.filter(d => d.status === 'Signed').length;
  const draftCount = documents.filter(d => d.status === 'Draft').length;

  return (
    <div className="space-y-6 animate-fade-in relative pb-10">
      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-500 text-sm mt-1">Review, sign, and manage your enterprise agreements.</p>
        </div>
        <button
          onClick={handleUploadClick}
          className="flex justify-center items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-primary-600">{String(pendingCount).padStart(2, '0')}</p>
          <p className="text-xs font-semibold text-gray-500 uppercase mt-1">In Review</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-green-600">{String(completedCount).padStart(2, '0')}</p>
          <p className="text-xs font-semibold text-gray-500 uppercase mt-1">Signed</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-gray-400">{String(draftCount).padStart(2, '0')}</p>
          <p className="text-xs font-semibold text-gray-500 uppercase mt-1">Drafts</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: List */}
        <div className="flex-1 flex flex-col min-w-0 gap-6 w-full">
          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-shadow text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 md:gap-1 md:border-b md:border-gray-200" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {(['All Documents', 'Drafts', 'In Review', 'Signed'] as TabFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap text-sm font-semibold transition-colors shrink-0
                  px-4 py-2 rounded-full border
                  md:rounded-none md:border-0 md:border-b-2 md:py-2.5
                  ${activeTab === tab
                    ? 'bg-primary-600 text-white border-primary-600 md:bg-transparent md:text-primary-700 md:border-b-primary-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 md:bg-transparent md:border-b-transparent md:hover:text-gray-700 md:hover:border-b-gray-300'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Document Name</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Modified</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => handleSelectDoc(doc)}
                      className={`cursor-pointer transition-colors group ${
                        selectedDoc.id === doc.id
                          ? 'bg-primary-50 border-l-[3px] border-l-primary-600'
                          : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {getDocIcon(doc.type, doc.status)}
                          <span className={`text-sm font-semibold truncate ${selectedDoc.id === doc.id ? 'text-primary-900' : 'text-gray-900'}`}>
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 hidden sm:table-cell whitespace-nowrap">
                        {doc.lastModified}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          className="text-primary-600 text-sm font-semibold hover:text-primary-700 hover:underline transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleSelectDoc(doc); }}
                        >
                          {getActionLabel(doc.status)}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-16 text-center text-gray-400">
                        <FileText size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No documents found in this category.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary-400 bg-primary-50 scale-[1.01]'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border mb-3 transition-transform ${
              isDragging ? 'bg-primary-100 border-primary-300 text-primary-600 scale-110' : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}>
              <FilePlus size={24} />
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1 text-center">
              {isDragging ? 'Drop files now' : 'Click or drag documents to upload'}
            </p>
            <p className="text-xs text-gray-400 text-center">PDF, DOCX, XLSX up to 50MB</p>
          </div>
        </div>

        {/* Right Column: Preview Pane (Desktop) */}
        <div className="hidden lg:flex flex-col w-[400px] xl:w-[440px] shrink-0 sticky top-6 self-start h-[calc(100vh-140px)] min-h-[600px] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {selectedDoc ? (
             <DocumentPreviewPane
                key={selectedDoc.id}
                documentName={selectedDoc.name}
                documentType={selectedDoc.type}
                status={selectedDoc.status}
                signatureImg={selectedDoc.signatureImg}
                onSign={handleSign}
                onSubmitForReview={handleReview}
                fileUrl={selectedDoc.fileUrl}
             />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <FilePlus size={48} className="mb-4 opacity-10" />
              <p className="text-sm font-medium">Select a document to view its details and sign.</p>
            </div>
          )}
        </div>

        {/* Mobile Preview Modal/Overlay */}
        {showMobilePreview && selectedDoc && (
          <div className="lg:hidden fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div 
              className="absolute inset-0" 
              onClick={() => setShowMobilePreview(false)}
            />
            <div className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden h-[90vh] sm:h-[80vh] flex flex-col animate-slide-in">
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => setShowMobilePreview(false)}
                  className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <DocumentPreviewPane
                  key={selectedDoc.id}
                  documentName={selectedDoc.name}
                  documentType={selectedDoc.type}
                  status={selectedDoc.status}
                  signatureImg={selectedDoc.signatureImg}
                  onSign={handleSign}
                  onSubmitForReview={handleReview}
                  fileUrl={selectedDoc.fileUrl}
                  onClose={() => setShowMobilePreview(false)}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};