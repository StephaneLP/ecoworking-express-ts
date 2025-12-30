import express from 'express'
import type { Params } from '../../orm/definitions.ts'
import { sendResult, sendError } from './result.ts'
import { runQuerySelect } from '../../orm/queries.ts'

export async function readRecords(res: express.Response, params: Params, callingFunction: string): Promise<void> {
    let msg: string
    
    try {
        const dbRes = await runQuerySelect(params)

        if (!dbRes.success) {
            msg = (dbRes.message ? dbRes.message : 'Erreur inattendue') +  ' -> readRecords()'
            return sendError(res, 400, 'Erreur Requête', msg)
        }

        const formatDbRes: any = dbRes.result
        sendResult(res, 200, callingFunction, 'Requête exécutée avec succès', dbRes.result.length, formatDbRes)

        // const formatDbRes = Number(process.env.DB_RES_NEST_FORMAT) ? formatResponse(params, dbRes.result) : dbRes.result
        // sendResult(res, 200, callingFunction, 'Requête exécutée avec succès', 1, dbRes)
    }
    catch(error: unknown) {
        msg = (error instanceof Error ? error.message : String(error)) + ' -> readRecords()'
        throw new Error(msg)
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