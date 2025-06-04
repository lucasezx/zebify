import sqlite3 from "sqlite3";
import { promisify } from "util";

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    db.run("PRAGMA foreign_keys = ON");
    console.log("Connected to the database.");
  }
});

export const createTables = () => {
  db.serialize(() => {
    // Tabela de usuários
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
    )`);

      // Tabela de postagens
      db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('texto','imagem')),
      conteudo TEXT,
      legenda TEXT,
      imagem_path TEXT,
      visibility TEXT NOT NULL DEFAULT 'public'
      CHECK (visibility IN ('public','friends','private')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

    // Tabela de amizades
    db.run(`CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('pendente', 'aceito', 'recusado')) DEFAULT 'pendente',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
)`);
    // Tabela de comentários
    db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    conteudo TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
)`);
  });
};

export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID });
      }
    });
  });
};

export const allQuery = promisify(db.all.bind(db));

export default db;
