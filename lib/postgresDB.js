import pkg from 'pg';
const { Pool } = pkg;

export class PostgreDB {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.pool = new Pool({ connectionString: this.url, ...this.options });
    this.data = this._data = {};
  }

  async init() {
    await this.connectWithRetry();
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS data (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value JSONB NOT NULL
      );
    `;
    await this.pool.query(createTableQuery);
    return this.read();
  }

  async connectWithRetry() {
    let retries = 5;
    const delay = 3000;

    while (retries > 0) {
      try {
        await this.pool.connect();
        console.log('PostgreSQL connected✅');
        break;
      } catch (err) {
        console.error(`PostgreSQL connection failed. Retries left: ${retries - 1}`, err.message);
        retries -= 1;
        if (retries === 0) {
          throw new Error('PostgreSQL connection failed after multiple attempts.');
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async read() {
    try {
      const query = 'SELECT key, value FROM data';
      const res = await this.pool.query(query);
      this._data = res.rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});
      this.data = this._data;
      return this.data;
    } catch (err) {
      console.error('Error reading from PostgreSQL:', err.message);
      throw err;
    }
  }

  async write(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data. Must be a non-empty object.');
    }

    try {
      for (const [key, value] of Object.entries(data)) {
        const query = `
          INSERT INTO data (key, value)
          VALUES ($1, $2)
          ON CONFLICT (key)
          DO UPDATE SET value = $2
        `;
        await this.pool.query(query, [key, value]);
      }

      this.data = { ...this.data, ...data };
      return true;
    } catch (err) {
      console.error('Error writing to PostgreSQL:', err.message);
      throw err;
    }
  }
}
