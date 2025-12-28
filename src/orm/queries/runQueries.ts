import mariadb from 'mariadb'
import type { Params, DbResult } from '../definitions/controllers.ts'
import { checkWhereParams } from './validate.ts'
import { pool } from '../../config/db.init.ts'

/*********************************************************
ÉXÉCUTION REQUÊTE SELECT
*********************************************************/

export async function runQuerySelect (params: Params): Promise<DbResult> {
    let conn 
    try {
        let checkParams: DbResult

        // Validation des Paramètres (clause WHERE)
        if (params.where && params.where.length > 0) {
            checkParams = checkWhereParams(params)
            if (!checkParams.success) return checkParams
        }

        // // Validation du tri (clause ORDER)
        // checkParams = checkOrderParams(params)
        // if (!checkParams.success) return checkParams

        // // Construction de la requête SQL
        // const sql = build.sqlSelect(params)

        // Éxecution de la requête
        conn = await pool.getConnection() 
        const result = await conn.query('SELECT 1 + 1 AS solution')
        // const result = await conn.query({nestTables: true, sql: sql.reqString}, sql.reqParams)

        // return {success: true, result: result}

        return {success: true, result: result}
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> runQuerySelect()'
        throw new Error(message)
    }
    finally {
        if (conn) conn.end()
    }
}