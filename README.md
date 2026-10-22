# HomeFix AI — AI-Powered Home Repair Assistant

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2%20%2F%203.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring AI](https://img.shields.io/badge/AI-Google%20Gemini%20Vision-blue.svg)](https://aistudio.google.com/)
[![React](https://img.shields.io/badge/React-18%20%2B%20TypeScript-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey.svg)](LICENSE)

**HomeFix AI** is a full-stack, safety-first home repair and maintenance platform. Homeowners and caretakers can describe a household issue and upload a photo of the problem. Google Gemini AI vision analyzes the visual evidence and issue description to categorize the issue, estimate risk levels (from Safe DIY to Urgent Hazards), provide safe immediate steps, highlight critical things **NOT** to do, and advise when a qualified professional must be hired.

Users can also track repair expenses, log receipts, maintain appliance warranty dates, record service histories, and schedule recurring maintenance tasks.

---

## 🌟 Key Features

1. **AI Multimodal Visual Diagnostics**:
   - Analyzes household repair descriptions and uploaded photos (JPEG, PNG, WebP) using the Google Gemini model.
   - Outputs structured findings: problem category, simple summary, possible causes, risk level (`LOW`, `MEDIUM`, `HIGH`, `URGENT_HAZARD`), safe immediate steps, warnings / things not to do, professional recommendation status, follow-up questions, and confidence limitations.
2. **AI Safety First**:
   - Treats findings strictly as possible explanations, never confirmed diagnoses.
   - Actively flags life-safety hazards (live electrical, gas leaks, structural collapse risk) with bold emergency alerts and clear instructions to evacuate and call local emergency services.
   - Clearly flags when live AI is offline/unconfigured without ever hallucinating fake Gemini outputs.
3. **Repair Report Management**:
   - Complete CRUD operations with strict multi-tenant ownership enforcement (one user can never access or modify another user's reports).
   - Track lifecycle status: `SUBMITTED`, `IN_REVIEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
   - On-demand re-analysis with Gemini.
4. **Expense & Receipt Tracking**:
   - Record replacement parts, plumbing supplies, and contractor fees directly against reports.
   - Upload receipt photos and maintain total spend summaries.
5. **Appliances & Warranty Tracking**:
   - Store brand, model, and serial numbers.
   - Automatic active vs expired warranty status calculation based on warranty expiration dates.
   - Record maintenance and service history notes.
6. **Maintenance Reminders**:
   - Schedule one-time or recurring tasks (e.g. replacing HVAC air filters every 90 days, smoke alarm checks every 180 days).
   - Overdue warning alerts and automatic scheduling of the next occurrence upon completion.
7. **Secure Authentication & File Handling**:
   - BCrypt password hashing and stateless JWT (JSON Web Token) authentication.
   - File uploads validated for MIME type, file size (10MB limit), and UUID-sanitized filenames to prevent path traversal.
8. **Interactive OpenAPI / Swagger UI**:
   - Fully documented interactive API endpoints at `http://localhost:8080/swagger-ui.html`.

---

## 🏗️ Project Architecture

```
homefix-ai/
├── backend/                  # Spring Boot 3.4.2 API Application
│   ├── src/main/java/com/homefix/
│   │   ├── config/           # Security, JWT, CORS, OpenAPI Swagger, Storage
│   │   ├── controller/       # REST API Controllers (Auth, Reports, Appliances, Reminders, Expenses, Health)
│   │   ├── dto/              # Strongly-typed Request and Response DTOs
│   │   ├── entity/           # JPA Entities (User, RepairReport, AiAnalysis, Expense, Appliance, Reminder)
│   │   ├── exception/        # Global Exception Handler and custom HTTP exceptions
│   │   ├── repository/       # Spring Data JPA Repositories with multi-tenant isolation
│   │   └── service/          # Business logic, FileStorageService, and GeminiAiService
│   ├── src/main/resources/   # application.yml and application-test.yml
│   ├── src/test/java/        # JUnit 5 integration and safety tests
│   └── pom.xml               # Maven configuration
├── frontend/                 # React 18 + TypeScript + Vite Single-Page Application
│   ├── src/
│   │   ├── api/              # Typed API client with JWT header injection
│   │   ├── components/       # Navbar, RiskBadge, StatusBadge, AiAnalysisCard
│   │   ├── context/          # AuthContext for session management
│   │   ├── pages/            # Landing, Login, Register, Dashboard, NewRepair, Detail, History, Appliances, Reminders, Expenses
│   │   └── types/            # TypeScript interfaces
│   ├── package.json          # Vite, Tailwind CSS, Lucide icons
│   └── vite.config.ts        # Port 5173 with proxy to backend port 8080
├── database/                 # PostgreSQL schema and Windows setup scripts
│   ├── schema.sql            # Full PostgreSQL DDL script
│   └── setup_db.ps1          # Automated database setup script for Windows
├── .env.example              # Environment variables template
├── .gitignore                # Protects secrets, private uploads, and build outputs
└── README.md                 # Complete documentation
```

---

## 💻 Prerequisites & Setup (Windows)

### 1. Installed Software
- **Java 21 or higher** (JDK 21 or 25 installed)
- **Apache Maven 3.8+** (installed and in PATH)
- **Node.js 20+ and npm** (installed)
- **PostgreSQL 14+** (running on port 5432)

---

## 🗄️ Database Setup (PostgreSQL)

You can create the database using PostgreSQL's CLI (`psql`) or the included PowerShell script:

### Option A: Using the provided PowerShell script
Run this in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File database/setup_db.ps1
```

### Option B: Using psql command line
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE homefix_ai;"
```
*(Enter your PostgreSQL password when prompted)*

Hibernate will automatically initialize all required tables and relationships on first application startup (`ddl-auto: update`).

---

## 🔑 Configuration & Environment Variables

Copy `.env.example` to configure your environment or set these in your IDE run configuration:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DB_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/homefix_ai` |
| `DB_USERNAME` | PostgreSQL User | `postgres` |
| `DB_PASSWORD` | PostgreSQL Password | *(Your local postgres password)* |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | `HomeFixAiSuperSecureJwtSecretKeyMustBe32BytesLongForSecurity2026!` |
| `GEMINI_API_KEY` | Google Gemini API Key | *(Your Gemini API key)* |
| `GEMINI_MODEL` | Gemini AI model name | `gemini-1.5-flash` |
| `PORT` | Backend server port | `8080` |

### Getting a Free Google Gemini API Key:
1. Visit **[Google AI Studio](https://aistudio.google.com/)**.
2. Sign in with your Google account.
3. Click **"Get API key"** and create a new key.
4. Set the environment variable:
   ```powershell
   $env:GEMINI_API_KEY="AIzaSyYourActualKeyHere"
   ```
> **Note on AI Offline Mode:** If you do not have a Gemini API key yet, the backend and frontend run seamlessly! The UI will display a clear banner indicating that live AI is unconfigured and provide safe general household advisory guidelines. No dummy output is ever faked as live Gemini analysis.

---

## 🚀 Running the Project

### Running in Your IDE (IntelliJ IDEA / VS Code / Eclipse):
1. **Backend**:
   - Open the `backend` folder in your IDE.
   - Set environment variables `DB_PASSWORD` and optionally `GEMINI_API_KEY` in your Run/Debug Configuration.
   - Run the main class: `com.homefix.HomeFixApplication`.
2. **Frontend**:
   - Open the `frontend` folder.
   - Run `npm install` and `npm run dev`.

### Running from the Terminal (Windows PowerShell):

#### 1. Start the Backend (Port 8080)
```powershell
cd backend
$env:DB_PASSWORD="your_password_here"
# Optional: $env:GEMINI_API_KEY="your_gemini_key_here"
mvn spring-boot:run
```
The backend starts at `http://localhost:8080`.

#### 2. Start the Frontend (Port 5173)
In a second terminal window:
```powershell
cd frontend
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

---

## 🧪 Automated Tests

The backend includes a comprehensive test suite covering authentication, user registration, DTO validation, strict multi-tenant access control, and AI safety fallback behavior.

Run all tests via Maven:
```powershell
cd backend
mvn test
```

### Tests Summary:
- `AuthControllerTest`: Verifies user registration, duplicate email prevention, password length validation, and JWT token issuance.
- `RepairReportServiceTest`: Validates repair report creation, AI integration, and status updates.
- `AccessControlTest`: Strictly verifies that User B cannot view, edit, delete, or add expenses to User A's reports (throws `UnauthorizedAccessException` 403 Forbidden).
- `ValidationTest`: Tests boundary conditions (short descriptions, zero or negative expense amounts).
- `GeminiAiSafetyTest`: Confirms proper risk level definitions and unconfigured fallback behavior.

---

## 📖 API Documentation (Swagger UI)

When the backend is running, open the interactive Swagger UI:
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`
- **Health Check**: `http://localhost:8080/api/health`

### Key Endpoints:
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login & receive JWT
- `GET /api/auth/me` — Current profile
- `POST /api/reports` — Submit repair report with optional photo for Gemini AI diagnosis
- `GET /api/reports` — List user's repair reports
- `GET /api/reports/{id}` — Get report details & AI diagnosis
- `PATCH /api/reports/{id}/status` — Update report status
- `POST /api/reports/{id}/reanalyze` — Re-run Gemini AI analysis
- `DELETE /api/reports/{id}` — Delete report
- `POST /api/expenses` — Record repair expense & receipt
- `GET /api/appliances` — List appliances & warranties
- `POST /api/appliances` — Register appliance
- `GET /api/reminders` — List maintenance reminders
- `PATCH /api/reminders/{id}/toggle` — Mark reminder completed (auto-schedules recurring interval)
- `GET /api/uploads/{filename}` — View uploaded photo securely

---

## 🛡️ AI Safety & Disclaimer

> [!WARNING]
> HomeFix AI is designed for preliminary informational triage and safety guidance only. It is **not** an engineering inspection or a licensed trade diagnosis.
> - **Never** attempt dangerous DIY work on live electrical panels, high-voltage wiring, gas supply lines, open flames, or load-bearing structural members.
> - If you smell natural gas (rotten eggs) or notice electrical arcing or smoking wires, immediately evacuate and call 911 or your local utility emergency dispatch.
