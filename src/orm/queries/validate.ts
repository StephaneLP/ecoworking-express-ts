import type { TableName } from '../../config/db.tables.ts'
import type { Table, JoinTables, WhereParams, OrderParams, DbResult } from '../definitions/Queries.ts'
import type { DbRelations } from '../definitions.ts'
import type { TableColumnsProperties } from '../definitions/Models.ts'
import {dbRelations, isParent, hasChildren} from '../db/db.relations.ts'

/*********************************************************
VÉRIFICATION DES LIENS DE PARENTÉ ENTRE LES TABLES
(REQUÊTES SELECT)
*********************************************************/

export function checkRelationShip(mainTable: Table, joinTables: JoinTables): void {
    let msg: string, joinTableName: TableName

    try {
        const mainTableName = mainTable.model.tableName
        if (!dbRelations[mainTableName]) {
            msg = `Erreur modèle relationnel (table principale ${mainTableName} absente de l'initialisation du modèle relationnel : voir objet dbRelations)`
            throw new Error(msg)
        }

        if (joinTables && joinTables.length > 0) {
            for (let table of joinTables) {
                joinTableName = table.model.tableName
                if (!dbRelations[mainTableName][joinTableName]) {
                    msg = `Erreur modèle relationnel (table jointe ${joinTableName} absente des tables liées à la table ${mainTableName} : voir objet dbRelations)`
                    throw new Error(msg)
                }            
            }
        }
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> checkRelationShip()'
        throw new Error(message)
    }
}

/*********************************************************
VÉRIFICATION DES PARAMÈTRES DE LA CLAUSE WHERE
(REQUÊTES SELECT)
*********************************************************/

export function checkWhereParams(params: WhereParams): DbResult {
    let msg: string
    
    try {
        let constraints: TableColumnsProperties, value: string | number | boolean

        for (let param of params) {
            constraints = param.model.tableColumns[param.column]

            if(!constraints) {
                msg = `Colonne ${param.column} absente du modèle ${param.model.tableName}`
                throw new Error(msg)
            }

            for (let i in param.values) {
                value = param.values[i]

                if (typeof value !== 'string') continue

                switch (constraints.type) {
                    case 'integer':
                        if (!stringAsInteger(value)) {
                            msg = `Erreur type de donnée (colonne ${param.column} du modèle ${param.model.tableName}) : type integer attendu -> checkWhereParams()`
                            return {success: false, message: msg}
                        }
                        param.values[i] = Number(value)
                        break
                    case 'string':
                        if (!constraints.length) {
                            msg = `Erreur propriété length absente (colonne ${param.column} du modèle ${param.model.tableName}) -> checkWhereParams()`
                            throw new Error(msg)
                        }
                        if (value.length > constraints.length) {
                            msg = `Erreur longueur (colonne ${param.column} du modèle ${param.model.tableName}) : string longueur max <= ${constraints.length} -> checkWhereParams()`
                            return {success: false, message: msg}
                        }
                        break
                    case 'boolean':
                        if (!stringAsBoolean(value)) {
                            msg = `Erreur type de donnée (colonne ${param.column} du modèle ${param.model.tableName}) : type boolean attendu -> checkWhereParams()`
                            return {success: false, message: msg}
                        }
                        param.values[i] = (['1', 'true'].includes(value.toLowerCase()) ? 1 : 0)
                        break
                }
            }
        }
        
        return {success: true}
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> checkWhereParams()'
        throw new Error(message)
    }
}

/*********************************************************
VÉRIFICATION DES PARAMÈTRES DE LA CLAUSE ORDER BY
(REQUÊTES SELECT)
*********************************************************/

export function checkOrderParams(params: OrderParams): DbResult {
    let msg: string

    try {
        for (let condition of params) {
            if (!condition.model.tableColumns[condition.column]) {
                msg = `Colonne de tri '${condition.column}' absente du modèle ${condition.model.tableName} -> checkOrderParams`
                return {success: false, message: msg}
            }
            condition.dir = (condition.dir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')            
        }

        return {success: true}
    }
    catch(error) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> checkOrderParams()'
        throw new Error(message)
    }
}

function throwError(error: unknown, fctName: string) {
    const message: string = (error instanceof Error ? error.message : String(error)) + ' -> checkOrderParams()'
    throw new Error(message)
}

/*********************************************************
VÉRIFICATION DES DONNÉES : REQUÊTES CREATE, UPDATE & DELETE
(1 TABLE DANS LA CLAUSE SQL FROM)
*********************************************************/

