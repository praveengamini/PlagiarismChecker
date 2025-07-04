import React, { useState, useEffect } from 'react';
import { Copy, FileText, Download, Eye, EyeOff, X, Maximize2, Upload, AlertCircle, Loader2, Send, FileCheck, Info } from 'lucide-react';
import CheckTypeSelector from './components/CheckTypeSelector';
import TextInputSection from './components/TextInputSection';
import ReportSection from './components/ReportSection';
import SubmissionHistory from './components/SubmissionHistory';
import TextDialog from './components/TextDialog';

const App = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [checkType, setCheckType] = useState('plagiarism');
  const [status, setStatus] = useState('');
  const [showFullText, setShowFullText] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [useOrgApi, setUseOrgApi] = useState(false);
  const [textId, setTextId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [storedSubmissions, setStoredSubmissions] = useState({});
  const [submissionData, setSubmissionData] = useState(null);

  const BACKEND_URL = 'http://localhost:5000';
  const saveToStorage = (id, data) => {
    const newSubmissions = { ...storedSubmissions, [id]: data };
    setStoredSubmissions(newSubmissions);
  };

  const loadFromStorage = (id) => {
    return storedSubmissions[id];
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ['txt', 'doc', 'docx', 'pdf', 'odt', 'rtf', 'odp', 'pptx', 'ppt'];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      const errorMsg = `Unsupported file type. Supported formats: ${allowedTypes.join(', ')}`;
      setError(errorMsg);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadText = () => {
    const element = document.createElement('a');
    const blob = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(blob);
    element.download = `extracted_text_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSubmit = async () => {
    const safeText = typeof text === 'string' ? text.trim() : '';
    if (!useOrgApi && !safeText) {
      setError('Please enter text to check');
      return;
    }

    if (!useOrgApi && text.length < 80) {
      setError('Text must be at least 80 characters long');
      return;
    }
    if (useOrgApi && !file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('Submitting for checking...');

    try {
      const endpoint = checkType === 'plagiarism' ? '/api/plagiarism/submit' : '/api/ai/submit';
      const url = `${BACKEND_URL}${endpoint}`;

      const formData = new FormData();

      if (useOrgApi && file) {
        formData.append('file', file);
        if (checkType === 'plagiarism') {
          formData.append('useOrgApi', useOrgApi.toString());
        }
      } else {
        formData.append('text', text);
        if (checkType === 'plagiarism') {
          formData.append('language', 'en');
          formData.append('useOrgApi', useOrgApi.toString());
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setSubmissionData(data);
        
        const submissionId = checkType === 'plagiarism' 
          ? data.data.text?.id || data.data.id
          : data.data.id;
        
        if (!submissionId) {
          throw new Error('Failed to get submission ID from server');
        }

        const submissionIdString = String(submissionId);

        const submissionDataToStore = {
          id: submissionIdString,
          checkType,
          useOrgApi,
          text: useOrgApi ? null : text,
          fileName: file ? file.name : null,
          submittedAt: new Date().toISOString(),
          status: 'submitted',
          fullResponse: data
        };

        saveToStorage(submissionIdString, submissionDataToStore);
        setTextId(submissionIdString);
        setIsSubmitted(true);
        setStatus(`Submission successful! Your text ID is: ${submissionIdString}`);
      } else {
        throw new Error(data.error || 'Failed to submit for checking');
      }
    } catch (error) {
      setError(error.message || 'An error occurred during submission');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleGetReport = async () => {
    const textIdString = String(textId || '').trim();
    if (!textIdString) {
      setError('Please enter a valid text ID');
      return;
    }

    const storedData = loadFromStorage(textIdString);
    const checkTypeToUse = storedData?.checkType || checkType;
    const useOrgApiToUse = storedData?.useOrgApi || useOrgApi;

    setReportLoading(true);
    setError(null);
    setResults(null);
    setStatus('Checking status and retrieving report...');

    try {
      const statusEndpoint =
        checkTypeToUse === 'plagiarism'
          ? `/api/plagiarism/status/${textIdString}`
          : `/api/ai/status/${textIdString}`;
      const statusUrl = `${BACKEND_URL}${statusEndpoint}${
        checkTypeToUse === 'plagiarism' && useOrgApiToUse ? '?useOrgApi=true' : ''
      }`;

      const statusResponse = await fetch(statusUrl);
      const statusData = await statusResponse.json();

      if (!statusResponse.ok) {
        throw new Error(statusData.error || `HTTP error! status: ${statusResponse.status}`);
      }

      const responseData = statusData.data;
      let isComplete = false;

      if (checkTypeToUse === 'plagiarism') {
        if (useOrgApiToUse) {
          isComplete = responseData.state === 5 || responseData.status === 'completed';
        } else {
          isComplete = responseData.state === 3 || responseData.state === 5;
        }
      } else {
        isComplete = responseData.status === 4;
      }

      if (!isComplete) {
        throw new Error('Report is not ready yet. Please wait a moment and try again.');
      }

      const reportEndpoint =
        checkTypeToUse === 'plagiarism'
          ? `/api/plagiarism/report/${textIdString}`
          : `/api/ai/report/${textIdString}`;

      const reportUrl = `${BACKEND_URL}${reportEndpoint}${
        checkTypeToUse === 'plagiarism' && useOrgApiToUse ? '?useOrgApi=true' : ''
      }`;

      const reportResponse = await fetch(reportUrl);
      const reportData = await reportResponse.json();

      if (!reportResponse.ok) {
        throw new Error(reportData.error || `HTTP error! status: ${reportResponse.status}`);
      }

      const report = reportData.data;
      setResults(report);
      setStatus('Report retrieved successfully!');
      setCheckType(checkTypeToUse);

      if (storedData) {
        saveToStorage(textIdString, { ...storedData, status: 'completed', report });
      }
    } catch (error) {
      setError(error.message || 'An error occurred while retrieving the report');
      setStatus('');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Plagiarism & AI Detection Tool
          </h1>
          
          <CheckTypeSelector 
            checkType={checkType} 
            setCheckType={setCheckType} 
            useOrgApi={useOrgApi} 
            setUseOrgApi={setUseOrgApi}
            setText={setText}
            setFile={setFile}
            setError={setError}
          />



          <TextInputSection 
            text={text}
            setText={setText}
            file={file}
            handleFileChange={handleFileChange}
            handleRemoveFile={handleRemoveFile}
            useOrgApi={useOrgApi}
            showFullText={showFullText}
            setShowFullText={setShowFullText}
            handleCopyText={handleCopyText}
            copySuccess={copySuccess}
            downloadText={downloadText}
            setShowDialog={setShowDialog}
            checkType={checkType}
          />

          {error && (
            <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          {status && (
            <div className="mb-6 p-4 bg-blue-900 border border-blue-700 rounded-lg">
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 text-blue-400 mr-2 animate-spin" />
                <span className="text-blue-300">{status}</span>
              </div>
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={handleSubmit}
              disabled={loading || (!text && !file)}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                loading || (!text && !file)
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : checkType === 'plagiarism'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send className="h-5 w-5 mr-2" />
                  {useOrgApi ? 'Submit File' : `Submit ${checkType === 'plagiarism' ? 'Plagiarism' : 'AI'} Check`}
                </div>
              )}
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Get Report</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-white font-medium mb-2">
                  Text ID (from submission)
                </label>
                <input
                  type="text"
                  value={textId}
                  onChange={(e) => setTextId(e.target.value)}
                  placeholder="Enter text ID from submission"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleGetReport}
                  disabled={reportLoading || !textId.trim()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    reportLoading || !textId.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {reportLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Getting Report...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Get Report
                    </div>
                  )}
                </button>
              </div>
            </div>
            
            {isSubmitted && (
              <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded-lg">
                <div className="flex items-center">
                  <FileCheck className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-green-300">
                    Submission successful! Your text ID is: <strong>{textId}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          <ReportSection results={results} checkType={checkType} />

          <SubmissionHistory 
            storedSubmissions={storedSubmissions} 
            setTextId={setTextId}
            setCheckType={setCheckType}
            setUseOrgApi={setUseOrgApi}
          />
        </div>
      </div>

      <TextDialog 
        showDialog={showDialog} 
        setShowDialog={setShowDialog} 
        text={text} 
        handleCopyText={handleCopyText} 
        copySuccess={copySuccess} 
        downloadText={downloadText}
      />
    </div>
  );
};

export default App;