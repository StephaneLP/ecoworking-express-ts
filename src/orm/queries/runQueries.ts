import type { Params } from '../definitions/controllers'

/*********************************************************
ÉXÉCUTION REQUÊTE SELECT
*********************************************************/

export async function runQuerySelect (params: Params) {
    // let conn
    try {
        // let check

        // // Validation des Paramètres (clause WHERE)
        // check = checkQueryParams(params)
        // if (!check.success) return check

        // // Validation du tri (clause ORDER)
        // check = checkOrderParams(params)
        // if (!check.success) return check

        // // Construction de la requête SQL
        // const sql = build.sqlSelect(params)

        // // Éxecution de la requête
        // conn = await db.getConnection()
        // const result = await conn.query({nestTables: true, sql: sql.reqString}, sql.reqParams)

        // return {success: true, result: result}

        return {success: true, result: true}
    }
    catch(error: unknown) {
        if (error instanceof Error) {
            throw new Error(`${error.message}`)
        } else {
            throw new Error(`Erreur inattendue ${error}`)
        }
    }
    // finally {
    //     if (conn) conn.end()
    // }
}