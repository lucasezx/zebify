import pool from "./db.js";

function transformPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export async function runQuery(sql, params = []) {
  const text = transformPlaceholders(sql);
  const needsReturning = /^\s*INSERT/i.test(sql) && !/RETURNING/i.test(sql);
  const finalSql = needsReturning ? `${text} RETURNING id` : text;
  const result = await pool.query(finalSql, params);
  return { lastID: result.rows[0]?.id };
}

export async function allQuery(sql, params = []) {
  const text = transformPlaceholders(sql);
  const { rows } = await pool.query(text, params);
  return rows;
}

export default pool;
