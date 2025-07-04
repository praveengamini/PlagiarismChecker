import React from 'react';

const SubmissionHistory = ({ storedSubmissions, setTextId, setCheckType, setUseOrgApi }) => {
  if (Object.keys(storedSubmissions).length === 0) return null;

  return (
    <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-3">Recent Submissions</h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {Object.values(storedSubmissions).map((submission, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                submission.checkType === 'plagiarism' ? 'bg-blue-400' : 'bg-purple-400'
              }`}></div>
              <span className="text-white font-medium">{submission.id}</span>
              <span className="text-gray-300 text-sm">
                {submission.checkType === 'plagiarism' ? 'Plagiarism' : 'AI'} Check
              </span>
              <span className="text-gray-400 text-xs">
                {new Date(submission.submittedAt).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => {
                setTextId(submission.id);
                setCheckType(submission.checkType);
                setUseOrgApi(submission.useOrgApi || false);
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Load
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmissionHistory;