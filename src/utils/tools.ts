// La fonction parseQuery() reçoit en paramètre l'objet Request.query, dont les valeurs
// sont de type string|string[]|ParsedQs[]|ParsedQs[]|undfefined (typés comme any)
// Les valeurs sont analysées : 
// 1. Seules les valeurs de type string ou string[] sont retenues
// 2. Les valeurs sont simples, multiples (array) ou multiples (avec séparateur ',') ?
// 3. La fonction trim() est appliquées, les valeurs vides sont supprimées
// 4. Les valeurs sont placées dans un tableau de type string[]

type ObjReqQuery = {[key: string]: any}
type objQuery = {[key: string]: string[]}

export function parseQuery(obj: ObjReqQuery): objQuery {
    const result: objQuery = {}
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
        if (arrValue.length > 0) result[key] = arrValue

        arrValue = []
    })

    return result
}
