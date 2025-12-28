import express from 'express'
import { logRequest, logError } from '../../utils/log.ts'
// const {isParent, hasChildren} = require('../../config/db.params')

/*********************************************************
MISE EN FORME DE LA RÉPONSE DE LA REQUÊTE
*********************************************************/

// const formatResponse = (params, dbRes) => {
//     const mainTable = params.tables.mainTable
//     const joinTables = params.tables.joinTables
//     const mainTableName = mainTable[0].tableName
//     const arrResult = [], mainStack = [], joinStack = {}
//     let joinTableName, datas, mainBuildKey, joinBuildKey, key, lineTemp = {}

//     // Initialisation de la pile contenant les données jointes (tables enfant) déjà ajoutées
//     for (let table of joinTables) {
//         if (isParent(mainTableName, table[0].tableName)) joinStack[table[0].tableName] = []
//     }

//     for (let line of dbRes) {
//         // Récupération de la clé buildKey dans la réponse dbRes (undefined si absente)
//         mainBuildKey = line[mainTableName].buildKey

//         // Les données de la mainTable ont déjà été ajoutée à la réponse
//         if (mainStack.includes(mainBuildKey)) {
//             // Parcours des données des tables jointes
//             for (let table of joinTables) {
//                 joinTableName = table[0].tableName
//                 joinBuildKey = line[joinTableName].buildKey

//                 // La table jointe est enfant et les données n'ont pas encore été ajoutées
//                 if (joinBuildKey && !joinStack[joinTableName].includes([mainBuildKey, joinBuildKey].join())) {
//                     key = arrResult.findIndex((el) => el['buildKey'] === mainBuildKey)
//                     lineTemp = {...line[joinTableName]}
//                     delete lineTemp.buildKey
//                     arrResult[key][joinTableName].push(lineTemp)
//                     joinStack[joinTableName].push([mainBuildKey, joinBuildKey].join())
//                     lineTemp = {}
//                 }
//             }
//         }
//         // Les données de la mainTable n'ont pas encore été ajoutés à la réponse
//         else {
//             datas = {...line[mainTableName]}
//             if (mainBuildKey) mainStack.push(mainBuildKey)

//             // Parcours des données des tables jointes
//             for (let table of joinTables) {
//                 joinTableName = table[0].tableName
//                 joinBuildKey = line[joinTableName].buildKey

//                 if (joinBuildKey === null) continue
//                 if (!isParent(mainTableName, joinTableName)) {
//                     datas[joinTableName] = {...line[joinTableName]}
//                 }
//                 else {
//                     datas[joinTableName] = [{...line[joinTableName]}]
//                     joinStack[joinTableName].push([mainBuildKey, joinBuildKey].join())
//                     delete datas[joinTableName][0].buildKey
//                 }
//             }

//             arrResult.push(datas)
//         }

//         datas = {}
//     }

//     // Suppression des clés buildKey
//     arrResult.forEach(line => delete line.buildKey)

//     return arrResult
// }

/*********************************************************
REPONSES RETOURNÉES AU CLIENT - LOG DES REQUÊTES ET ERREURS
*********************************************************/

export function sendResult(res: express.Response, code: number, fct: string, message: string, nbRows: number, data: any) {
    res.status(code).json({status: 'success', code: code, message: message, nb_rows: nbRows, data: data})
    logRequest(`Code : ${code} ; Fonction : ${fct} ; Message : ${message} (nb lignes: ${nbRows})`)
}

export function sendError(res: express.Response, code: number, frontMessage: string, logMessage: string) {
    res.status(code).json({status: 'error', code: code, message: frontMessage})
    logError(`Code : ${code} ; Message : ${frontMessage}${logMessage ? ` [${logMessage}]` : ''}`) 
}
