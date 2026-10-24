import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export interface Submission {
  id: number;
  name: string;
  email: string;
  phone: string;
  details: string;
  created_at: string;
}

// Global reference for Next.js hot-reloading preservation
declare global {
  // eslint-disable-next-line no-var
  var __sqlite_db: Database.Database | undefined;
}

function getDatabase(): Database.Database {
  if (global.__sqlite_db) {
    return global.__sqlite_db;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "data_entry.db");
  const db = new Database(dbPath);

  // Enable WAL mode for better concurrency and write performance
  db.pragma("journal_mode = WAL");

  // Create table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      details TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
  `);

  if (process.env.NODE_ENV !== "production") {
    global.__sqlite_db = db;
  }

  return db;
}

export function getAllSubmissions(search?: string): Submission[] {
  const db = getDatabase();
  if (search && search.trim().length > 0) {
    const term = `%${search.trim()}%`;
    const stmt = db.prepare(`
      SELECT * FROM submissions 
      WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR details LIKE ? 
      ORDER BY id DESC
    `);
    return stmt.all(term, term, term, term) as Submission[];
  }

  const stmt = db.prepare("SELECT * FROM submissions ORDER BY id DESC");
  return stmt.all() as Submission[];
}

export function getSubmissionById(id: number): Submission | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM submissions WHERE id = ?");
  const row = stmt.get(id);
  return (row as Submission) || null;
}

export function insertSubmission(
  name: string,
  email: string,
  phone: string,
  details: string
): Submission {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO submissions (name, email, phone, details) 
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(name.trim(), email.trim(), phone.trim(), details.trim());
  
  const created = getSubmissionById(Number(result.lastInsertRowid));
  if (!created) {
    return {
      id: Number(result.lastInsertRowid),
      name,
      email,
      phone,
      details,
      created_at: new Date().toISOString(),
    };
  }
  return created;
}

export function deleteSubmission(id: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM submissions WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

export function getSubmissionsCount(): number {
  const db = getDatabase();
  const stmt = db.prepare("SELECT COUNT(*) as count FROM submissions");
  const result = stmt.get() as { count: number };
  return result?.count || 0;
}
