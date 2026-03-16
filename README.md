# Run and deploy your AI Studio app
# Elevate AI - AI-Powered Career Co-Pilot

Elevate AI is an intelligent career analysis platform that leverages Google's Gemini AI to provide personalized career insights and recommendations based on your resume. Upload your resume and get comprehensive feedback on career paths, skill gaps, and actionable improvement suggestions.

## 🚀 Features

### Resume Analysis
- **Smart Upload**: Drag-and-drop or click to upload PDF and TXT resume files
- **AI-Powered Parsing**: Uses Google Gemini AI to extract and analyze resume content
- **Comprehensive Evaluation**: Analyzes skills, experience, education, and career trajectory

### Career Insights
- **ATS Score**: Get an Applicant Tracking System compatibility score with actionable feedback
- **Skill Extraction**: Automatically identifies technical and soft skills from your resume
- **Career Path Recommendations**: Discover 10-12 relevant career opportunities based on your profile
- **Match Percentage**: See how well your current profile matches different career paths

### Deep Dive Analysis
- **Relevant Skills**: Identifies skills from your resume that are valuable for each career path
- **Skills to Develop**: Highlights crucial skills missing from your profile for each role
- **Skill Proficiency Radar**: Visual representation of your skill levels vs. industry requirements
- **Interactive Charts**: Dynamic bar charts and radar charts for easy data visualization

### Actionable Recommendations
- **Resume Improvements**: Get specific tips to enhance your resume content and structure
- **Upskilling Suggestions**: Receive personalized learning recommendations and resources
- **Experience & Education Summary**: Clean, organized breakdown of your professional background

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth UI transitions
- **Charts**: Recharts for data visualization
- **File Handling**: React Dropzone for file uploads
- **AI Integration**: Google Gemini AI API
- **Build Tool**: Vite
- **Routing**: React Router DOM

## 🧩 Scalable Backend Architecture

The backend is now split into an API gateway plus independently scalable services:

- **API Gateway** (`server/main.py`): Exposes stable public endpoints used by the frontend (`/analyze-resume-dual/`, `/fetch-jobs/`), handles routing, and reports distributed health.
- **Analysis Service** (`server/services/analysis_service.py`): Handles PDF parsing + Gemini dual analysis.
- **Jobs Service** (`server/services/jobs_service.py`): Handles external job search + adaptation into the frontend career-path schema.
- **Shared Service Logic** (`server/service_logic.py`): Reusable logic so local fallback and service mode stay behavior-compatible.

### Service Routing Configuration

Set these environment variables on the gateway to route traffic to distributed services:

- `ANALYSIS_SERVICE_URL` (example: `http://localhost:8010`)
- `JOBS_SERVICE_URL` (example: `http://localhost:8020`)
- `ALLOW_LOCAL_FALLBACK=true|false` (default: `true`)

If service URLs are not provided, the gateway runs in local fallback mode.

### Run in Distributed Mode (Local)

Start each process in a separate terminal:

1. Analysis service:
```bash
cd server
uvicorn services.analysis_service:app --host 0.0.0.0 --port 8010 --reload
```

2. Jobs service:
```bash
cd server
uvicorn services.jobs_service:app --host 0.0.0.0 --port 8020 --reload
```

3. API gateway (connected to services):
```bash
cd server
ANALYSIS_SERVICE_URL=http://localhost:8010 JOBS_SERVICE_URL=http://localhost:8020 uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Gateway health endpoint:

- `GET /health` returns mode (`distributed` or `local-fallback`) and per-service status/latency.

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/KaivalyaJoglekar/elevate.ai.git
cd elevate.ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add your Google Gemini API key:
```env
API_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 🎯 How to Use

1. **Upload Resume**: Visit the homepage and upload your resume (PDF or TXT format, max 2MB)
2. **AI Analysis**: Click "Start Analysis" and wait for the AI to process your resume
3. **View Results**: Review your ATS score, extracted skills, and career path recommendations
4. **Explore Career Paths**: Use the dropdown to explore different career opportunities
5. **Check Skill Gaps**: View the radar chart to understand your skill proficiency vs. requirements
6. **Get Recommendations**: Read actionable tips for resume improvements and upskilling

## 🏗️ Project Structure

```
elevate-ai/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ATSMeter.tsx    # ATS score display
│   │   ├── BarGraph.tsx    # Career compatibility chart
│   │   ├── DeepDiveSection.tsx # Detailed career analysis
│   │   ├── RadarChartComponent.tsx # Skill proficiency radar
│   │   └── ...
│   ├── pages/              # Main application pages
│   │   ├── Upload.tsx      # Resume upload page
│   │   └── Analysis.tsx    # Results analysis page
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API integration
│   ├── utils/              # Utility functions
│   └── types.ts           # TypeScript type definitions
├── public/                 # Static assets
└── package.json
```

## 🎨 Key Components

- **Upload Page**: Clean, intuitive interface for resume upload with drag-and-drop functionality
- **Analysis Dashboard**: Comprehensive results page with multiple data visualization components
- **ATS Score Card**: Visual meter showing resume optimization score
- **Career Path Charts**: Interactive bar charts showing career compatibility
- **Skill Radar**: Multi-dimensional skill analysis with proficiency mapping
- **Tips Panels**: Actionable recommendations for improvement

## 🔧 Configuration

The application uses several configuration constants:
- Maximum file size: 2MB
- Supported formats: PDF, TXT
- AI Model: Gemini 2.5 Flash Preview
- Response format: Structured JSON

## 🌟 Features in Detail

### ATS Optimization
The AI analyzes your resume for Applicant Tracking System compatibility, checking for:
- Keyword optimization
- Formatting structure
- Content organization
- Industry-standard terminology

### Career Matching Algorithm
Uses advanced AI analysis to:
- Compare your skills against job requirements
- Calculate compatibility percentages
- Identify transferable skills
- Suggest growth opportunities

### Skill Gap Analysis
Visual radar charts display:
- Your current proficiency levels
- Industry-required proficiency levels
- Gap analysis for skill development
- Prioritized learning recommendations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Made with ❤️ by **Kaivalya Joglekar**

---

*Elevate your career with AI-powered insights!*
This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
