import express from 'express'
import type { Params } from '../../orm/definitions.ts'
import { sendResult, sendError } from './result.ts'

export async function readRecords(callingFunction: string, params: Params, res: express.Response): Promise<void> {
    try {
    //     const dbRes = await queries.runQuerySelect(params)

    //     if (!dbRes.success) {
    //         return sendError(res, 400, `${params.functionName}/${dbRes.functionName}`, 'Erreur Requête', dbRes.msg)
    //     }

    //     const formatDbRes = Number(process.env.DB_RES_NEST_FORMAT) ? formatResponse(params, dbRes.result) : dbRes.result
        // sendResult(res, 200, callingFunction, 'Requête exécutée avec succès', dbRes.result.length, formatDbRes)
        sendResult(res, 200, callingFunction, 'Requête exécutée avec succès', 1, params)
    }
    catch(error: unknown) {
        const message: string = error instanceof Error ? `${error.message}` : `${error}`       
        sendError(res, 500, `readRecords (${callingFunction})`, 'Erreur Serveur', message)
    }
}

// export function readRecords(callingFunction: string, params: Params) {
//     return async (req: express.Request, res: express.Response) => {
//         try {
//         //     const dbRes = await queries.runQuerySelect(params)

//         //     if (!dbRes.success) {
//         //         return sendError(res, 400, `${params.functionName}/${dbRes.functionName}`, 'Erreur Requête', dbRes.msg)
//         //     }

//         //     const formatDbRes = Number(process.env.DB_RES_NEST_FORMAT) ? formatResponse(params, dbRes.result) : dbRes.result
//             // sendResult(res, 200, callingFunction, 'Requête exécutée avec succès', dbRes.result.length, formatDbRes)
//             sendResult(res, 200, callingFunction, 'Requête exécutée avec succès', 1, params)
//         }
//         catch(error: unknown) {

//             const message: string = error instanceof Error ? `${error.message}` : `${error}`
//             console.log('MESSAGE :', message)        
//             sendError(res, 500, `readRecords (${callingFunction})`, 'Erreur Serveur', message)
//         }
//     }
// }