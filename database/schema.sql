-- ==========================================================
-- 10minshare Database Schema (PostgreSQL / Layerbase)
-- ==========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: shares
-- Stores share metadata and expiration timestamp
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code VARCHAR(16) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    is_expired BOOLEAN NOT NULL DEFAULT FALSE
);

-- Table: share_files
-- Stores file references linked to Cloudflare R2 object keys
CREATE TABLE IF NOT EXISTS share_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
    file_key TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_shares_short_code ON shares(short_code);
CREATE INDEX IF NOT EXISTS idx_shares_expires_at ON shares(expires_at);
CREATE INDEX IF NOT EXISTS idx_share_files_share_id ON share_files(share_id);

-- Useful Query for Manual / Cron Cleanup
-- SELECT * FROM shares WHERE expires_at < NOW() OR is_expired = TRUE;
