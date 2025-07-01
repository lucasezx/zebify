import pool from "./db.js";

export const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        gender TEXT NOT NULL CHECK(gender IN ('feminino','masculino')),
        birth_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        avatar_url TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_code TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tipo TEXT NOT NULL CHECK(tipo IN ('texto','imagem')),
        conteudo TEXT,
        legenda TEXT,
        imagem_path TEXT,
        visibility TEXT NOT NULL DEFAULT 'public'
          CHECK (visibility IN ('public','friends','private')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        editado BOOLEAN DEFAULT FALSE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id),
        receiver_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT DEFAULT 'pendente'
          CHECK(status IN ('pendente','aceito','recusado')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        conteudo TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id),
        receiver_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
      );
    `);

    console.log("Tabelas criadas com sucesso no PostgreSQL.");
  } catch (error) {
    console.error("Erro ao criar tabelas:", error);
  }
};
