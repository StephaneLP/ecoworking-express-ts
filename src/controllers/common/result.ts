import express from 'express'
import type { TableName } from '../../config/db.tables.ts'
import type { Params } from '../../orm/definitions.ts'
import { logRequest, logError } from '../../utils/log.ts'
import {isParent, hasChildren} from '../../orm/db.ts'

/*********************************************************
MISE EN FORME DE LA RÉPONSE DE LA REQUÊTE
*********************************************************/

export function formatResponse(params: Params, result: any) {
    let msg: string
    
    try {
        if(!params.nestTables || !Array.isArray(result)) return result
        
        const mainTable = params.mainTable
        const joinTables = params.joinTables
        const mainTableName = mainTable.model.tableName
        const arrResult: any[] = []
        const mainStack: any[] = []
        const joinStack = {} as {[key in TableName]: string[]}
        let mainBuildKey: number | string, joinBuildKey: number | string
        let joinTableName: TableName, key: any, datas: any, lineTemp: any = {}
        
        // Initialisation de la pile contenant les données jointes (tables enfants) déjà ajoutées
        if (joinTables) {
            for (let table of joinTables) {
                if (isParent(mainTableName, table.model.tableName)) joinStack[table.model.tableName] = []
            }            
        }


        for (let line of result) {
            // Récupération de la clé buildKey dans la réponse dbRes (undefined si absente)
            mainBuildKey = line[mainTableName].buildKey

            // Les données de la mainTable n'ont pas encore été ajoutés à la réponse
            if (!mainStack.includes(mainBuildKey)) {
                datas = {...line[mainTableName]}
                if (mainBuildKey) mainStack.push(mainBuildKey)

                // Parcours des données des tables jointes
                if (joinTables) {
                    for (let table of joinTables) {
                        joinTableName = table.model.tableName
                        joinBuildKey = line[joinTableName].buildKey

                        if (joinBuildKey === null) continue
                        if (!isParent(mainTableName, joinTableName)) {
                            datas[joinTableName] = {...line[joinTableName]}
                        }
                        else {
                            datas[joinTableName] = [{...line[joinTableName]}]
                            joinStack[joinTableName].push([mainBuildKey, joinBuildKey].join())
                            delete datas[joinTableName][0].buildKey
                        }
                    }
                }

                arrResult.push(datas)
            }
            // Les données de la mainTable ont déjà été ajoutée à la réponse
            else {
                // Parcours des données des tables jointes
                if (joinTables) {
                    for (let table of joinTables) {
                        joinTableName = table.model.tableName
                        joinBuildKey = line[joinTableName].buildKey

                        // La table jointe est enfant et les données n'ont pas encore été ajoutées
                        if (joinBuildKey && !joinStack[joinTableName].includes([mainBuildKey, joinBuildKey].join())) {
                            key = arrResult.findIndex((el) => el['buildKey'] === mainBuildKey)
                            lineTemp = {...line[joinTableName]}
                            delete lineTemp.buildKey
                            arrResult[key][joinTableName].push(lineTemp)
                            joinStack[joinTableName].push([mainBuildKey, joinBuildKey].join())
                            lineTemp = {}
                        }
                    }
                }
            }
            datas = {}
        }

        // Suppression des clés buildKey
        arrResult.forEach(line => delete line.buildKey)

        return arrResult
    }
    catch(error: unknown) {
        msg = (error instanceof Error ? error.message : String(error)) + ' -> formatResponse()'
        throw new Error(msg)
    }
}

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
