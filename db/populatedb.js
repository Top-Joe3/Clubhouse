const { Client } = require("pg");
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const SQL = `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    fullname VARCHAR (255) NOT NULL,
    nickname VARCHAR (255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    admin BOOL DEFAULT false,
    member BOOL DEFAULT false
);
INSERT INTO users 
    (fullname, nickname, password, admin, member)
VALUES 
    ('Joseph Ackumey', 'josef', '$2b$10$RY48cx.tLqq7FUr1LA7NYeHJHh/eBcsYAZRHLNixZXn5e9orpiP/G', true, true),
    ('Ben Ackumey', 'poko', '$2b$10$ws0dm9JV72MY6Wng7nsfDu8fqCQbgk48GrdLnSUh4/duFp0n/9vzO', true, true);

CREATE TABLE IF NOT EXISTS messages (
    message_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO messages
    (user_id, message)
VALUES
    (1, 'Doctor: We''ve received your test results and your DNA appears to be backward, Patient: AND'),
    (2, 'To be Frank, I''d have to change my name');
`;

async function populate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  try {
    console.log("seeding...");
    await client.connect();
    await client.query("BEGIN");
    await client.query(SQL);
    await client.query("COMMIT");
    console.log("Done");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding failed", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

populate();
