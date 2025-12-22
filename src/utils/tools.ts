// Fonction trim() appliquée aux valeurs string d'un objet de type { key: value }. Retourne un nouvel objet.

type ObjReqQuery = {[key: string]: any}
type objQuery = {[key: string]: string}

export function trimStringValues(obj: ObjReqQuery): objQuery {
    const res: objQuery = {}
    
    Object.entries(obj).forEach(e => {
        if (typeof e[1] === 'string') res[e[0]] = e[1].trim()
    })
    return res
}
