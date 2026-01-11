import type { Params, DbResult, BuildQuery } from '../definitions/Queries.ts'

import mariadb from 'mariadb'
import * as validate from './validate.ts'
import * as build from './build.ts'
import { pool } from '../../config/db.init.ts'

/*********************************************************
ÉXÉCUTION REQUÊTE SELECT
*********************************************************/

export async function runQuerySelect(params: Params): Promise<DbResult> {
    let conn

    try {
        let checkParams: DbResult

        // Validation des liens de parenté entre les tables
        validate.checkRelationShip(params.mainTable, params.joinTables)

        // Validation des colonnes
        validate.checkColumnsParams(params.mainTable, params.joinTables)

        // Validation des Paramètres (clause WHERE)
        if (params.where && params.where.length > 0) {
            checkParams = validate.checkWhereParams(params.where)
            if (!checkParams.success) {
                checkParams.message += ' -> runQuerySelect()'
                return checkParams
            }
        }

        // Validation du tri (clause ORDER)
        if (params.order && params.order.length > 0) {
            checkParams = validate.checkOrderParams(params.order)
            if (!checkParams.success) {
                checkParams.message += ' -> runQuerySelect()'
                return checkParams
            }
        }

        // Construction de la requête SQL
        const sql: BuildQuery = build.buildQuerySelect(params)

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

/*********************************************************
ÉXÉCUTION REQUÊTE INSERT INTO
*********************************************************/

export async function runQueryInsert(params: Params): Promise<DbResult> {
    let conn
    
    try {
        // Validation des données (body)
        const checkParams = validate.checkBodyParams(params)
        if (!checkParams.success) return checkParams

        // Construction de la requête SQL
        const sql: DbResult = build.buildQueryInsert(params)
        if (!sql.success) {
            sql.message += ' -> runQueryInsert()'
            return sql            
        }

        // Éxecution de la requête
        conn = await pool.getConnection()
        const result = await conn.query(sql.result.queryString, sql.result.queryParams)

        return {success: true, result: result}
    }
    catch(error: unknown) {
        if (error && typeof error === 'object' && 'message' in error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
            return {success: false, message: `Code ${error.code}, Violation de la contrainte d'unicité (Message: ${error.message}) -> runQueryInsert()`}             
        }
      
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> runQueryInsert()'
        throw new Error(message)
    }
    finally {
        if (conn) conn.end()
    }
}

/*********************************************************
ÉXÉCUTION REQUÊTE UPDATE
*********************************************************/

export async function runQueryUpdateById(params: Params): Promise<DbResult> {
    let conn
    
    try {
        let checkParams: DbResult

        // Validation des Paramètres (clause WHERE)
        if (!params.where || params.where.length === 0) {
            throw new Error(`Paramétrage de la fonction update : clause Where absente (params.where non renseigné)`)
        }
        
        checkParams = validate.checkWhereParams(params.where)
        if (!checkParams.success) {
            checkParams.message += ' -> runQueryUpdateById()'
            return checkParams
        }

        // Validation des données (body)
        checkParams = validate.checkBodyParams(params)
        if (!checkParams.success) return checkParams

        // Construction de la requête SQL
        const sql: DbResult = build.buildUpdateById(params)
        if (!sql.success) {
            sql.message += ' -> runQueryUpdateById()'
            return sql            
        }

        // Éxecution de la requête
        conn = await pool.getConnection()
        const result = await conn.query(sql.result.queryString, sql.result.queryParams)

        return {success: true, result: result}
    }
    catch(error: unknown) {
        if (error && typeof error === 'object' && 'message' in error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
            return {success: false, message: `Code ${error.code}, Violation de la contrainte d'unicité (Message: ${error.message}) -> runQueryUpdateById()`}             
        }
      
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> runQueryUpdateById()'
        throw new Error(message)
    }
    finally {
        if (conn) conn.end()
    }
}

/*********************************************************
ÉXÉCUTION REQUÊTE DELETE
*********************************************************/

export async function runQueryDeleteById(params: Params): Promise<DbResult> {
    let conn 
    try {
        // Validation des Paramètres (clause WHERE)
        if (!params.where || params.where.length === 0) {
            throw new Error(`Paramétrage de la fonction delete : clause Where absente (params.where non renseigné)`)
        }
        
        const checkParams = validate.checkWhereParams(params.where)
        if (!checkParams.success) {
            checkParams.message += ' -> runQueryDeleteById()'
            return checkParams
        }
        
        // Construction de la requête SQL
        const sql: BuildQuery = build.buildQueryDeleteById(params)

        // Éxecution de la requête
        conn = await pool.getConnection()
        const result = await conn.query(sql.queryString, sql.queryParams)

        return {success: true, result: result}
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> runQueryDeleteById()'
        throw new Error(message)
    }
    finally {
        if (conn) conn.end()
    }
}


