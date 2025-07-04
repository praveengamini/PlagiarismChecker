import React from 'react';
import { FileText, X, Copy, Download } from 'lucide-react';

const TextDialog = ({ showDialog, setShowDialog, text, handleCopyText, copySuccess, downloadText }) => {
  if (!showDialog || !text) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-700">
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Text Content
          </h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              {text.length.toLocaleString()} characters
            </span>
            <button
              onClick={handleCopyText}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
            >
              <Copy className="h-4 w-4 mr-1" />
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={downloadText}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </button>
            <button
              onClick={() => setShowDialog(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextDialog;