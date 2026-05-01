# Elevate.ai

Elevate.ai is a resume-intelligence application with a Next.js frontend and a FastAPI backend. It analyzes a PDF resume against a target role, scores ATS readiness, pulls India-focused live jobs from JSearch, and lets the user re-target the same resume for different roles without uploading again.

The current product flow is:

1. A user uploads a PDF resume on the landing page.
2. The user selects a target role, optionally adds a job description, and selects an experience level.
3. The frontend sends the file to the FastAPI backend.
4. The backend extracts resume text, runs an AI analysis, computes ATS-style scores, and enriches the result with India-focused live job matches.
5. The frontend opens a dashboard that shows two tracks:
   - `full_time_analysis`
   - `internship_analysis`
6. The same dashboard can then:
   - re-target the parsed resume for another role
   - search JSearch for additional roles beyond the original recommendation set

The project is designed around the India hiring market by default.

## What The App Does Today

The current web app produces a structured analysis report with:

- A candidate summary
- ATS score and feedback
- Extracted skills
- Resume improvement suggestions
- Upskilling suggestions
- Experience and education evidence
- Career analytics and recommended opportunities
- Separate full-time and internship views for the same resume
- A re-target flow for a different role, level, or job description
- A live JSearch explorer for searching other roles from the dashboard

The current frontend does not upload the resume into a true background queue.
`POST /api/analyze` performs the main analysis work inside the request and returns the completed payload when done.
The task-state model, websocket endpoint, and Celery worker files exist in the repo, but they are not the primary path used by the current Next.js upload flow.

## Current End-To-End Flow

### 1. Landing page

The landing page lives in `src/app/page.tsx`.

It renders:

- A hero section
- A resume upload panel
- A target role input
- An experience level selector
- An optional job description textarea

The upload UI is handled by `useResumeUpload()` in `src/hooks/useResumeUpload.ts`.

Client-side validation currently enforces:

- PDF files only
- Maximum file size of 5 MB

### 2. Frontend submission

When the user clicks analyze:

- The selected file is added to a `FormData` payload
- `target_role` is included
- `experience_level` is included if set
- `job_description` is included if provided
- The request is sent to `POST /api/analyze`

The API client is in `src/lib/api.ts`.

### 3. Backend validation and task initialization

The backend entrypoint is `server/main.py`.

`POST /api/analyze` currently does the following:

- Reads the multipart form payload
- Validates that a PDF file is present
- Enforces the backend upload-size limit
- Applies a per-IP daily rate limit
- Hashes the resume bytes plus analysis inputs for cache lookup
- Initializes task status storage
- Returns a cached completed result if an eligible cache hit exists

### 4. Resume text extraction

If the request is not satisfied from cache, the backend extracts text from the PDF using `extract_text_with_fallback()` in `server/resume_pipeline.py`.

Extraction behavior:

- First tries `pdfplumber`
- Falls back to OCR if needed
- OCR requires the `tesseract` binary to be installed
- Rejects resumes that produce too little readable text

The backend also normalizes whitespace and enforces a minimum readable-word threshold.

### 5. AI analysis

The main analysis orchestrator is `run_resume_review()` in `server/service_logic.py`.

This function:

- Builds a Gemini prompt with India-market context
- Requests a structured JSON response
- Expects two analysis branches:
  - `full_time_analysis`
  - `internship_analysis`

Gemini calls are wrapped in `server/gemini_client.py`, which provides:

- Primary and fallback model support
- Basic retry logic for transient model/service failures
- JSON extraction from model output

### 6. Local ATS scoring

In parallel with the AI-generated summary, the backend computes local ATS-style diagnostics in `server/resume_pipeline.py`.

These scores are based on:

- Keyword coverage against the target role or job description
- Resume structure detection
- Contact details presence
- Bullet quality heuristics
- Optional semantic similarity using `sentence-transformers`

Important detail:

- The sentence-transformer model is loaded with `local_files_only=True`
- If that model is unavailable locally, the app still works
- In that case, semantic scoring falls back to a keyword-score proxy

### 7. Live market enrichment

After the dual analysis is produced, the backend builds search queries for:

- Full-time roles
- Internship roles

The live jobs feed currently comes from JSearch through RapidAPI in `server/api_clients.py`.

Current market behavior:

- Country is set from backend config
- The default region is India
- Internship queries automatically add `internship` if needed

Raw JSearch results are converted into dashboard-friendly opportunity cards by `server/career_mapper.py`.

That mapper currently adds:

- Deterministic match percentages
- Relevant skills
- Skills to develop
- Skill proficiency charts
- Location metadata
- Match rationale text

### 8. Result assembly

The final response returned to the frontend includes:

- Candidate name
- Target role
- Experience level
- Resume and job-description excerpts
- Full-time and internship queries
- Market status and market health
- Counts of live jobs found
- Market context metadata
- Timing metadata
- Quality signals
- Full-time analysis object
- Internship analysis object

### 9. Dashboard rendering

The dashboard page lives in `src/app/dashboard/[taskId]/page.tsx`.

It renders:

- Executive summary
- Score overview
- ATS intelligence
- Skill intelligence
- Resume improvement board
- Experience and education evidence
- Career analytics
- Recommended opportunities

The dashboard chooses a default track based on the experience level:

- Internship-like levels default to `internship_analysis`
- Everything else defaults to `full_time_analysis`

### 10. Re-targeting an existing analysis

The dashboard includes a re-target form in `src/components/dashboard/RetargetAnalysisPanel.tsx`.

That form sends:

- `target_role`
- `experience_level`
- `job_description`

to `POST /api/re-target/{task_id}`.

The backend reuses the previously parsed `resume_text_raw`, runs a fresh dual analysis, fetches fresh market data, stores the new payload under a new task ID, and redirects the dashboard to that new result.

### 11. Searching other roles live from the dashboard

The opportunities section includes a JSearch role explorer in `src/components/dashboard/RecommendedOpportunities.tsx`.

That UI:

- Uses the current target role and mapped career paths to suggest nearby roles
- Lets the user type a completely different query
- Calls `/fetch-jobs/`, which is an active alias for `/api/jobs/search`
- Replaces the visible opportunity cards with fresh JSearch results for that query

The backend also retries broader job queries when the first JSearch result set is empty, so role exploration is more resilient than a single exact-match search.

### 12. Persistence in the browser

Frontend analysis state is stored in `localStorage` by `ResumeAnalysisProvider` in `src/hooks/useResumeContext.tsx`.

That persisted state includes:

- `taskId`
- `analysisStatus`
- `fileName`

This lets the app show a “Resume last analysis” link on the landing page.

## Active Architecture Vs Alternate Infrastructure

This repo contains both active production flow code and alternate or legacy infrastructure.

### Active path used by the current UI

- `src/app/page.tsx`
- `src/app/dashboard/[taskId]/page.tsx`
- `src/components/dashboard/RetargetAnalysisPanel.tsx`
- `src/components/dashboard/RecommendedOpportunities.tsx`
- `src/hooks/useResumeUpload.ts`
- `src/hooks/useResumeContext.tsx`
- `src/lib/api.ts`
- `server/main.py`
- `server/service_logic.py`
- `server/resume_pipeline.py`
- `server/gemini_client.py`
- `server/api_clients.py`
- `server/career_mapper.py`
- `server/redis_store.py`

### Present in the repo, but not the main UI path today

- `WS /ws/status/{task_id}`
- `POST /analyze-resume-dual/`
- `server/analysis_runner.py`
- `server/celery_app.py`
- `server/celery_worker.py`
- `service_clients.route_resume_analysis()`

What that means in practice:

- The frontend currently uses REST polling, not websockets
- The main upload flow currently runs inline in `POST /api/analyze`
- The Celery worker path exists, but the current UI does not dispatch work to it
- The worker-oriented path can generate rewritten bullets and a tailored PDF, but that is not the main web flow today

## Repository Structure

```text
.
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout, fonts, provider, background layers
│   │   ├── page.tsx                   # Upload/landing page
│   │   └── dashboard/[taskId]/page.tsx
│   ├── components/
│   │   ├── upload/                    # Upload hero, console, processing overlay
│   │   ├── dashboard/                 # Dashboard sections and visualizations
│   │   ├── layout/                    # Navbar and top bar
│   │   ├── ui/                        # Shared cards, counters, error states
│   │   └── background/                # Grid/noise/canvas visuals
│   ├── hooks/
│   │   ├── useResumeUpload.ts         # Upload state and submit logic
│   │   └── useResumeContext.tsx       # Persisted analysis context
│   ├── lib/
│   │   ├── api.ts                     # Frontend API calls
│   │   ├── constants.ts               # File limits, processing labels, score thresholds
│   │   └── utils.ts
│   └── types/
│       └── analysis.ts                # Shared result shape used by the dashboard
├── public/
│   ├── elevate-ai.png
│   └── favicon.ico
├── server/
│   ├── main.py                        # FastAPI app and active HTTP API
│   ├── service_logic.py               # Main analysis orchestration
│   ├── resume_pipeline.py             # PDF parsing, ATS heuristics, cache helpers
│   ├── gemini_client.py               # Gemini JSON generation and retries
│   ├── api_clients.py                 # JSearch integration
│   ├── career_mapper.py               # Deterministic job-to-opportunity mapping
│   ├── redis_store.py                 # Redis or in-memory task/cache store
│   ├── service_clients.py             # Optional distributed service gateway logic
│   ├── analysis_runner.py             # Alternate worker-oriented analysis path
│   ├── celery_app.py
│   ├── celery_worker.py
│   ├── models.py
│   ├── config.py
│   ├── requirements.txt
│   └── tests/
│       ├── test_api_endpoints.py
│       ├── test_career_mapper.py
│       └── test_service_logic.py
├── package.json
├── tailwind.config.ts
├── next.config.mjs
└── railway.toml
```

## Frontend Architecture

### App shell

`src/app/layout.tsx` sets up:

- Global fonts
- The `ResumeAnalysisProvider`
- The preloader
- Grid and noise background layers

### Upload page

`src/app/page.tsx` is the main entry screen.

It currently manages:

- Experience level state
- Job description state
- Upload component wiring
- Navigation to the analysis dashboard after the backend returns

### Dashboard page

`src/app/dashboard/[taskId]/page.tsx`:

- Loads the analysis payload by `taskId`
- Polls the status endpoint every 1.5 seconds while a task is queued/processing
- Selects full-time or internship track
- Renders the dashboard sections

In the current upload flow, `POST /api/analyze` usually returns only after analysis is complete, so polling is most relevant when:

- The user refreshes or reopens a dashboard URL
- An alternate task path stores a non-complete state

### State management

This project does not use Redux, Zustand, or a backend database for user sessions.

Frontend state is handled with:

- React state
- React context
- `localStorage`

## Backend Architecture

### `server/main.py`

This is the main FastAPI application.

It provides:

- Request validation handling
- Error response formatting
- Upload analysis route
- Result fetch route
- Retarget route
- Jobs route
- Health route
- Websocket status route
- Root status route

### `server/service_logic.py`

This is the main analysis orchestrator for the active path.

It is responsible for:

- Prompt creation
- Gemini analysis orchestration
- Dual-track result normalization
- Query generation for jobs
- Live market enrichment
- Final payload assembly

### `server/resume_pipeline.py`

This module contains most of the local backend intelligence that does not depend on the LLM.

It handles:

- PDF parsing and OCR fallback
- Resume quality validation
- Rate limiting
- Task-state updates
- Cache hashing
- Resume structure scoring
- Keyword extraction
- ATS feedback generation
- ATS improvement generation
- Cache eligibility rules

### `server/gemini_client.py`

This module wraps Gemini calls and provides:

- JSON-only generation expectations
- Retry rules for transient errors
- Fallback model support

### `server/api_clients.py`

This module integrates with JSearch and is responsible for:

- Building RapidAPI requests
- Applying the configured market country
- Returning either job data or structured HTTP errors

### `server/career_mapper.py`

This module maps raw jobs into opportunity cards for the dashboard.

It currently scores jobs using:

- Query-to-title overlap
- Query-to-description overlap
- India location hints
- Remote bonus
- Job recency bonus
- Employment-type hints

### `server/redis_store.py`

This module provides:

- Redis-backed task storage
- Redis-backed result caching
- In-memory fallback storage when Redis is unavailable

There is no SQL database in the current project.

## API Surface

| Endpoint | Method | Used by current UI | Purpose |
| --- | --- | --- | --- |
| `/api/analyze` | `POST` | Yes | Upload resume and run the main analysis flow |
| `/api/analysis/{task_id}` | `GET` | Yes | Fetch the latest task/result payload |
| `/fetch-jobs/` | `POST` | Yes | Search additional jobs from the dashboard |
| `/api/jobs/search` | `POST` | Yes, via alias and direct backend compatibility | Alias for jobs search |
| `/health` | `GET` | No | Service health and runtime mode |
| `/api/health` | `GET` | No | Alias for health |
| `/api/re-target/{task_id}` | `POST` | Yes | Re-run analysis with a new target role/job description |
| `/ws/status/{task_id}` | `WS` | No | Push task-status updates over websocket |
| `/api/download/{task_id}` | `GET` | No | Download a generated PDF from the worker-oriented path |
| `/analyze-resume-dual/` | `POST` | No | Legacy sync-style dual analysis route |
| `/` | `GET` | No | Root status payload |

## Caching, State, And Rate Limits

### Cache behavior

The backend caches results by hashing:

- Resume file bytes
- Job description
- Target role
- Experience level

A result is only considered cacheable if:

- The live job market feed did not fail
- At least one job was returned across both tracks

### Task state

Task state is still stored even though the main request currently runs inline.

Task payloads include:

- `queued`
- `processing`
- `completed`
- `failed`

### Rate limiting

The backend currently enforces a per-IP daily rate limit, except for localhost and test clients.

## Environment Variables

There are no checked-in `.env.example` files in the current repo, so create the env files manually.

### Frontend

Create `.env.local` in the repo root:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### Backend

Create `server/.env`:

```bash
GEMINI_API_KEY=your_gemini_key
RAPIDAPI_KEY=your_rapidapi_key
```

Common optional backend settings:

- `GEMINI_MODEL`
- `GEMINI_FALLBACK_MODELS`
- `GEMINI_MAX_RETRIES`
- `GEMINI_RETRY_BACKOFF_SECONDS`
- `SENTRY_DSN`
- `PUBLIC_BACKEND_URL`
- `RESULT_TTL_SECONDS`
- `CACHE_TTL_SECONDS`
- `UPLOAD_BLOB_TTL_SECONDS`
- `RATE_LIMIT_ENABLED`
- `RATE_LIMIT_PER_DAY`
- `MAX_UPLOAD_SIZE_BYTES`
- `MINIMUM_RESUME_WORDS`
- `SENTENCE_MODEL_NAME`
- `MARKET_COUNTRY_CODE`
- `MARKET_REGION_NAME`
- `MARKET_TIMEZONE`
- `MARKET_CURRENCY`
- `GENERATED_RESUME_DIR`
- `UPSTASH_REDIS_URL`
- `UPSTASH_REDIS_HOST`
- `UPSTASH_REDIS_PORT`
- `UPSTASH_REDIS_PASSWORD`
- `ANALYSIS_SERVICE_URL`
- `JOBS_SERVICE_URL`
- `ALLOW_LOCAL_FALLBACK`
- `SERVICE_TIMEOUT_SECONDS`

Current defaults make the backend India-first:

- `MARKET_COUNTRY_CODE=in`
- `MARKET_REGION_NAME=India`
- `MARKET_TIMEZONE=Asia/Kolkata`
- `MARKET_CURRENCY=INR`

