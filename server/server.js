const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const API_TOKEN = process.env.PLAG_API_KEY;
const GROUP_TOKEN = process.env.PLAG_GROUP_TOKEN;
const AUTHOR_EMAIL = process.env.PLAG_AUTHOR_EMAIL;
const BASE_URL = 'https://plagiarismcheck.org/api/v1';
const ORG_BASE_URL = 'https://plagiarismcheck.org/api/org';


app.post('/api/plagiarism/submit', upload.single('file'), async (req, res) => {
  try {
    if (!API_TOKEN) {
      return res.status(500).json({ 
        success: false, 
        error: 'API token not configured on server' 
      });
    }

    const { text, language = 'en', useOrgApi = false } = req.body;
    const file = req.file;

    if (!text && !file) {
      return res.status(400).json({
        success: false,
        error: 'Either text or file must be provided'
      });
    }

    if (text && text.length < 80) {
      return res.status(400).json({
        success: false,
        error: 'Text must be at least 80 characters long'
      });
    }

    console.log('Submitting for plagiarism check:', {
      hasText: !!text,
      hasFile: !!file,
      textLength: text ? text.length : 0,
      fileName: file ? file.originalname : null,
      useOrgApi
    });

    let response;

    if (useOrgApi && GROUP_TOKEN && AUTHOR_EMAIL) {
      const formData = new FormData();
      formData.append('group_token', GROUP_TOKEN);
      formData.append('author', AUTHOR_EMAIL);
      
      if (file) {
        formData.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype
        });
      } else {
        formData.append('text', text);
      }

      response = await axios.post(`${ORG_BASE_URL}/text/check/`, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
    } else {
      if (file) {
        return res.status(400).json({
          success: false,
          error: 'File upload not supported with single-user API. Please extract text first or configure organization API.'
        });
      }

      const formData = new URLSearchParams();
      formData.append('text', text);
      formData.append('language', language);

      response = await axios.post(`${BASE_URL}/text`, formData, {
        headers: {
          'X-API-TOKEN': API_TOKEN,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    }

    console.log('Plagiarism API submission successful:', {
      id: response.data.data?.text?.id,
      state: response.data.data?.text?.state
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Plagiarism submit error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    res.status(error.response?.status || 500).json({ 
      success: false, 
      error: error.response?.data?.error || error.message || 'Failed to submit for plagiarism check' 
    });
  }
});



app.get('/api/plagiarism/status/:id', async (req, res) => {
  try {
    if (!API_TOKEN) {
      return res.status(500).json({ 
        success: false, 
        error: 'API token not configured on server' 
      });
    }

    const { id } = req.params;
    const { useOrgApi = false, maxRetries = 5, delay = 2000 } = req.query;
    
    console.log(`Checking plagiarism status for ID: ${id}, useOrgApi: ${useOrgApi}`);
    
    if (id.length < 6 || id.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format. Please use the original text ID from the submission response, not the report ID.'
      });
    }

    let retries = 0;
    let lastError = null;

    while (retries < maxRetries) {
      try {
        if (useOrgApi && GROUP_TOKEN) {
          const formData = new URLSearchParams();
          formData.append('group_token', GROUP_TOKEN);

          const response = await axios.post(`${ORG_BASE_URL}/text/status/${id}/`, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });

          return res.json({
            success: true,
            data: {
              status: response.data?.status || 'unknown',
              report_id: response.data?.report?.id || null,
              text_id: id,
              ...response.data
            }
          });
        } else {
          const textInfo = await axios.get(`${BASE_URL}/text/${id}`, {
            headers: { 'X-API-TOKEN': API_TOKEN }
          });

          const state = textInfo.data.data?.state;
          const raw = textInfo.data.data;

          const reportId = raw?.report_id || raw?.report?.id || null;

          console.log('Text info:', {
            state,
            report_id: reportId,
            text_id: id
          });

          if (state === 3 || state === 5) {
            return res.json({
              success: true,
              data: {
                status: 'completed',
                report_id: reportId,
                text_id: id,
                use_this_id_for_report: id,
                do_not_use_report_id_for_api_calls: true,
                message: 'Report ready. Use the text_id (not report_id) to fetch the report.',
                ...raw
              }
            });
          }

          if (state < 3) {
            return res.json({
              success: true,
              data: {
                status: 'processing',
                report_id: null,
                text_id: id,
                ...raw
              }
            });
          }
        }

        break;
      } catch (error) {
        lastError = error;
        retries++;
        console.warn(`Status check attempt ${retries} failed:`, error.message);
        if (retries < maxRetries) await sleep(delay);
      }
    }

    throw lastError;
    } catch (error) {
      console.error('Plagiarism status check failed:', {
        textId: req.params.id,
        message: error.message,
        response: error.response?.data,
        statusCode: error.response?.status,
        stack: error.stack
      });
      
      if (error.response?.status === 403) {
        res.status(403).json({ 
          success: false, 
          error: 'Access denied. Make sure you are using the correct TEXT ID from the original submission response, not the report ID. If you submitted text and got ID 27330175, use that ID for status checks.' 
        });
      } else {
        res.status(error.response?.status || 500).json({ 
          success: false, 
          error: error.response?.data?.error || error.message || 'Failed to check plagiarism status' 
        });
      }
    }
});

app.get('/api/plagiarism/report/:id', async (req, res) => {
  try {
    if (!API_TOKEN) {
      return res.status(500).json({ 
        success: false, 
        error: 'API token not configured on server' 
      });
    }

    const { id } = req.params;
    const { useOrgApi = false } = req.query;
    
    console.log(`Fetching report for TEXT ID: ${id}, useOrgApi: ${useOrgApi}`);
    
    if (id.length < 6 || id.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format. Please use the original text ID (not report ID) from the submission response.'
      });
    }

    let response;

    if (useOrgApi && GROUP_TOKEN) {
      const formData = new URLSearchParams();
      formData.append('group_token', GROUP_TOKEN);

      response = await axios.post(`${ORG_BASE_URL}/text/report/${id}/`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    } else {
      response = await axios.get(`${BASE_URL}/text/report/${id}`, {
        headers: {
          'X-API-TOKEN': API_TOKEN
        }
      });
    }

    console.log('Report fetched successfully for TEXT ID:', id);
    res.json(response.data);
  } catch (error) {
    console.error('Plagiarism report fetch failed:', {
      textId: req.params.id,
      message: error.message,
      response: error.response?.data,
      statusCode: error.response?.status,
      stack: error.stack
    });
    
    if (error.response?.status === 403) {
      res.status(403).json({ 
        success: false, 
        error: 'Access denied. Make sure you are using the correct TEXT ID (not report ID) from the original submission response.' 
      });
    } else {
      res.status(error.response?.status || 500).json({ 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to get plagiarism report' 
      });
    }
  }
});

