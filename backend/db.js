import pg from "pg";

const pool = new pg.Pool({
  user: "lucas",
  host: "dpg-d1hvcnmmcj7s73d6gr10-a",
  database: "zebifydb",
  password: "UKWcaCcLTIuuTOz2UHLQuYeWnUQOyGBs",
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
