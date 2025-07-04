import React from 'react';
import { FileText, Upload, X, Copy, Download, Maximize2, Eye, EyeOff } from 'lucide-react';

const TextInputSection = ({
  text, setText, file, handleFileChange, handleRemoveFile, useOrgApi,
  showFullText, setShowFullText, handleCopyText, copySuccess, downloadText,
  setShowDialog, checkType
}) => {
  const renderTextPreview = () => {
    if (!text || useOrgApi) return null;

    const displayText = showFullText ? text : text.substring(0, 500);
    const isTruncated = text.length > 500;

    return (
      <div className="mt-4 border border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Text Preview
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">
                {text.length.toLocaleString()} characters
              </span>
              {isTruncated && (
                <button
                  onClick={() => setShowFullText(!showFullText)}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                >
                  {showFullText ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {showFullText ? 'Show Less' : 'Show All'}
                </button>
              )}
              <button
                onClick={handleCopyText}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                title="Copy text"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadText}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                title="Download text"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
              <button
                onClick={() => setShowDialog(true)}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                title="View in full screen"
              >
                <Maximize2 className="h-4 w-4 mr-1" />
                Full Screen
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-900">
          <div className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed max-h-96 overflow-y-auto">
            {displayText}
            {isTruncated && !showFullText && (
              <span className="text-blue-400 cursor-pointer ml-2" onClick={() => setShowFullText(true)}>
                ... (click to show more)
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {!useOrgApi && (
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            Enter Text to Check (minimum 80 characters)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here..."
            className="w-full h-40 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-2 text-sm text-gray-400">
            Characters: {text.length} / 80 minimum
          </div>
        </div>
      )}

      {useOrgApi && (
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            Upload File (Organization API)
          </label>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept=".txt,.doc,.docx,.pdf,.odt,.rtf,.odp,.pptx,.ppt"
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-400 hover:text-blue-300 flex flex-col items-center"
            >
              <Upload className="h-8 w-8 mb-2" />
              <span className="text-sm">Click to upload file</span>
              <span className="text-xs text-gray-400 mt-1">
                Supported: TXT, DOC, DOCX, PDF, ODT, RTF, ODP, PPTX, PPT
              </span>
            </label>
          </div>
          
          {file && (
            <div className="mt-4 flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-white">{file.name}</span>
                <span className="text-gray-400 ml-2">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {renderTextPreview()}
    </>
  );
};

export default TextInputSection;