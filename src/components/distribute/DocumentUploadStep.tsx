import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, X, AlertCircle } from 'lucide-react';

interface DocumentUploadStepProps {
  selectedFile?: File | null;
  fileMeta: {
    name: string;
    size: string;
    type: string;
    classification: string;
  } | null;
  onFileSelect: (file: File, meta: { name: string; size: string; type: string; classification: string }) => void;
  onFileRemove: () => void;
}

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  fileMeta,
  onFileSelect,
  onFileRemove
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrorMessage(null);

    if (rejectedFiles.length > 0) {
      setErrorMessage('Invalid file format. Only PDF, DOCX, and XLSX files are permitted.');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';

      onFileSelect(file, {
        name: file.name,
        size: `${sizeMB} MB`,
        type: ext,
        classification: 'Classified'
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between h-full shadow-sm">
      <div>
        {/* Step Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-blue-50 text-[#2563EB] font-bold text-xs flex items-center justify-center border border-blue-200">
            1
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-[#0F172A] uppercase">
              DOCUMENT
            </h3>
            <p className="text-[11px] text-slate-500">
              Select the file to distribute
            </p>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
            isDragActive
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
          role="button"
          tabIndex={0}
          aria-label="Upload document file drop zone"
        >
          <input {...getInputProps()} />
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 mb-2 shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800">
            {isDragActive ? 'Drop file to upload' : 'Drag and drop file here'}
          </p>
          <p className="text-[10.5px] text-slate-400 mt-0.5">
            or click to browse
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-2.5 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Selected File Chip */}
        {fileMeta && (
          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0 text-red-600 font-bold text-xs">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {fileMeta.name}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 font-mono">
                  <span>{fileMeta.size}</span>
                  <span>•</span>
                  <span>{fileMeta.type}</span>
                  <span>•</span>
                  <span className="text-amber-700 font-semibold">{fileMeta.classification}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onFileRemove}
              aria-label="Remove selected document"
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadStep;
