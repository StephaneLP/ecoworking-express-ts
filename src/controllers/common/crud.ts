import express from 'express'
import type { Params } from '../../orm/definitions.ts'
import * as queries from '../../orm/queries.ts'
import { sendResult, sendError, formatResponse } from './result.ts'

/*********************************************************
READ
*********************************************************/

export async function readRecords(res: express.Response, params: Params, callingFunction: string): Promise<void> {
    let msg: string
    
    try {
        const dbRes = await queries.runQuerySelect(params)

        if (!dbRes.success) {
            msg = (dbRes.message ? dbRes.message : 'Erreur inattendue') + ' -> readRecords()'
            return sendError(res, 400, 'Erreur Requête', msg)
        }

        const formatDbRes: any[] = formatResponse(params, dbRes.result)
        sendResult(res, 200, callingFunction, 'Requête exécutée avec succès', dbRes.result.length, formatDbRes)
    }
    catch(error: unknown) {
        msg = (error instanceof Error ? error.message : String(error)) + ' -> readRecords()'
        throw new Error(msg)
    }
}

export async function readRecordsById(res: express.Response, params: Params, callingFunction: string): Promise<void> {
    let msg: string
    
    try {
        const dbRes = await queries.runQuerySelect(params)

        if (!dbRes.success) {
            msg = (dbRes.message ? dbRes.message : 'Erreur inattendue') + ' -> readRecordsById()'
            return sendError(res, 400, 'Erreur Requête', msg)
        }

        if (dbRes.result.length ===0) {
            return sendError(res, 404, 'Aucun résultat n\'a été trouvé pour cet Id', 'La requête a retourné un tableau vide')            
        }

        const formatDbRes: any[] = formatResponse(params, dbRes.result)
        sendResult(res, 200, callingFunction, 'Requête exécutée avec succès', dbRes.result.length, formatDbRes)
    }
    catch(error: unknown) {
        msg = (error instanceof Error ? error.message : String(error)) + ' -> readRecordsById()'
        throw new Error(msg)
    }
}

/*********************************************************
CREATE
*********************************************************/

export async function createRecord(res: express.Response, params: Params, callingFunction: string): Promise<void> {
    let msg: string

    try {
        const dbRes = await queries.runQueryInsert(params)

        if (!dbRes.success) {
            msg = (dbRes.message ? dbRes.message : 'Erreur inattendue') + ' -> createRecord()'
            return sendError(res, 400, 'Erreur Requête', msg)                      
        }

        if (dbRes.result.affectedRows === 0) {
            msg = `La ligne n'a pas pu être créée -> createRecord()`
            return sendError(res, 404, 'Erreur Requête', msg)
        }

        const plural = (Number(dbRes.result.affectedRows) > 1 ? 's' : '')
        sendResult(res, 200, callingFunction, `${dbRes.result.affectedRows} ligne${plural} créée${plural}`, dbRes.result.affectedRows, [])
    }
    catch(error: unknown) {
        msg = (error instanceof Error ? error.message : String(error)) + ' -> createRecord()'
        throw new Error(msg)
    }
}

/*********************************************************
UPDATE
*********************************************************/

export async function updateRecordById(res: express.Response, params: Params, callingFunction: string): Promise<void> {
    let msg: string

    try {
        const dbRes = await queries.runQueryUpdateById(params)

        if (!dbRes.success) {
            msg = (dbRes.message ? dbRes.message : 'Erreur inattendue') + ' -> updateRecordById()'
            return sendError(res, 400, 'Erreur Requête', msg)                      
        }

        if (dbRes.result.affectedRows === 0) {
            msg = `La ligne n'a pas pu être modifiée -> updateRecordById()`
            return sendError(res, 404, 'Erreur Requête', msg)
        }

        const plural = (Number(dbRes.result.affectedRows) > 1 ? 's' : '')
        sendResult(res, 200, callingFunction, `${dbRes.result.affectedRows} ligne${plural} modifiées${plural}`, dbRes.result.affectedRows, [])
    }
    catch(error: unknown) {
        msg = (error instanceof Error ? error.message : String(error)) + ' -> updateRecordById()'
        throw new Error(msg)
    }
}

/*********************************************************
DELETE
*********************************************************/

export async function deleteRecordById(res: express.Response, params: Params, callingFunction: string): Promise<void> {
    let msg: string
    
    try {
        const dbRes = await queries.runQueryDeleteById(params)

        if (!dbRes.success) {
            msg = (dbRes.message ? dbRes.message : 'Erreur inattendue') + ' -> deleteRecordById()'
            return sendError(res, 400, 'Erreur Requête', msg)
        }

        if (dbRes.result.affectedRows === 0) {
            msg = `La ligne n'a pas pu être supprimée, (id: ${params.where[0].values[0]})` + ' -> deleteRecordById()'
            return sendError(res, 404, 'Erreur Requête', msg)
        }

        const plural = (Number(dbRes.result.affectedRows) > 1 ? 's' : '')
        sendResult(res, 200, callingFunction, `${dbRes.result.affectedRows} ligne${plural} supprimée{plural}`, dbRes.result.affectedRows, [])
    }
    catch(error: unknown) {
        msg = (error instanceof Error ? error.message : String(error)) + ' -> deleteRecordById()'
        throw new Error(msg)
    }
}
