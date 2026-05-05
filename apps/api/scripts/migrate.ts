import { Pool } from 'pg';
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    console.error('Error: DATABASE_URL is not set.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT        PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const { rows } = await pool.query<{ filename: string }>(
      'SELECT filename FROM schema_migrations ORDER BY filename',
    );
    const applied = new Set(rows.map((r) => r.filename));

    const migrationsDir = join(__dirname, '../migrations');
    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  skip   ${file}`);
        continue;
      }

      const sql = await readFile(join(migrationsDir, file), 'utf-8');

      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await pool.query('COMMIT');
        console.log(`  apply  ${file}`);
        count++;
      } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
      }
    }

    if (count === 0) {
      console.log('Nothing to apply — database is up to date.');
    } else {
      console.log(`\nDone — ${count} migration(s) applied.`);
    }
  } finally {
    await pool.end();
  }
}

migrate().catch((err: Error) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