// // Paramètre reçu via l'url (URI PARAM)
// const checkURIParam = (params) => {
//     const URIParam = params.URIParam

//     if (!URIParam[3]) {
//         return {success: false, msg: 'La chaîne URIParameter est vide'}
//     }
//     try {
//         const constraints = URIParam[0].tableColumns[URIParam[1]]
//         const dataType = constraints.type

//         switch (dataType) {
//             case 'integer':
//                 if (!stringAsInteger(URIParam[3])) {
//                     return {success: false, functionName: 'validate.checkURIParam', msg: `Erreur type de donnée (colonne '${URIParam[1]}', type 'integer' attendu)`}
//                 }
//                 URIParam[3] = Number(URIParam[3])
//                 break
//             case 'string':
//                 if (URIParam[3].length > constraints.length) {
//                     return {success: false, functionName: 'validate.checkURIParam', msg: `Erreur longueur (colonne '${URIParam[1]}', longueur max : ${constraints.length})`}
//                 }
//                 break
//         }

//         return {success: true}
//     }
//     catch(err) {
//         throw new Error(`validate.checkURIParam - ${err.name} (${err.message})`)
//     }
// }

// // Paramètres reçus via le corps de la requête HTTP (BODY PARAMS)
// const checkBodyParams = (params) => {
//     const bodyParams = params.bodyParams
//     const model = params.table

//     try {
//         let value, constraints

//         for (let column in bodyParams) {
//             constraints = model.tableColumns[column]
//             if(!constraints) {
//                 return {success: false, functionName: 'validate.checkBodyParams', msg: `Colonne '${column}' absente du modèle`}
//             }
//             value = bodyParams[column]
//             if (value === null) {
//                 if (!constraints.nullAuthorized) return {success: false, functionName: 'validate.checkBodyParams', msg: `Colonne '${column}', valeur null non autorisée`}
//                 continue
//             }
//             switch (constraints.type) {
//                 case 'integer':
//                     if (typeof value !== 'number') {
//                         return {success: false, functionName: 'validate.checkBodyParams', msg: `Erreur type de donnée (colonne '${column}', type 'number' attendu)`}
//                     }
//                     if (!stringAsInteger(String(value))) {
//                         return {success: false, functionName: 'validate.checkBodyParams', msg: `Erreur type de donnée (colonne '${column}', type 'integer' attendu)`}
//                     }
//                     break
//                 case 'string':
//                     if (typeof value !== 'string') {
//                         return {success: false, functionName: 'validate.checkBodyParams', msg: `Erreur type de donnée (colonne '${column}', type 'string' attendu)`}
//                     }
//                     if (value.length > constraints.length) {
//                         return {success: false, functionName: 'validate.checkBodyParams', msg: `Erreur longueur (colonne '${column}', longueur max : ${constraints.length})`}
//                     }
//                     if(!constraints.emptyAuthorized && value === '') {
//                         return {success: false, functionName: 'validate.checkBodyParams', msg: `Erreur longueur (colonne '${column}', colonne vide non autorisée)`}
//                     }
//                     break
//                 case 'boolean':
//                     if (![0,1,true,false].includes(value)) {
//                         return {success: false, functionName: 'validate.checkBodyParams', msg: `Erreur type de donnée (colonne '${column}', type 'boolean' attendu)`}
//                     }
//                     bodyParams[column] = Number(value) // true => 1, false => 0
//                     break
//                 case 'date':
//                     if (isNaN(Date.parse(value))) {
//                         return {success: false, functionName: 'validate.checkBodyParams', msg: `Erreur type de donnée (colonne '${column}', type 'date' attendu / date invalide)`}
//                     }
//                     bodyParams[column] = new Date(value)
//                     break
//             }
//         }

//         return {success: true}
//     }
//     catch(err) {
//         throw new Error(`validate.checkBodyParams - ${err.name} (${err.message})`)
//     }
// }

/*********************************************************
OUTILS
*********************************************************/

// Vérification qu'une variable string représente un entier positif
function stringAsInteger(str: unknown): boolean {
    const numbers = ['0','1','2','3','4','5','6','7','8','9']

    if (typeof str !== 'string') return false
    for (let el of str) {
        if (!numbers.includes(el)) return false
    }
    return true
}

// Vérification qu'une variable string représente un booléen
export function stringAsBoolean(str: unknown): boolean {
    if (typeof str !== 'string') return false
    return ['0','1','true','false'].includes(str.toLowerCase())
}