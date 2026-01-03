import type { TableName } from '../../config/db.tables.ts'
import type { Params, DbResult, BuildQuery, JoinType } from '../definitions/Queries.ts'
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

// const sqlSelectById = (params) =>  {
//     // SELECT : liste des colonnes
//     let reqColumns = '*'
//     if (params.columns) reqColumns = buildColumnsList(params).join(', ')

//     // FROM : tables et jointures
//     const reqFROM = buildFromConditions(params)

//     // WHERE : liste des conditions et tableau des valeurs
//     const URIParam = params.URIParam
//     const arrParams = [URIParam[3]]
//     const sqlWhereClause = ` WHERE ${params.URIParam[0].tableName}.${URIParam[1]} ${URIParam[2]} ?`

//     return {reqString: `SELECT ${reqColumns} FROM ${reqFROM}${sqlWhereClause}`, reqParams: arrParams}
// }

/*********************************************************
CONSTRUCTION REQUÊTE INSERT INTO
*********************************************************/

// const sqlInsert = (params) => {
//     const model = params.table
//     const arrColumns = [], arrParams = [], arrPattern = []
//     let constraints, value

//     for(let column in model.tableColumns) {
//         constraints = model.tableColumns[column]
//         value = params.bodyParams[column] === undefined ? null : params.bodyParams[column]

//         if (constraints.autoIncrement) continue
//         if (!constraints.nullAuthorized && value === null) {
//             return {success: false, functionName: 'build.sqlInsert', msg: `Colonne '${column}' : Null non autorisé`}
//         }

//         arrColumns.push(column)
//         arrParams.push(value)
//         arrPattern.push('?')
//     }

//     // Date de création
//     const dateColumn = model.dateColumns.createDate
//     if (dateColumn) {
//         arrColumns.push(dateColumn)
//         arrParams.push(new Date())
//         arrPattern.push('?')
//     }

//     return {success: true, reqString: `INSERT INTO ${model.tableName} (${arrColumns.join()}) VALUES (${arrPattern.join()})`, reqParams: arrParams}
// }

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

// const sqlDeleteById = (params) =>  {
//     const URIParam = params.URIParam
//     const arrParams = [URIParam[3]]
//     const sqlWhereClause = ` WHERE ${URIParam[1]} ${URIParam[2]} ?`

//     return {reqString: `DELETE FROM ${params.table.tableName}${sqlWhereClause}`, reqParams: arrParams}
// }

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
                        value = String(param.values[0])
                        arrParams.push(value)
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
