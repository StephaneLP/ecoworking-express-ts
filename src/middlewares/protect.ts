import type { Request, Response, NextFunction } from 'express'
import type { RoleUser } from '../config/db.tables.ts'

import pkg from 'jsonwebtoken'
const { sign, decode, verify, JsonWebTokenError } = pkg

import { sendResult, sendError, formatResponse } from '../controllers/common/result.ts'
import * as queries from '../orm/queries.ts'

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    let msg: string

    try {
        // Récupération de la clé privée
        const privateKey = process.env.SIGNIN_KEY
        if (!privateKey) {
            msg = `Impossible de récupérer la valeur de la variable d'environnement SIGNIN_KEY`
            throw new Error(msg)
        }

        if (!req.headers['authorization']) {
            msg = 'Clé authorization absente du header (req.header) -> authenticate()'
            return sendError(res, 400, 'Erreur authentification', msg) 
        }

        const token = req.headers['authorization'].split(' ')[1]
        if (!token) {
            msg = 'Token absent du champ authorization (req.header) -> authenticate()'
            return sendError(res, 400, 'Erreur authentification', msg) 
        }

        const payload = verify(token, privateKey) as { userId: any }
        res.locals['userId'] = payload['userId']

        next()
    }
    catch(error: unknown) {
        if (error instanceof JsonWebTokenError) {
            msg = 'L\'authentification a échoué, Token invalide -> authenticate()'
            return sendError(res, 401, 'Erreur authentification', msg)            
        }
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> authenticate()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}

export function authorize(roles: RoleUser[]): any {
    let msg: string

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = res.locals['userId']

            if (userId === undefined) {
                msg = `Clé userId absente du Token`
                throw new Error(msg) 
            }

            if (userId === null || (typeof userId === 'string' && userId === '')) {
                msg = `Clé userId=${userId} : valeur nulle ou vide`
                throw new Error(msg) 
            }

            // Requête pour trouver l'utilisateur correspondant à l'id userId
            const sql = 'SELECT role.code as role FROM user INNER JOIN role ON user.role_id = role.id WHERE user.id=?'
            const dbRes = await queries.runQuery({queryString: sql, queryParams: [userId]})
            const userRole = dbRes.result[0].role

            if (!roles.includes(userRole)) {
                msg = `Le role de l'utilisateur (id: ${userId}) ne permet pas d'accéder au controller`
                return sendError(res, 403, 'Erreur Autorisation : droits insuffisants', msg)
            }

            next()        
        }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> authorize()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
    }
}
