// Fonction trim() appliquée aux valeurs string d'un objet de type { key: value }. Retourne un nouvel objet.

type ObjReqQuery = {[key: string]: any}
type objQuery = {[key: string]: string}

export function parseQuery(obj: ObjReqQuery): objQuery {
    const res: objQuery = {}
    
    Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'string') res[key] = value.trim()
        if (Array.isArray(value) && value.length > 0) res[key] = value[0].trim()
    })
    return res
}
