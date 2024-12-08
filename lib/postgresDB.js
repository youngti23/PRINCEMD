import pkg from 'pg';
const { Pool } = pkg;

export class PostgresDB {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.pool = new Pool({ connectionString: this.url, ...this.options });
    this.data = this._data = {}; // In-memory cache
    this.READ = null; // Initialization flag
  }

  // Initialize the database, ensure the table exists
  async init() {
    try {
      await this.connectWithRetry();
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS data (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;
      await this.pool.query(createTableQuery);
      console.log('PostgreSQL table ensured.');
      await this.read(); // Load data into memory
    } catch (err) {
      console.error('Failed to initialize PostgreSQL:', err.message);
      throw err;
    }
  }

  // Connect to PostgreSQL with retry logic
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

  // Read data from PostgreSQL and populate in-memory cache
  async read() {
    if (this.READ) {
      return new Promise((resolve) =>
        setInterval(async () => {
          if (!this.READ) {
            clearInterval(this);
            resolve(this.data || this.read());
          }
        }, 1000)
      );
    }

    this.READ = true;

    try {
      const res = await this.pool.query('SELECT key, value FROM data');
      this._data = res.rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});

      this.data = {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {},
        ...(this._data || {}),
      };

      console.log('Data loaded from PostgreSQL:', this.data);
    } catch (err) {
      console.error('Error reading data from PostgreSQL:', err.message);
      throw err;
    } finally {
      this.READ = null;
    }

    return this.data;
  }

  // Write data to PostgreSQL
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
          DO UPDATE SET value = $2::jsonb, created_at = NOW();
        `;
        await this.pool.query(query, [key, value]);
      }

      this.data = { ...this.data, ...data }; // Synchronize in-memory cache
      console.log('Data saved to PostgreSQL:', this.data);
      return true;
    } catch (err) {
      console.error('Error writing to PostgreSQL:', err.message);
      throw err;
    }
  }

  // Update or add a single key-value pair to the database
  async update(key, value) {
    if (!key) {
      throw new Error('Key is required to update data.');
    }

    this.data[key] = value; // Update in-memory data
    return this.write({ [key]: value }); // Persist to the database
  }

  // Close the PostgreSQL connection pool
  async close() {
    try {
      await this.pool.end();
      console.log('PostgreSQL connection pool closed.');
    } catch (err) {
      console.error('Error closing PostgreSQL connection pool:', err.message);
    }
  }
}
