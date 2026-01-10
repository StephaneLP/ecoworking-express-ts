import type { TableName } from '../../config/db.tables.ts'
import type { Params, DbResult, BuildQuery, JoinType } from '../definitions/Queries.ts'
import type { Model, TableColumnsProperties } from '../definitions/Models.ts'
import {dbRelations, isParent, hasChildren} from '../db/db.relations.ts'
import {op, getPKColumn} from '../db/db.tools.ts'

/*********************************************************
CONSTRUCTION REQUÊTE SELECT
*********************************************************/

export function buildQuerySelect(params: Params): BuildQuery {
    try {
        // SELECT : liste des colonnes
        const queryColumns = buildColumnsList(params).join(', ')

        // FROM : tables et jointures
        const queryFROM = buildFromConditions(params)

        // WHERE : liste des conditions et tableau des valeurs
        const whereConditions = buildWhereConditions(params)
        const queryWHERE = (whereConditions.conditions.length > 0 ? ` WHERE ${whereConditions.conditions.join(' AND ')}` : '')
        const queryParams = whereConditions.params

        // ORDER : tri
        const orderConditions = buildOrderConditions(params)
        const queryOrder = (orderConditions.length > 0 ? ` ORDER BY ${orderConditions.join(', ')}` : '')

        return {queryString: `SELECT ${queryColumns} FROM ${queryFROM}${queryWHERE}${queryOrder}`, queryParams: queryParams}
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> buildQuerySelect()'
        throw new Error(message)
    }
}

/*********************************************************
CONSTRUCTION REQUÊTE INSERT INTO
*********************************************************/

export function buildQueryInsert(params: Params): DbResult {
    try {
        const model = params.model
        const arrColumns: string[] = [], arrPattern: string[] = []
        const arrParams: Array<string | number | boolean | Date> = []
        let constraints: TableColumnsProperties, value: string | number | boolean | null
        let msg: string

        for(let column in model.tableColumns) {
            constraints = model.tableColumns[column]
            value = params.body[column] === undefined ? null : params.body[column]

            if (constraints.autoIncrement) continue
            if (!constraints.nullAuthorized && value === null) {
                msg = `Colonne '${column}' : valeur nulle non autorisée (modèle ${model.tableName}) -> buildQueryInsert()`
                return {success: false, message: msg}
            }

            arrColumns.push(column)
            if (value) arrParams.push(value)
            arrPattern.push('?')
        }

        // Date de création
        if (model.dateColumns && model.dateColumns.createDate) {
            const dateCrea = model.dateColumns.createDate
            arrColumns.push(dateCrea)
            arrParams.push(new Date())
            arrPattern.push('?')
        }

        const result = {queryString: `INSERT INTO ${model.tableName} (${arrColumns.join()}) VALUES (${arrPattern.join()})`, queryParams: arrParams}
        return {success: true, result: result}
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> buildQueryInsert()'
        throw new Error(message)
    }
}

/*********************************************************
CONSTRUCTION REQUÊTE UPDATE
*********************************************************/

// const sqlUpdateById = (params) => {
//     const arrColumns = [], arrParams = []
//     const URIParam = params.URIParam
//     const model = params.table

//     // Colonnes mises à jour
//     for(let column in params.bodyParams) {
//         arrColumns.push(`${column}=?`)
//         arrParams.push(params.bodyParams[column])
//     }

//     // Date de modification
//     const dateColumn = model.dateColumns.updateDate
//     if (dateColumn) {
//         arrColumns.push(`${dateColumn}=?`)
//         arrParams.push(new Date())
//     }

//     // Clause WHERE
//     const condition = `${URIParam[1]} ${URIParam[2]} ?`
//     arrParams.push(URIParam[3])
    
//     return {success: true, reqString: `UPDATE ${model.tableName} SET ${arrColumns.join()} WHERE ${condition}`, reqParams: arrParams}
// }

/*********************************************************
CONSTRUCTION REQUÊTE DELETE
*********************************************************/

export function buildQueryDeleteById(params: Params): BuildQuery {
    try {
        // WHERE : liste des conditions et tableau des valeurs
        const whereConditions = buildWhereConditions(params)
        const queryWHERE = ` WHERE ${whereConditions.conditions[0]}`
        const queryParams = whereConditions.params

        return {queryString: `DELETE FROM ${params.where[0].model.tableName}${queryWHERE}`, queryParams: queryParams}
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> buildQueryDeleteById()'
        throw new Error(message)
    }
}

