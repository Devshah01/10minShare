# 10minshare — Temporary Image Sharing Platform 🚀

**10minshare** is an enterprise-grade, clean, minimal web application for sharing images that **automatically self-destruct after 10 minutes**.

Users can upload up to **10 images**, preview and remove unwanted thumbnails, generate a shareable link and a scannable **QR Code**, and share it with recipients. Both uploader and recipient see a live **10-minute countdown timer**. Once 10 minutes expire, all files stored in **Cloudflare R2** and metadata in **PostgreSQL** are permanently erased.

---

## 🏗 Industry Grade Folder Structure

```
10minShare/
├── database/
│   └── schema.sql              # PostgreSQL schema with tables, indexes, & triggers
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.config.js    # Centralized environment configurations
│   │   │   ├── db.config.js     # PostgreSQL (Layerbase) pool connection
│   │   │   └── r2.config.js     # Cloudflare R2 S3Client configuration
│   │   ├── controllers/
│   │   │   └── share.controller.js # Express route handlers
│   │   ├── middleware/
│   │   │   ├── upload.middleware.js # Multer (Max 10 images, 10MB limit)
│   │   │   ├── rateLimiter.middleware.js # Rate limit protection
│   │   │   └── error.middleware.js # Global error handler
│   │   ├── routes/
│   │   │   └── share.routes.js  # REST API route endpoints
│   │   ├── services/
│   │   │   ├── storage.service.js # Cloudflare R2 upload/download/delete
│   │   │   ├── share.service.js   # DB queries & in-memory fallback
│   │   │   └── cleanup.service.js # 1-minute cron job for expired files
│   │   ├── utils/
│   │   │   ├── codeGenerator.js   # Shortcode generator
│   │   │   └── logger.js          # Structured logger
│   │   └── server.js            # Express server entry point
│   ├── Dockerfile               # Multi-stage production container for Cloud Run
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx      # Top navigation with status badge
│   │   │   │   ├── Footer.jsx      # Minimal footer
│   │   │   │   ├── ThemeToggle.jsx # Sun/Moon icon dark mode toggle
│   │   │   │   └── CountdownTimer.jsx # Live 10-minute countdown badge
│   │   │   ├── upload/
│   │   │   │   ├── ImageDropzone.jsx   # Drag & drop with X/10 image counter
│   │   │   │   ├── ImagePreviewGrid.jsx # Thumbnails with individual delete button
│   │   │   │   └── UploadProgress.jsx  # Upload progress indicator
│   │   │   ├── share/
│   │   │   │   ├── ShareSuccessModal.jsx # Link, QR code & timer modal
│   │   │   │   ├── QRCodeDisplay.jsx     # Dynamic QR code & PNG download
│   │   │   │   └── CopyLinkBox.jsx       # One-click copy link box
│   │   │   └── viewer/
│   │   │       ├── ShareViewer.jsx      # Recipient view with ZIP downloader
│   │   │       ├── ImageGallery.jsx     # Grid gallery with lightbox trigger
│   │   │       ├── LightboxModal.jsx    # Fullscreen image lightbox
│   │   │       └── ExpiredState.jsx     # 10-minute expired state UI
│   │   ├── context/
│   │   │   └── ThemeContext.jsx # Theme provider (Light & Dark mode)
│   │   ├── hooks/
│   │   │   └── useCountdown.js  # Reactive countdown hook
│   │   ├── services/
│   │   │   └── api.js           # API HTTP client
│   │   ├── styles/
│   │   │   └── index.css        # Tailwind CSS & custom glassmorphism styles
│   │   ├── App.jsx              # Main routing & state controller
│   │   └── main.jsx             # React DOM entry
│   ├── index.html               # Google Fonts (Outfit & Plus Jakarta Sans)
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start Guide (Local Development)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Postgres & Cloudflare R2 credentials (or run with defaults)
npm run dev
```

Backend will run on: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 🗄 1. Database Setup (Layerbase / PostgreSQL)

1. Connect to your PostgreSQL database hosted on **Layerbase** (or Supabase/Neon/Local Postgres).
2. Execute the migration script located in `database/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code VARCHAR(16) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    is_expired BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS share_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
    file_key TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## ☁ 2. Cloudflare R2 Storage Setup

1. Go to **Cloudflare Dashboard** -> **R2 Object Storage**.
2. Click **Create Bucket** and name it `10minshare-uploads`.
3. Go to **R2 API Tokens** -> **Create API Token** (Permissions: `Admin Read & Write`).
4. Copy:
   - `Account ID`
   - `Access Key ID`
   - `Secret Access Key`
5. Fill these values into your backend `.env` or GCP Cloud Run environment variables.

---

## 🚀 3. Deploying Backend to GCP Cloud Run

1. Make sure Google Cloud SDK (`gcloud`) is installed and authenticated.
2. Build and deploy using GCP Cloud Run:

```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/10minshare-backend
gcloud run deploy 10minshare-backend \
  --image gcr.io/YOUR_PROJECT_ID/10minshare-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql://user:pass@layerbase-host:5432/db,R2_ACCOUNT_ID=xxx,R2_ACCESS_KEY_ID=yyy,R2_SECRET_ACCESS_KEY=zzz,R2_BUCKET_NAME=10minshare-uploads,FRONTEND_URL=https://10minshare.pages.dev"
```

---

## 🌐 4. Deploying Frontend to Cloudflare Pages

1. Log in to **Cloudflare Dashboard** -> **Workers & Pages**.
2. Click **Create Application** -> **Pages** -> **Connect to Git** (Select repository).
3. Build Settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Environment Variables:
   - `VITE_API_BASE_URL`: `https://YOUR-CLOUD-RUN-URL.run.app/api`
5. Click **Save and Deploy**.

---

## 🌟 Key Features Summary

- **Max 10 Images Limit**: Clear visual indicator showing `X / 10 images` uploaded.
- **Single-Click Thumbnail Delete**: Remove individual added images before generating share link.
- **Strict 10-Minute Expiration**: Automatic DB purge and Cloudflare R2 object deletion via node-cron background task.
- **Synced Live Timer**: Real-time countdown timer displayed on both sender and recipient pages.
- **QR Code & Shareable Link**: Instant scannable QR Code generation with single-click link copying.
- **ZIP Download for Recipient**: Recipients can download individual images or all images in a `.zip` archive.
- **Clean Premium Design**: Dark/Light mode theme icon toggle, elegant sans-serif typography (`Outfit` & `Plus Jakarta Sans`), glassmorphism cards.
