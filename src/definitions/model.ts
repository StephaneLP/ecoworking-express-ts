// Définition du nom d'une table (Liste des tables de la BDD)

export type TableName = 'city' | 'ecoworking' | 'equipment' | 'evaluation' | 'icon' | 'icon_type' | 'role' | 'user' | 'information'

// Définition d'un modèle (représente une table de la BDD)

type TableColumns = {
    type: 'integer' | 'string' | 'boolean',
    nullAuthorized: boolean,
    length?: number,
    emptyAuthorized?: boolean,
    autoIncrement?: boolean,
    primaryKey?: boolean,
    foreignKey?: boolean
}

type DateColumns = {
    createDate?: string,
    updateDate?: string
}

export type Model = {
    tableName: TableName,
    tableColumns: {[key: string]: TableColumns},
    dateColumns?: DateColumns
}

// Définition des relations entre les tables de la BDD

type SubRelation = {
    [key in TableName]: [string, string]
}
export type DbRelations = {
    [key in TableName]: Partial<SubRelation>
}