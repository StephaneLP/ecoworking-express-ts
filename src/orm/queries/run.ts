import mariadb from 'mariadb'
import type { Params, DbResult, BuildQuery } from '../definitions/Queries.ts'
import { checkRelationShip, checkWhereParams, checkOrderParams } from './validate.ts'
import { buildQuerySelect } from './build.ts'
import { pool } from '../../config/db.init.ts'

/*********************************************************
ÉXÉCUTION REQUÊTE SELECT
*********************************************************/

export async function runQuerySelect (params: Params): Promise<DbResult> {
    let conn 
    try {
        let checkParams: DbResult

        // Validation des liens de parenté entre les tables
        if (params.joinTables && params.joinTables.length > 0) {
            checkRelationShip(params.mainTable, params.joinTables)
        }

        // Validation des Paramètres (clause WHERE)
        if (params.where && params.where.length > 0) {
            checkParams = checkWhereParams(params.where)
            if (!checkParams.success) {
                checkParams.message += ' -> runQuerySelect()'
                return checkParams
            }
        }

        // Validation du tri (clause ORDER)
        if (params.order && params.order.length > 0) {
            checkParams = checkOrderParams(params.order)
            if (!checkParams.success) {
                checkParams.message += ' -> runQuerySelect()'
                return checkParams
            }
        }

        // Construction de la requête SQL
        const sql: BuildQuery = buildQuerySelect(params)

        // Éxecution de la requête
        conn = await pool.getConnection() 
        // const result = await conn.query('SELECT 1 + 1 AS solution')
        const result = await conn.query({nestTables: true, sql: sql.queryString}, sql.queryParams)

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