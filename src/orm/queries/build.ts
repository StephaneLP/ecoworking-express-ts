import type { Params, DbResult, BuildQuery } from '../definitions/Queries.ts'
import {dbRelations, isParent, hasChildren} from '../db/db.relations.ts'
import {op, getPKColumn} from '../db/db.tools.ts'

/*********************************************************
CONSTRUCTION REQUÊTE SELECT
*********************************************************/

export function buildQuerySelect(params: Params): BuildQuery {
    // SELECT : liste des colonnes
    const reqColumns = buildColumnsList(params).join(', ')

    // FROM : tables et jointures
    const reqFROM = buildFromConditions(params)
console.log('STOP', reqFROM)
    // WHERE : liste des conditions et tableau des valeurs
    // const conditions = buildWhereConditions(params)
    // const arrParams = [...conditions.params]
    // const reqConditions = [...conditions.conditions].join(' AND ')
    // const reqWhere = reqConditions ? ` WHERE ${reqConditions}` : ''
    // ORDER : tri
    // const reqOrder = ` ORDER BY ${[...buildSortConditions(params)].join(', ')}`

    // return {queryString: `SELECT ${reqColumns} FROM ${reqFROM}${reqWhere}${reqOrder}`, queryParams: arrParams}
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
*********************************************************/

function buildColumnsList (params: Params): string[] {
    const mainTable = params.mainTable
    const joinTables = params.joinTables
    const arrColumns: string[] = []

    // Table principale
    const mainTableName = mainTable.model.tableName
    for (let column of mainTable.columns) {
        arrColumns.push(`${mainTableName}.${column}`)
    }

    // Ajout de la clé primaire en tant que 'buildKey' pour la mise en forme JSON si tables enfants jointes    
    if (joinTables && hasChildren(mainTable.model.tableName, joinTables)) {
        const mainTablePK = getPKColumn(mainTable.model.tableColumns)
        arrColumns.push(`${mainTableName}.${mainTablePK} AS buildKey`)
    }

    // Tables jointes (facultatives)
    if (joinTables) {
        for (let table of joinTables) {
            const tableName = table.model.tableName

            for (let column of table.columns) {
                arrColumns.push(`${tableName}.${column}`)
            }

            // Ajout de la clé primaire en tant que 'buildKey' pour la mise en forme JSON si tables enfants jointes
            if (isParent(mainTable.model.tableName, table.model.tableName)) {
                const joinTablePK = getPKColumn(table.model.tableColumns)
                arrColumns.push(`${tableName}.${joinTablePK} AS buildKey`)
            }
        }
    }
    
    return arrColumns
}

/*********************************************************
CONSTRUCTION CLAUSES
*********************************************************/

// // clause FROM
function buildFromConditions (params: Params): string {
    const mainTable = params.mainTable
    const joinTables = params.joinTables
    const mainTableName = mainTable.model.tableName
    let tableList: string, condition, tableName

    tableList = mainTableName
    
    for (let joinTable of joinTables) {
        tableName = joinTable[0].tableName
        condition = dbRelations[mainTableName][tableName][1]
        tableList += ` LEFT JOIN ${tableName} ON ${condition}`
    }

    return tableList
}

// // Clause WHERE
// const buildWhereConditions = (params)  => {
//     const arrParams = [], arrPattern = [], arrConditions = []
//     let value, pattern

//     for (let param of params.queryParams) {
//         switch (param[2]) { // Opérateur
//             case op.like:
//                 value = param[3][0] // Tableau des valeurs (1 élément)
//                 value = value.replace('%', '\\%')       
//                 value = value.replace('_', '\\_')
//                 value = param[4].replace('?', value)
//                 arrParams.push(value)
//                 pattern = '?'
//                 break
//             case op.in:
//                 param[3].forEach(e => {
//                     arrPattern.push('?')
//                     arrParams.push(e)
//                 })
//                 pattern = `(${arrPattern.join()})`
//                 arrPattern.length = 0
//                 break
//             default:
//                 value = param[3][0]
//                 arrParams.push(value)
//                 pattern = '?'
//         }
    
//         arrConditions.push(`${param[0].tableName}.${param[1]} ${param[2]} ${pattern}`)
//     }

//     return {conditions: arrConditions, params: arrParams}
// }

// // Clause ORDER
// const buildSortConditions = (params) => {
//     const arrOrder = []
//     for (let condition of params.orderParams) {
//         arrOrder.push(`${condition[0].tableName}.${condition[1]} ${condition[2]}`)
//     }

//     return arrOrder
// }
