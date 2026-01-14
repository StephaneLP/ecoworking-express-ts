import type { Request, Response, NextFunction } from 'express'
import type { Params } from '../orm/definitions.ts'

import pkg from 'jsonwebtoken'
const { sign, decode, verify } = pkg

import * as queries from '../orm/queries.ts'
import { user } from '../models/user.model.ts'
import { comparePasswords, hashPassword } from './common/auth.ts'
import { parseQueryParams, parseUriParams, parseBodyParams, setNestTables} from './common/parse.ts'
import { sendResult, sendError, formatResponse } from './common/result.ts'
import { sendMailRegistration } from '../mailer/mail.ts'

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
            msg = `Impossible de récupérer l'id et/ou le pseudo de l'utilisateur correspondant à l'identifiant ${email}`
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

/*********************************************************
[INSCRIPTION] CREATE / POST / INSERT INTO
*********************************************************/

export async function signUp(req: Request, res: Response): Promise<void> {
    let msg: string

    try {
        // Récupération de la clé privée
        const privateKey = process.env.SIGNUP_KEY
        if (!privateKey) {
            msg = `Impossible de récupérer la valeur de la variable d'environnement SIGNUP_KEY`
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

        // Contrôle du format l'email
        if (!checkEmailFormat(body.email)) {
            msg = 'Erreur Requête : format de l\'email incorrect'
            return sendError(res, 400, msg, ' -> signUp()') 
        }

        // Contrôle du format du pseudo
        if (!checkNickNameFormat(body.nickname)) {
            msg = 'Erreur Requête : format du pseudo incorrect'
            return sendError(res, 400, msg, ' -> signUp()') 
        }

        // Contrôle du format du mot de passe
        if (!checkPasswordFormat(body.password)) {
            msg = 'Erreur Requête : format du mot de passe incorrect'
            return sendError(res, 400, msg, ' -> signUp()')       
        }

        // Hachage du mot de passe
        const hash = await hashPassword(body.password)
        body.password = hash

        // Ajout des colonnes absentes du body (valeurs par défaut)
        body['is_verified'] = 0
        body['icon_color'] = `#${process.env.SIGNUP_ICON_COLOR}`
        body['role_id'] = Number(process.env.SIGNUP_ROLE_ID)
        body['icon_id'] = Number(process.env.SIGNUP_ICON_ID)

        // Requête création de l'utilisateur
        const params = {} as Params

        params.model = user
        params.body = body

        const dbRes = await queries.runQueryInsert(params)

        if (!dbRes.success) {
            msg = (dbRes.message ? dbRes.message : 'Erreur inattendue') + ' -> signUp()'
            return sendError(res, 400, 'Erreur Requête', msg)                      
        }

        if (dbRes.result.affectedRows === 0) {
            msg = `L'utilisateur n'a pas pu être créé -> signUp()`
            return sendError(res, 404, 'Erreur Requête', msg)
        }

        const token = sign({userId: dbRes.result.insertId}, privateKey, {expiresIn: duration})
        const url = 'http://localhost:3000/inscription-confirm/' + token
        const info = await sendMailRegistration(body.email,  'Inscription site Ecoworking', body.nickname, url, 'mailSignUp.html')

        msg = `Un mail de confirmation a été envoyé à l'adresse suivante : ${info.accepted[0]}`
        sendResult(res, 200, 'signUp', msg, dbRes.result.affectedRows, [])
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> signUp()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}

/*********************************************************
OUTILS DE VÉRIFICATION
*********************************************************/

// Contrôle du format l'email
function checkEmailFormat(email: string): boolean {
    const exp = /([\w-.]+@[\w.]+\.{1}[\w]+)/
    return exp.test(email)
}

// Contrôle du format du pseudo
function checkNickNameFormat(nickname: string): boolean {
    const exp = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9]{5,}$/
    return exp.test(nickname)
}

// Contrôle du format du mot de passe
function checkPasswordFormat(password: string): boolean {
    const exp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    return exp.test(password)
}