/*********************************************************
CONSTRUCTION LISTE DES COLONNES (SELECT)
AJOUT D'UN ALIAS POUR LE RENDU DU RÉSULTAT QUAND NEST_TABLE = FALSE
*********************************************************/

function buildColumnsList(params: Params): string[] {
    try {
        const mainTable = params.mainTable
        const joinTables = params.joinTables
        const arrColumns: string[] = []
        let alias: string

        // Table principale
        const mainTableName = mainTable.model.tableName
        for (let column of mainTable.columns) {
            alias = (!params.nestTables ? ` AS '${mainTableName}.${column}'` : '')
            arrColumns.push(`${mainTableName}.${column}${alias}`)
        }

        // Ajout de la clé primaire en tant que 'buildKey' pour la mise en forme JSON si tables enfants jointes    
        if (params.nestTables && joinTables && hasChildren(mainTable.model.tableName, joinTables)) {
            const mainTablePK = getPKColumn(mainTable.model.tableColumns)
            arrColumns.push(`${mainTableName}.${mainTablePK} AS buildKey`)
        }

        // Tables jointes (facultatives)
        if (joinTables) {
            for (let table of joinTables) {
                const tableName = table.model.tableName

                for (let column of table.columns) {
                    alias = (!params.nestTables ? ` AS '${tableName}.${column}'` : '')
                    arrColumns.push(`${tableName}.${column}${alias}`)
                }

                // Ajout de la clé primaire en tant que 'buildKey' pour la mise en forme JSON si tables enfants jointes
                if (params.nestTables && isParent(mainTable.model.tableName, table.model.tableName)) {
                    const joinTablePK = getPKColumn(table.model.tableColumns)
                    arrColumns.push(`${tableName}.${joinTablePK} AS buildKey`)
                }
            }
        }
        
        return arrColumns
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> buildColumnsList()'
        throw new Error(message)
    }
}

/*********************************************************
CONSTRUCTION CLAUSES
*********************************************************/

// Clause FROM
function buildFromConditions(params: Params): string {
    try {
        const mainTable = params.mainTable
        const joinTables = params.joinTables
        const mainTableName = mainTable.model.tableName
        let clauseFrom: string, joinTableName: TableName, condition: [string, string] | undefined

        clauseFrom = mainTableName
        
        if(joinTables) {
            for (let joinTable of joinTables) {
                joinTableName = joinTable.model.tableName
                condition = dbRelations[mainTableName][joinTableName]

                if (condition) {
                    clauseFrom += ` ${joinTable.join} JOIN ${joinTableName} ON ${condition[1]}`
                }
            }        
        }

        return clauseFrom        
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> buildFromConditions()'
        throw new Error(message)
    }
}

// // Clause WHERE
function buildWhereConditions(params: Params): {conditions: string[], params: (string | number | boolean)[]} {
    try {
        const arrConditions: string[] = []
        const arrParams: Array<string | number | boolean> = []

        if (params.where) {
            const arrPattern: string[] = []
            let value: string, pattern: string

            for (let param of params.where) {
                switch (param.op) {
                    case op.like: // Tableau des valeurs : 1 élément
                        value = String(param.values[0])
                        value = value.replace('%', '\\%')       
                        value = value.replace('_', '\\_')
                        value = (param.pattern ? param.pattern.replace('?', value) : value)
                        arrParams.push(value)
                        pattern = '?'
                        break
                    case op.in: // Tableau des valeurs : plusieurs éléments
                        param.values.forEach(e => {
                            arrPattern.push('?')
                            arrParams.push(e)
                        })
                        pattern = `(${arrPattern.join()})`
                        arrPattern.length = 0
                        break
                    default: // Tableau des valeurs : 1 élément
                        // value = String(param.values[0])
                        // arrParams.push(value)
                        arrParams.push(param.values[0])
                        pattern = '?'
                }

                arrConditions.push(`${param.model.tableName}.${param.column} ${param.op} ${pattern}`)            
            }
        }
        
        return {conditions: arrConditions, params: arrParams}
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> buildWhereConditions()'
        throw new Error(message)
    }
}

// Clause ORDER
function buildOrderConditions(params: Params): string[] {
    try {
        const arrOrder: string[] = []

        if (params.order) {
            for (let condition of params.order) {
                arrOrder.push(`${condition.model.tableName}.${condition.column} ${condition.dir}`)
            }            
        }

        return arrOrder       
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> buildOrderConditions()'
        throw new Error(message)
    }
}
