  # Plagiarism Detection App

A full-stack plagiarism detection application built with React and Node.js/Express, integrated with the [plagiarismcheck.org](https://plagiarismcheck.org/) API.

## Features

- Text plagiarism detection using plagiarismcheck.org API
- Modern React frontend with responsive design
- Express.js backend API
- Real-time plagiarism checking


## Technology Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express.js
- **API:** plagiarismcheck.org

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- plagiarismcheck.org API key

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/praveengamini/PlagiarismChecker
cd PlagiarismChecker
```

### 2. Setup Client (Frontend)

```bash
cd client
npm install
```

### 3. Setup Server (Backend)

```bash
cd server
npm install
```

### 4. Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
PLAG_API_KEY=your_plagiarism_api_key_here
PORT=5000
PLAG_GROUP_TOKEN=your_group_token_here (optional)
PLAG_AUTHOR_EMAIL=your_email@example.com (optional)
```

**Required:**
- `PLAG_API_KEY`: Your plagiarismcheck.org API key (required)
- `PORT`: Server port (default: 5000)

**Optional:**
- `PLAG_GROUP_TOKEN`: Group token for team accounts
- `PLAG_AUTHOR_EMAIL`: Author email for API requests

## Getting Your API Key

1. Visit [plagiarismcheck.org](https://plagiarismcheck.org/)
2. Create an account or sign in
3. Navigate to your profile
4. Generate API key it will be automatically copied
5. Add it to your `.env` file

## Running the Application

### Development Mode

**Start the Backend Server:**
```bash
cd server
npm run dev
```

**Start the Frontend Client:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173` (or the port shown in terminal)
- Backend: `http://localhost:5000`


## API Usage

The backend provides endpoints for:
- `POST /api/check-plagiarism` - Submit text for plagiarism checking
- `GET /api/results/:id` - Get plagiarism check results
- `GET /api/status/:id` - Check processing status

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## Support

For issues related to:
- **API**: Visit [plagiarismcheck.org support](https://plagiarismcheck.org/support)
- **Application**: Create an issue in this repository

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify your API key is correct
   - Check if your account has sufficient pages
   - Ensure the API key is properly set in the `.env` file

2. **Connection Issues**
   - Verify both client and server are running
   - Check if ports are available (default: 5173 for client, 5000 for server)

3. **Environment Variables**
   - Make sure the `.env` file is in the `server` directory
   - Restart the server after modifying environment variables
   - Check for typos in variable names
