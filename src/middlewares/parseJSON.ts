import type { Request, Response, NextFunction } from 'express'
import { logError } from '../utils/log.ts'

export function checkJSONSyntax (err: Error, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof SyntaxError) {
        res.status(500).json({status: 'error', code: 500, message: 'Erreur de syntaxe : les données transmises au serveur ne sont pas conformes au format JSON'})
        logError(`Code : 500 ; ${err.name}, ${err.message} -> checkJSONSyntax()`)
        return
    }
    next()
}