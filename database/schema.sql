-- ==========================================================
-- HomeFix AI - PostgreSQL Database Schema
-- Database: homefix_ai
-- ==========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);

-- 2. Appliances Table
CREATE TABLE IF NOT EXISTS appliances (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    warranty_expiry_date DATE,
    notes TEXT,
    service_history TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appliance_user ON appliances(user_id);

-- 3. AI Analyses Table
CREATE TABLE IF NOT EXISTS ai_analyses (
    id BIGSERIAL PRIMARY KEY,
    problem_category VARCHAR(255) NOT NULL,
    simple_summary TEXT NOT NULL,
    risk_level VARCHAR(50) NOT NULL DEFAULT 'LOW',
    professional_recommended BOOLEAN NOT NULL DEFAULT FALSE,
    confidence_note TEXT,
    live_ai_configured BOOLEAN NOT NULL DEFAULT TRUE,
    analyzed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Element Collections for AI Analysis
CREATE TABLE IF NOT EXISTS ai_possible_causes (
    analysis_id BIGINT NOT NULL REFERENCES ai_analyses(id) ON DELETE CASCADE,
    cause TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_safe_steps (
    analysis_id BIGINT NOT NULL REFERENCES ai_analyses(id) ON DELETE CASCADE,
    step TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_not_to_do (
    analysis_id BIGINT NOT NULL REFERENCES ai_analyses(id) ON DELETE CASCADE,
    warning TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_followup_questions (
    analysis_id BIGINT NOT NULL REFERENCES ai_analyses(id) ON DELETE CASCADE,
    question TEXT NOT NULL
);

-- 4. Repair Reports Table
CREATE TABLE IF NOT EXISTS repair_reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    issue_description TEXT NOT NULL,
    room_or_location VARCHAR(100),
    urgency VARCHAR(50) DEFAULT 'NORMAL',
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    image_filename VARCHAR(255),
    image_content_type VARCHAR(100),
    appliance_id BIGINT REFERENCES appliances(id) ON DELETE SET NULL,
    ai_analysis_id BIGINT UNIQUE REFERENCES ai_analyses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_report_user ON repair_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_report_status ON repair_reports(status);

-- 5. Repair Expenses Table
CREATE TABLE IF NOT EXISTS repair_expenses (
    id BIGSERIAL PRIMARY KEY,
    repair_report_id BIGINT NOT NULL REFERENCES repair_reports(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_filename VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expense_report ON repair_expenses(repair_report_id);
CREATE INDEX IF NOT EXISTS idx_expense_user ON repair_expenses(user_id);

-- 6. Maintenance Reminders Table
CREATE TABLE IF NOT EXISTS maintenance_reminders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appliance_id BIGINT REFERENCES appliances(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_days INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reminder_user ON maintenance_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_due_date ON maintenance_reminders(due_date);
