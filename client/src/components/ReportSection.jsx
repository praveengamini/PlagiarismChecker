import React from 'react';
import { FileText } from 'lucide-react';

const ReportSection = ({ results, checkType }) => {
  if (!results) return null;

  if (checkType === 'plagiarism') {
    const plagiarismPercent = results.report?.percent || results.percent || 0;
    return (
      <div className="bg-gray-900 p-6 rounded-lg shadow-md border-l-4 border-blue-400">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
          <FileText className="mr-2 h-5 w-5 text-blue-400" />
          Plagiarism Check Results
        </h3>
        <div className="mb-4">
          <div className="text-3xl font-bold text-white">
            {plagiarismPercent}% Plagiarism Detected
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 mt-2">
            <div 
              className="bg-blue-400 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${plagiarismPercent}%` }}
            ></div>
          </div>
        </div>
        
        {(results.report_data?.sources || results.sources) && (results.report_data?.sources || results.sources).length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3 text-white">Sources Found ({(results.report_data?.sources || results.sources).length}):</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {(results.report_data?.sources || results.sources).map((source, index) => (
                <div key={index} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-white">{source.percent}% match</span>
                    <span className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">
                      {source.content_type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-400 hover:text-blue-300 underline break-all">
                      {source.url}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } else {
    const aiPercent = results.percent || 0;
    return (
      <div className="bg-gray-900 p-6 rounded-lg shadow-md border-l-4 border-purple-400">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
          <FileText className="mr-2 h-5 w-5 text-purple-400" />
          AI Detection Results
        </h3>
        <div className="mb-4">
          <div className="text-3xl font-bold text-white">
            {aiPercent}% AI Content Detected
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 mt-2">
            <div 
              className="bg-purple-400 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${aiPercent}%` }}
            ></div>
          </div>
        </div>
        
        {results.chunks && results.chunks.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3 text-white">AI Detected Sections ({results.chunks.length}):</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {results.chunks.map((chunk, index) => (
                <div key={index} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">
                      Reliability: {chunk.reliability}
                    </span>
                    <span className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">
                      Pos: {chunk.position.start} - {chunk.position.end}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {results.comment && (
          <div className="mt-6">
            <h4 className="font-medium mb-2 text-white">Analysis:</h4>
            <p className="text-gray-300 bg-gray-800 p-3 rounded-lg border border-gray-700">{results.comment}</p>
          </div>
        )}
      </div>
    );
  }
};

export default ReportSection;