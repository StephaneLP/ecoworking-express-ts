import type { Request, Response, NextFunction } from 'express'

import pkg from 'jsonwebtoken'
const { sign, decode, verify } = pkg

import * as queries from '../orm/queries.ts'
import { comparePasswords } from '../utils/auth.ts'
import { parseQueryParams, parseUriParams, parseBodyParams, setNestTables} from './common/parse.ts'
import { sendResult, sendError, formatResponse } from './common/result.ts'
import { logError } from '../utils/log.ts'

/*********************************************************
[CONNEXION] 
*********************************************************/

export async function signIn(req: Request, res: Response): Promise<void> {
    let msg: string

    try {
        // Récupération de la clé privée
        const privateKey = process.env.SIGNIN_KEY
        if (!privateKey) {
            msg = `Impossible de récupérer la valeur de la variable d'environnement SIGNIN_KEY`
            throw new Error(msg)
        }

        // Récupération de la durée de validité du token
        const duration = process.env.DURATION_CONNECT_USER as any
        if (!duration) {
            msg = `Impossible de récupérer la valeur de la variable d'environnement DURATION_CONNECT_USER`
            throw new Error(msg)
        }

        // Body Parameters
        const body = parseBodyParams(req.body)

        const email = body.email || null
        const password = body.password || null

        // Vérification de la présence des paramètres dans le body
        if (!email || !password) {
            msg = 'Identifiant(body.email) et/ou mot de passe (body.password) manquant -> signIn()'
            return sendError(res, 400, 'Erreur authentification', msg)
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            msg = `Paramètre email=${email} et/ou password=${password} : type string attendu -> signIn()`
            return sendError(res, 400, 'Erreur authentification', msg)
        }

        // Requête pour trouver l'utilisateur correspondant à l'email
        const sql = 'SELECT id, nickname, email, password FROM user WHERE email=?'
        const dbRes = await queries.runQuery({queryString: sql, queryParams: [email]})

        if (!dbRes.success) {
            msg = (dbRes.message ? dbRes.message : 'Erreur inattendue') + ' -> signIn()'
            return sendError(res, 400, 'Erreur Requête', msg)                      
        }

        // Un utilisateur a-t'il été trouvé ?
        if (dbRes.result.length === 0) {
            msg = `Aucun utilisateur n'a été trouvé (email: ${email}) -> signIn()`
            return sendError(res, 401, 'Erreur Requête', msg)
        }

        // Récupération de l'Id de l'utilisateur
        const id = dbRes.result[0].id
        const nickname = dbRes.result[0].nickname

        if (!id || !nickname) {
            msg = `Impossible de récupérer l'id et/ou le pseudo de l'utilisateur corerspondant à l'identifiant ${email}`
            throw new Error(msg)            
        }

        // Le mot de passe correspond-il ? Si non message d'erreur
        const match = await comparePasswords(password, dbRes.result[0].password)
        if (!match) {
            msg = `Identifiant et/ou mot de passe incorrect -> signIn()`
            return sendError(res, 401, 'Erreur Requête', msg)
        }
        
        // Création du token et réponse au client
        const token = sign({userId: id}, privateKey, {expiresIn: duration})
        sendResult(res, 200, 'signIn', `Authentification validée (1 token envoyé)`, dbRes.result.length, [{token: token, nickname: nickname}])
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> signIn()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}

// const user = require('../models/user.model')
// const role = require('../models/role.model')
// const jwt = require("jsonwebtoken")
// const crud = require('./common/crud')
// const queries = require('../models/common/runQueries')
// const {sendResult, sendError} = require('./common/result')
// const {hashPassword, comparePasswords} = require('./common/auth')
// const {trimStringValues, checkEmailFormat, checkNickNameFormat, checkPasswordFormat} = require('../utils/tools')
// const {sendMailRegistration} = require('../utils/mail')
// const {op} = require('../config/db.params')

/*********************************************************
[INSCRIPTION] CREATE / POST / INSERT INTO
*********************************************************/

// const signUp = async (req, res) => {
//     const body = trimStringValues(req.body)

//     // Contrôle du format l'email
//     if (!checkEmailFormat(body.email)) {
//         return sendError(res, 400, 'signUp', 'Le format de l\'email est incorrect', '')    
//     }

//     // Contrôle du format du pseudo
//     if (!checkNickNameFormat(body.nickname)) {
//         return sendError(res, 400, 'signUp', 'Le format du pseudo est incorrect', '')      
//     }

//     // Contrôle du format du mot de passe
//     if (!checkPasswordFormat(body.password)) {
//         return sendError(res, 400, 'signUp', 'Le format du mot de passe est incorrect', '')        
//     }

//     // Hachage du mot de passe
//     const hash = await hashPassword(body.password)
//     if (!hash.success) {
//         return sendError(res, 500, 'createUser/hashPassword', 'Erreur Serveur', hash.msg)
//     }
//     body.password = hash.password

//     // Ajout des colonnes absentes du body (valeurs par défaut)
//     body['is_verified'] = 0
//     body['icon_color'] = `#${process.env.SIGNUP_ICON_COLOR}`
//     body['role_id'] = Number(process.env.SIGNUP_ROLE_ID)
//     body['icon_id'] = Number(process.env.SIGNUP_ICON_ID)

//     const params = {
//         table: user,
//         bodyParams: body,
//         functionName: 'signUp',
//     }

//     try {
//         const dbRes = await queries.runQueryInsert(params)

//         if (!dbRes.success) {
//             return sendError(res, 400, `${params.functionName}/${dbRes.functionName}`, 'Erreur Requête', dbRes.msg)            
//         }

//         const token = jwt.sign({userId: dbRes.result.insertId}, process.env.SIGNUP_KEY, {expiresIn: process.env.DURATION_CONNECT_USER})
//         const url = 'http://localhost:3000/inscription-confirm/' + token
//         const info = await sendMailRegistration(body.email, 'Inscription site Ecoworking', body.nickname, url, 'mailSignUp.html')
//         const message = `Un mail de confirmation a été envoyé à l'adresse suivante : ${info.accepted[0]}`

//         sendResult(res, 200, params.functionName, message, dbRes.result.affectedRows, [])
//     }
//     catch(err) {
//         sendError(res, 500, params.functionName, 'Erreur Serveur', err.message)
//     }
// }
