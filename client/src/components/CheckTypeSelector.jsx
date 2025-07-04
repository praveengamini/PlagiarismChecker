import React from 'react';

const CheckTypeSelector = ({ checkType, setCheckType, useOrgApi, setUseOrgApi, setText, setFile, setError }) => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Select Check Type</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setCheckType('plagiarism')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              checkType === 'plagiarism'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Plagiarism Check
          </button>
          <button
            onClick={() => setCheckType('ai')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              checkType === 'ai'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            AI Detection
          </button>
        </div>
      </div>

      {checkType === 'plagiarism' && (
        <div className="mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <label className="flex items-center text-white cursor-pointer">
              <input
                type="checkbox"
                checked={useOrgApi}
                onChange={(e) => {
                  setUseOrgApi(e.target.checked);
                  setText('');
                  setFile(null);
                  setError(null);
                }}
                className="mr-3 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium">Use Organization API</span>
                <p className="text-sm text-gray-300 mt-1">
                  {useOrgApi 
                    ? 'File upload enabled - Upload documents directly for checking' 
                    : 'Text input only - Paste text for checking'}
                </p>
              </div>
            </label>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckTypeSelector;