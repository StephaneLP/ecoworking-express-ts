import type { Params, WhereParams, DbResult } from '../definitions/controllers.ts'
import type { TableColumnsProperties } from '../definitions/models.ts'

/*********************************************************
VÉRIFICATION DES PARAMÈTRES DE LA CLAUSE WHERE : REQUÊTES SELECT
(1 OU PLUSIEURS TABLES DANS LA CLAUSE SQL FROM)
*********************************************************/

export function checkWhereParams(params: WhereParams) {
    try {
        let constraints: TableColumnsProperties, value: string

        for (let param of params) {
            constraints = param[0].tableColumns[param[1]]
            if(!constraints) {
                return {success: false, functionName: 'checkQueryParams', message: `Colonne ${param[1]} absente du modèle ${param[0].tableName} -> checkWhereParams()`}
            }
            for (let i in param[3]) {
                value = param[3][i]

                switch (constraints.type) {
                    case 'integer':
                        if (!stringAsInteger(value)) {
                            return {success: false, message: `Erreur type de donnée (colonne ${param[1]} du modèle ${param[0].tableName}) : type integer attendu) -> checkWhereParams()`}
                        }
                        // param[3][i] = Number(value)
                        break
                    case 'string':
                        if (value.length > constraints.length) {
                            return {success: false, message: `Erreur longueur (colonne ${param[1]} du modèle ${param[0].tableName}) : string longueur max <= ${constraints.length}) -> checkWhereParams()`}
                        }
                        break
                    case 'boolean':
                        if (!stringAsBoolean(value)) {
                            return {success: false, message: `Erreur type de donnée (colonne ${param[1]} du modèle ${param[0].tableName}) : type boolean attendu) -> checkWhereParams()`}
                        }
                        param[3][i] = (['1', 'true'].includes(value.toLowerCase()) ? '1' : '0')
                        // param[3][i] = (['1', 'true'].includes(value.toLowerCase()) ? 1 : 0)
                        break
                }
            }
        }
        
        return {success: true}
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> readRecords()'
        throw new Error(message)
    }
}

// const checkOrderParams = (params) => {
//     try {
//         for (let condition of params.orderParams) {
//             if (!condition[0].tableColumns[condition[1]]) {
//                 return {success: false, functionName: 'validate.checkOrderParams', msg: `Colonne de tri '${condition[1]}' absente du modèle`}
//             }
//             condition[2] = (condition[2].toUpperCase() === 'DESC' ? 'DESC' : 'ASC')            
//         }

//         return {success: true}
//     }
//     catch(err) {
//         throw new Error(`validate.checkOrderParams - ${err.name} (${err.message})`)
//     }
// }

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
function stringAsInteger(str: string): boolean {
    const numbers = ['0','1','2','3','4','5','6','7','8','9']

    for (let el of str) {
        if (!numbers.includes(el)) return false
    }
    return true
}

// Vérification qu'une variable string représente un booléen
function stringAsBoolean(str: string): boolean {
    return ['0','1','true','false'].includes(str.toLowerCase())
}