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
    db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )`);
  });
};


export const runQuery = promisify(db.run.bind(db));
export const allQuery = promisify(db.all.bind(db));

export default db;
