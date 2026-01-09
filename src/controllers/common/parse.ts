import express from 'express'
import { stringAsBoolean } from '../../orm/queries/validate.ts'
import { sendError } from './result.ts'

type IncomingRequest = {[key: string]: any}
type ParsedQueryRequest = {[key: string]: string}
type ParsedUriRequest = {[key: string]: string}
type ParsedBodyRequest = {[key: string]: any}

// La fonction parseQueryParams() reçoit en paramètre l'objet Request.query, dont les valeurs
// sont de type string|string[]|ParsedQs|ParsedQs[]|undfefined (typés comme any)
// 1. Seules les valeurs de type string ou string[] sont retenues
// 2. Les valeurs reçues sont simples ou multiples (array ou string avec séparateur ',')
// 3. La fonction trim() est appliquées, les valeurs vides sont supprimées

export function parseQueryParams(query: IncomingRequest): ParsedQueryRequest {
    const result: ParsedQueryRequest = {}
    let arrValue: string[] = []

    Object.entries(query).forEach(([key, value]) => {
        // Transforme les valeurs d'une clé en un tableau de valeurs distinctes (sans le séparateur ',')
        if (typeof value === 'string') arrValue = value.split(',')
        if (Array.isArray(value)) {
            value.forEach(e => {
                if (typeof e === 'string') arrValue = arrValue.concat(e.split(','))
            })
        }

        // Applique la fonction trim() puis retire les valeurs vides (un tableau vide n'est pas ajouté)
        arrValue = arrValue.map(e => e.trim())
        arrValue = arrValue.filter(e => e !== '')

        if (arrValue.length > 0) result[key] = arrValue.join()
        arrValue = []
    })

    return result
}

export function parseUriParams(uriParams: IncomingRequest): ParsedUriRequest {
        const result: ParsedUriRequest = {}

        for (let key in uriParams) {
            result[key] = uriParams[key].trim()
        }

        return result
}

export function parseBodyParams(objRequest: IncomingRequest): ParsedBodyRequest {
        const result: ParsedBodyRequest = {}

        for (let key in objRequest) {
            result[key] = (typeof objRequest[key] === 'string' ? objRequest[key].trim() : objRequest[key])
        }

        return result
}

export function setNestTables(query: ParsedQueryRequest): boolean {
    // Valeur par défaut : faux si DB_DEFAULT_NEST_FORMAT existe et est false ou 0, vrai autrement
    const envParam = process.env.DB_DEFAULT_NEST_FORMAT
    const defaultValue = !(envParam && stringAsBoolean(envParam) && (['false', '0'].includes(envParam)))

    // Valeur transmise par query params
    const queryParam = query.nest_tables
    if(queryParam && stringAsBoolean(queryParam)) return (['true', '1'].includes(queryParam) ? true : false)

    return defaultValue
}