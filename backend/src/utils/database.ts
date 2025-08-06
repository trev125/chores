import sqlite3 from "sqlite3";
import path from "path";
import { promisify } from "util";

export class Database {
  private db: sqlite3.Database;
  private static instance: Database;

  private constructor() {
    const dbPath = process.env.DATABASE_PATH || "./database.sqlite";
    this.db = new sqlite3.Database(dbPath);
    this.db.run("PRAGMA foreign_keys = ON");
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getDb(): sqlite3.Database {
    return this.db;
  }

  public async run(
    query: string,
    params: any[] = []
  ): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  public async get(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  public async all(query: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  public close(): void {
    this.db.close();
  }
}

export async function initializeDatabase(): Promise<void> {
  const db = Database.getInstance();

  // Create app_settings table
  await db.run(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    )
  `);

  // Create persons table
  await db.run(`
    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      bonus_points INTEGER DEFAULT 0,
      last_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_daily_chores_added DATETIME DEFAULT CURRENT_TIMESTAMP,
      avatar TEXT DEFAULT 'default_avatar.png',
      color TEXT DEFAULT '#ffffff',
      order_index INTEGER DEFAULT 0,
      pin TEXT,
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create chores table
  await db.run(`
    CREATE TABLE IF NOT EXISTS chores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      assigned_to_id INTEGER,
      assigned_to TEXT,
      points INTEGER DEFAULT 1,
      completed BOOLEAN DEFAULT 0,
      date_completed DATETIME,
      is_daily BOOLEAN DEFAULT 0,
      due_date DATE,
      deleted BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to_id) REFERENCES persons (id)
    )
  `);

  // Create rewards table
  await db.run(`
    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      points_required INTEGER NOT NULL,
      assigned_to_id INTEGER,
      assigned_to TEXT,
      completed BOOLEAN DEFAULT 0,
      date_completed DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to_id) REFERENCES persons (id)
    )
  `);

  // Create activity_log table
  await db.run(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      user_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("Database tables initialized successfully");
}
