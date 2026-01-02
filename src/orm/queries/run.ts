import mariadb from 'mariadb'
import type { Params, DbResult, BuildQuery } from '../definitions/Queries.ts'
import { subCheckRelationShip, subCheckColumns, checkWhereParams, checkOrderParams } from './validate.ts'
import { buildQuerySelect } from './build.ts'
import { pool } from '../../config/db.init.ts'

/*********************************************************
ÉXÉCUTION REQUÊTE SELECT
*********************************************************/

export const runQuerySelect = async (params: Params): Promise<DbResult> => {
// export async function runQuerySelect(params: Params): Promise<DbResult> {
    let conn 
    try {
        let checkParams: DbResult

        // Validation des liens de parenté entre les tables
        subCheckRelationShip(params.mainTable, params.joinTables)

        // Validation des colonnes
        subCheckColumns(params.mainTable, params.joinTables)

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
// console.log('SQL', sql)
        // Éxecution de la requête
        conn = await pool.getConnection()
        const result = await conn.query({nestTables: params.nestTables, sql: sql.queryString}, sql.queryParams)

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