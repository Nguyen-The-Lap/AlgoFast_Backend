import mysql from 'mysql2/promise';

let connection = null;

const connectDB = async () => {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
    console.log('MySQL Connected');
  }
  return connection;
};

const getConnection = () => {
  if (!connection) {
    throw new Error('MySQL connection not established');
  }
  return connection;
};

export { connectDB, getConnection }; 