app.post('/api/ai/submit', upload.single('file'), async (req, res) => {
  try {
    if (!API_TOKEN) {
      return res.status(500).json({ 
        success: false, 
        error: 'API token not configured on server' 
      });
    }

    const { text, group_id } = req.body;
    const file = req.file;

    if (!text && !file) {
      return res.status(400).json({
        success: false,
        error: 'Either text or file must be provided'
      });
    }

    if (text && text.length < 80) {
      return res.status(400).json({
        success: false,
        error: 'Text must be at least 80 characters long'
      });
    }

    console.log('Submitting for AI detection:', {
      hasText: !!text,
      hasFile: !!file,
      textLength: text ? text.length : 0,
      fileName: file ? file.originalname : null
    });

    const formData = new FormData();
    
    if (file) {
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });
    } else {
      formData.append('text', text);
    }

    if (group_id) {
      formData.append('group_id', group_id);
    }

    const response = await axios.post(`${BASE_URL}/chat-gpt/`, formData, {
      headers: {
        'X-API-TOKEN': API_TOKEN,
        ...formData.getHeaders()
      }
    });

    console.log('AI detection submission successful:', {
      id: response.data.data?.id,
      status: response.data.data?.status
    });

    res.json(response.data);
  } catch (error) {
    console.error('AI detection submit error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    res.status(error.response?.status || 500).json({ 
      success: false, 
      error: error.response?.data?.error || error.message || 'Failed to submit for AI detection' 
    });
  }
});

app.get('/api/ai/status/:id', async (req, res) => {
  try {
    if (!API_TOKEN) {
      return res.status(500).json({ 
        success: false, 
        error: 'API token not configured on server' 
      });
    }

    const { id } = req.params;
    
    console.log(`Checking AI detection status for ID: ${id}`);

    const response = await axios.get(`${BASE_URL}/chat-gpt/${id}`, {
      headers: {
        'X-API-TOKEN': API_TOKEN
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('AI detection status check failed:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    res.status(error.response?.status || 500).json({ 
      success: false, 
      error: error.response?.data?.error || error.message || 'Failed to check AI detection status' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});