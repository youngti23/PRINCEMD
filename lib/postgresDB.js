import pkg from 'pg';
const { Pool } = pkg;

export class PostgresDB {
  constructor(url, options = {}) {
    /**
     * @type {string} PostgreSQL connection URL
     */
    this.url = url;

    /**
     * @type {Object} PostgreSQL connection options
     */
    this.options = options;

    /**
     * @type {Pool} Connection pool instance
     */
    this.pool = new Pool({ connectionString: this.url, ...this.options });

    /**
     * @type {Object} In-memory data cache
     */
    this.data = this._data = {};

    /**
     * Initialize the database on instantiation
     */
    this.db = this.init();
  }

  /**
   * Initialize the PostgreSQL database, creating the table if it doesn't exist, and loading data.
   */
  async init() {
    try {
      await this.connectWithRetry();
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS data (
          id SERIAL PRIMARY KEY,
          key TEXT UNIQUE NOT NULL,
          value JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;
      await this.pool.query(createTableQuery);
      console.log('PostgreSQL table ensured.');
      await this.read(); // Load data from the database
    } catch (err) {
      console.error('Error initializing PostgreSQL database:', err.message);
      throw err;
    }
  }

  /**
   * Connect to PostgreSQL with retry logic.
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
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Read data from PostgreSQL and populate in-memory cache.
   */
  async read() {
    try {
      const query = 'SELECT key, value FROM data';
      const res = await this.pool.query(query);
      this._data = res.rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});

      this.data = this._data; // Sync in-memory data
      console.log('Data loaded from PostgreSQL:', this.data);

      // If no data exists, initialize an empty record
      if (Object.keys(this.data).length === 0) {
        await this.write({});
      }

      return this.data;
    } catch (err) {
      console.error('Error reading from PostgreSQL:', err.message);
      throw err;
    }
  }

  /**
   * Write data to PostgreSQL, updating or inserting as needed.
   * @param {Object} data - The data to be written to the database
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
          DO UPDATE SET value = $2::jsonb, created_at = NOW()
        `;
        await this.pool.query(query, [key, value]);
      }

      // Merge new data with the in-memory cache
      this.data = { ...this.data, ...data };
      console.log('Data saved to PostgreSQL:', this.data);
      return true;
    } catch (err) {
      console.error('Error writing to PostgreSQL:', err.message);
      throw err;
    }
  }

  /**
   * Update or add a single key-value pair to the database.
   * @param {string} key - The key to update.
   * @param {any} value - The value to set.
   */
  async update(key, value) {
    if (!key) {
      throw new Error('Key is required to update data.');
    }

    // Update in-memory data
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
