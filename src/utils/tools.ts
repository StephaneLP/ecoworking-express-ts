// La fonction parseQuery() reçoit en paramètre l'objet Request.query, dont les valeurs
// sont de type string|string[]|ParsedQs[]|ParsedQs[]|undfefined (typés comme any)
// 1. Seules les valeurs de type string ou string[] sont retenues
// 2. Les valeurs reçues sont simples ou multiples (array ou string avec séparateur ',')
// 3. La fonction trim() est appliquées, les valeurs vides sont supprimées

type ObjReqQuery = {[key: string]: any}
type ObjQuery = {[key: string]: string}

export function parseQuery(obj: ObjReqQuery): ObjQuery {
    const result: ObjQuery = {}
    let arrValue: string[] = []

    Object.entries(obj).forEach(([key, value]) => {
        // Transforme les valeurs d'une clé en un tableau de valeurs distinctes (sans le séparateur ',')
        if (typeof value === 'string') arrValue = value.split(',')
        if (Array.isArray(value)) {
            value.forEach(e => {
                arrValue = arrValue.concat(e.split(','))
            })
        }

        // Retire les valeurs vides. Un tableau vide n'est pas ajouté
        arrValue = arrValue.filter(e => e.trim() !== '')
        if (arrValue.length > 0) result[key] = arrValue.join()

        arrValue = []
    })

    return result
}

import type { ReadAllParams } from '../orm/export.ts'
export function initQueryParams(): ReadAllParams {
    const query: ReadAllParams = {
        tables: {
            mainTable: [{
                tableName: 'city',
                tableColumns: {}
            }, ['']],
            joinTables: [[{
                tableName: 'city',
                tableColumns: {}
            }, ['']]]
        },
        filter: [
            [{
                tableName: 'city',
                tableColumns: {}
            }, '', '', ['']]
        ],
        order: [
            [{
                tableName: 'city',
                tableColumns: {}
            }, '', '']
        ]
    }
    return query
}