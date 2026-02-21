const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_ROLE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function getMessages() {
  const { rows } = await pool.query(
    "SELECT nickname, message, date, message_id FROM users INNER JOIN messages ON users.id = messages.user_id",
  );
  return rows;
}

async function addUser(fields) {
  await pool.query(
    "INSERT INTO users (fullname, nickname, password) VALUES ($1, $2, $3)",
    fields,
  );
}

async function deleteJoke(jokeId) {
  await pool.query("DELETE FROM messages WHERE message_id = $1", [jokeId]);
}

async function addJoke(fields) {
  await pool.query(
    "INSERT INTO messages (user_id, message) VALUES ($1, $2)",
    fields,
  );
}

async function admin(userId){
    await pool.query("UPDATE users SET admin = true WHERE id = $1", [userId])
}

async function member(userId){
    await pool.query("UPDATE users SET member = true WHERE id = $1", [userId])
}

module.exports = { pool, getMessages, addUser, deleteJoke, addJoke, admin, member };
