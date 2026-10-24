# Data Entry Web App

A clean, responsive Data Entry Web App built with Next.js, Tailwind CSS, and local persistent SQLite database storage (zero manual configuration required).

---

## 🚀 Quick Start

1. **Install dependencies** (already installed):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. Open **[http://localhost:3000](http://localhost:3000)** (or the port shown in terminal).

---

## 📋 Pages & Usage

- **Public Data Entry Form**: `/`
  - Submit `Name`, `Email`, `Phone Number`, and `Details & Notes`.
  - Client and server-side validation.
  - Submissions are persistently saved directly into the local SQLite database.

- **Admin Dashboard**: `/admin`
  - Protected with server-side authentication (signed HttpOnly cookies).
  - **Default Password**: `admin123` *(customizable via `.env.local`)*.
  - Live search across all fields (Name, Email, Phone, Details).
  - View full notes modal.
  - Delete records with confirmation.
  - Export filtered records to CSV.

---

## 🗄️ Database (Zero Manual Setup)

- **Database**: SQLite (`better-sqlite3`).
- **Location**: `data/data_entry.db` (auto-created on first run).
- **No external accounts, Docker, or manual database setup needed.**




