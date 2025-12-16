// import mariadb from 'mariadb'
// import { logEvent, logError } from "../utils/log.ts"

// export const pool: mariadb.Pool = mariadb.createPool({
//      host: process.env.DB_HOST,
//      user: process.env.DB_USER,
//      password: process.env.DB_PASSWORD,
//      database: process.env.DB_DATABASE,
//      port: Number(process.env.DB_PORT),
//      insertIdAsNumber: true,
//      bigIntAsNumber: true,
//      connectionLimit: 5,
// })

// const testConnect = async () => {
//     let conn;
//     try {
//         conn = await pool.getConnection();
//         logEvent(`Connexion à la BDD (threadId=${conn.threadId})`)
//     } catch (err) { 
//         logError(`Erreur de connexion à la BDD (err=${err})`)
//     } finally {
//         if (conn) conn.end()
//     }
// }

// // Test de la connexion à la BDD
// testConnect()
