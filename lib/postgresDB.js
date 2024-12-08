import { URL } from 'url'; // Import the URL class from the 'url' module
import pkg from 'pg'; // Importing pg package (PostgreSQL client)

const { Pool } = pkg; // Destructure Pool from pg

export class PostgresDB {
  constructor(url, options = {}) {
    const parsedUrl = new URL(url); // Parse the URL using the URL class

    this.url = url;
    this.options = options;
    this.pool = new Pool({
      user: parsedUrl.username, // Username extracted from the URL
      password: parsedUrl.password, // Password extracted from the URL
      host: parsedUrl.hostname, // Host (e.g., localhost)
      port: parsedUrl.port, // Port (e.g., 5432)
      database: parsedUrl.pathname.split('/')[1], // Database name
      ssl: true, // SSL configuration
      max: 20, // Max number of connections
      idleTimeoutMillis: 1000, // Timeout for idle connections
      connectionTimeoutMillis: 1000, // Timeout for new connections
      maxUses: 7500, // Close connections after this many uses
      ...this.options, // Any additional options
    });

    this.data = this._data = {}; // Initializing data containers
    this.READ = null; // Flag for ensuring data is read only once
  }

  // Initialize connection and setup the table
  async init() {
    try {
      await this.connectWithRetry(); // Try connecting with retries
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS data (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;
      await this.pool.query(createTableQuery); // Ensure the table exists
      console.log('PostgreSQL table ensured.');
      await this.read(); // Load data into memory after table setup
    } catch (err) {
      console.error('Failed to initialize PostgreSQL:', err.message);
      throw err;
    }
  }

  // Retry logic for establishing a connection
  async connectWithRetry() {
    let retries = 5;
    const delay = 3000;

    while (retries > 0) {
      try {
        await this.pool.connect(); // Try to establish the connection
        console.log('PostgreSQL connected✅');
        break;
      } catch (err) {
        console.error(`PostgreSQL connection failed. Retries left: ${retries - 1}`, err.message);
        retries -= 1;
        if (retries === 0) {
          throw new Error('PostgreSQL connection failed after multiple attempts.');
        }
        await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
      }
    }
  }

  // Load data into memory
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

    this.READ = true; // Flag to prevent multiple reads

    try {
      const res = await this.pool.query('SELECT key, value FROM data'); // Fetch data from the database
      this._data = res.rows.reduce((acc, row) => {
        acc[row.key] = row.value; // Map rows to key-value format
        return acc;
      }, {});

      // Set initial structure of data, combining existing data and loaded data
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
      this.READ = null; // Reset flag after reading
    }

    return this.data;
  }

  // Save data to PostgreSQL
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
        await this.pool.query(query, [key, JSON.stringify(value)]); // Insert or update the data
        console.log(`Wrote data to PostgreSQL for key ${key}`);
      }

      this.data = { ...this.data, ...data }; // Merge new data with existing
      console.log('Data saved to PostgreSQL:', this.data);
      return true;
    } catch (err) {
      console.error('Error writing to PostgreSQL:', err.message);
      console.error(err.stack);
      throw err;
    }
  }

  // Update a specific key's data
  async update(key, value) {
    if (!key) {
      throw new Error('Key is required to update data.');
    }

    this.data[key] = value; // Update in-memory data
    return this.write({ [key]: value }); // Persist to the database
  }

  // Close the connection pool gracefully
  async close() {
    try {
      await this.pool.end(); // Close all active connections
      console.log('PostgreSQL connection pool closed.');
    } catch (err) {
      console.error('Error closing PostgreSQL connection pool:', err.message);
    }
  }
  }
