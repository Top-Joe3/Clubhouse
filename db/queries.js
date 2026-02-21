const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,  
  },
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

async function admin(userId) {
  await pool.query("UPDATE users SET admin = true WHERE id = $1", [userId]);
}

async function member(userId) {
  await pool.query("UPDATE users SET member = true WHERE id = $1", [userId]);
}

module.exports = {
  pool,
  getMessages,
  addUser,
  deleteJoke,
  addJoke,
  admin,
  member,
};