## Local Development

### Prerequisites

- Node.js 18+ recommended
- Python 3.11+ recommended
- A Gemini API key
- A RapidAPI key for JSearch
- `tesseract` installed if you want OCR fallback for scanned PDFs

### Install frontend dependencies

```bash
npm ci
```

### Create and install the backend environment

```bash
cd server
python3 -m venv venv
venv/bin/python -m pip install -r requirements.txt
cd ..
```

### Run the backend

```bash
cd server
venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Run the frontend

```bash
npm run dev
```

Open `http://localhost:3000`.

### Optional combined dev command

You can also run:

```bash
npm run dev:all
```

Important:

- `npm run dev:all` uses `python3 -m uvicorn`
- It assumes your Python environment is already activated or otherwise available on `PATH`

## Scripts

### Frontend / root scripts

- `npm run dev` - start the Next.js frontend
- `npm run dev:frontend` - same as `dev`
- `npm run dev:backend` - start FastAPI from the root package script
- `npm run dev:all` - run frontend and backend together
- `npm run build` - production Next.js build
- `npm run start` - start the built Next.js app
- `npm run lint` - Next.js lint task

## Testing And Verification

The repository now has both helper-level tests and API smoke tests.

Current automated coverage includes:

- Deterministic job mapping for JSearch results
- India-aware market labeling and scoring behavior
- Search query generation and soft-skill filtering
- `POST /api/analyze` request handling with target-role preservation
- `POST /api/re-target/{task_id}` request handling with reuse of parsed resume text
- `/fetch-jobs/` and `/api/jobs/search` route coverage
- `/api/health` response-shape coverage

Run backend tests with:

```bash
cd server
venv/bin/python -m unittest discover -s tests -v
```

Frontend checks:

```bash
npm run lint
npm run build
```

### Live audit snapshot

On May 1, 2026, the app was audited in this repo with both local and live checks.

Verified locally:

- `npm run lint`
- `npm run build`
- `cd server && venv/bin/python -m unittest discover -s tests -v`

Verified live with configured external dependencies:

- Direct JSearch reachability test returned live India-market job data
- Direct Gemini reachability test returned the expected dual-analysis JSON keys
- `POST /api/analyze` completed successfully against a generated PDF resume
- `POST /api/re-target/{task_id}` completed successfully for a different role
- `POST /api/jobs/search` returned live results for an alternate query
- `GET /api/health` returned the expected India market context

What that means:

- Resume upload and analysis are working
- Re-targeting is working
- Live job enrichment is working
- Searching for different roles from the dashboard is working

## Current Limitations And Important Notes

- The main UI path is inline request/response, not a fully backgrounded queue workflow
- `POST /api/analyze` and `POST /api/re-target/{task_id}` can take noticeable time because they perform parsing, Gemini analysis, ATS scoring, and JSearch enrichment before returning
- The frontend polls REST status; it does not use the websocket endpoint
- The main web flow does not currently surface rewritten bullets or generated PDF downloads
- The project has no authentication, user accounts, or persistent relational database
- CORS is currently configured as `allow_origins=['*']`
- PDF support is limited to files the parser or OCR can read
- If the semantic model is unavailable locally, the app falls back to simpler ATS scoring behavior
- Live opportunity quality depends on JSearch availability and the supplied API key
- Live analysis also depends on Gemini availability and the supplied API key

## Deployment Notes

- `railway.toml` is configured for backend deployment from the `server/` directory
- The frontend is a standard Next.js application and can be deployed separately

## Short Summary

If you want the shortest accurate description of the project:

Elevate.ai is a Next.js + FastAPI resume intelligence app that accepts a PDF resume, extracts text, runs a dual-track Gemini analysis for full-time and internship positioning, computes ATS-style diagnostics locally, enriches the result with India-focused JSearch opportunities, and renders everything in a dashboard backed by Redis-or-memory task state and cache helpers.
