import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://lucas:UKWcaCcLTluuTOz2UHLQuYeWnUQOyGBs@dpg-d1hvcnmmcj7s73d6gr10-a.oregon-postgres.render.com/zebifydb";

const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
