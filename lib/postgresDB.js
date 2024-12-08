import pkg from 'pg';
const { Pool } = pkg;

export class PostgresDB {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.pool = new Pool({ connectionString: this.url, ...this.options });
    this.data = this._data = {}; // In-memory cache
  }

  /**
   * Initialize the database, create table if it doesn't exist, and load existing data.
   */
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
    return this.read(); // Load existing data into memory
  }

  /**
   * Retry connection to the database with a delay if it fails.
   */
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
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Read all data from the database and store it in memory.
   */
  async read() {
    try {
      const query = 'SELECT key, value FROM data';
      const res = await this.pool.query(query);
      this._data = res.rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});
      this.data = this._data; // Update in-memory cache
      console.log('Data loaded from database:', this.data);
      return this.data;
    } catch (err) {
      console.error('Error reading from PostgreSQL:', err.message);
      throw err;
    }
  }

  /**
   * Write data to the database.
   * If a key already exists, it updates the value.
   * @param {Object} data - The data to write to the database.
   */
  async write(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data. Must be a non-empty object.');
    }

    try {
      for (const [key, value] of Object.entries(data)) {
        const query = `
          INSERT INTO data (key, value)
          VALUES ($1, $2::jsonb)
          ON CONFLICT (key)
          DO UPDATE SET value = $2::jsonb
        `;
        await this.pool.query(query, [key, value]);
      }

      // Merge new data with the in-memory cache
      this.data = { ...this.data, ...data };
      console.log('Data saved to database:', this.data);
      return true;
    } catch (err) {
      console.error('Error writing to PostgreSQL:', err.message);
      throw err;
    }
  }

  /**
   * Update the in-memory data and persist it to the database.
   * @param {string} key - The key to update.
   * @param {any} value - The value to set.
   */
  async update(key, value) {
    if (!key) throw new Error('Key is required to update data.');

    // Update in-memory cache
    this.data[key] = value;

    // Persist to the database
    return this.write({ [key]: value });
  }

  /**
   * Close the database connection pool.
   */
  async close() {
    try {
      await this.pool.end();
      console.log('PostgreSQL connection pool closed.');
    } catch (err) {
      console.error('Error closing PostgreSQL connection pool:', err.message);
    }
  }
  }
