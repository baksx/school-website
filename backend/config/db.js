// const mysql = require('mysql2/promise');

// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'S4df6gto',
//   database: 'school_db'
// });

// module.exports = pool;

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',           // Перевірте користувача в панелі Cityhost
  password: 'S4df6gto',     // Перевірте пароль
  database: 'school_db',    // Перевірте назву бази даних
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Тест підключення при запуску сервера
pool.getConnection()
  .then(conn => {
    console.log('✅ Успішне підключення до бази даних MySQL!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ ПОМИЛКА ПІДКЛЮЧЕННЯ ДО БД:', err.message);
  });

module.exports = pool;