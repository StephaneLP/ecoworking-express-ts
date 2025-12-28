// Définition d'un modèle (représente une table de la BDD)

import type { TableName } from '../../config/db.tables.ts'

export type TableColumnsProperties = {
    type: 'integer' | 'string' | 'boolean',
    nullAuthorized: boolean,
    length?: number,
    emptyAuthorized?: boolean,
    autoIncrement?: boolean,
    primaryKey?: boolean,
    foreignKey?: boolean
}

export type TableColumns = {[key: string]: TableColumnsProperties}

type DateColumns = {
    createDate?: string,
    updateDate?: string
}

export type Model = {
    tableName: TableName,
    tableColumns: TableColumns,
    dateColumns?: DateColumns
}