// La fonction parseQuery() reçoit en paramètre l'objet Request.query, dont les valeurs
// sont de type string|string[]|ParsedQs|ParsedQs[]|undfefined (typés comme any)
// 1. Seules les valeurs de type string ou string[] sont retenues
// 2. Les valeurs reçues sont simples ou multiples (array ou string avec séparateur ',')
// 3. La fonction trim() est appliquées, les valeurs vides sont supprimées

import type { ReqQuery, ParsedQuery } from './definitions.ts'
import { stringAsBoolean } from '../../orm/queries/validate.ts'

export function parseQuery(query: ReqQuery): ParsedQuery {
    const result: ParsedQuery = {}
    let arrValue: string[] = []

    Object.entries(query).forEach(([key, value]) => {
        // Transforme les valeurs d'une clé en un tableau de valeurs distinctes (sans le séparateur ',')
        if (typeof value === 'string') arrValue = value.split(',')
        if (Array.isArray(value)) {
            value.forEach(e => {
                if (typeof e === 'string') arrValue = arrValue.concat(e.split(','))
            })
        }

        // Retire les valeurs vides. Un tableau vide n'est pas ajouté
        arrValue = arrValue.filter(e => e.trim() !== '')
        if (arrValue.length > 0) result[key] = arrValue.join()

        arrValue = []
    })

    return result
}

export function setNestTables(query: ParsedQuery): boolean {
    let response: boolean

    // Valeur par défaut : faux si DB_DEFAULT_NEST_FORMAT existe et est false ou 0, vrai autrement
    const envParam = process.env.DB_DEFAULT_NEST_FORMAT
    const defaultValue = !(envParam && stringAsBoolean(envParam) && (['false', '0'].includes(envParam)))

    // Valeur transmise par query params
    const queryParam = query.nest_tables
    if(queryParam && stringAsBoolean(queryParam)) return (['true', '1'].includes(queryParam) ? true : false)

    return defaultValue
}