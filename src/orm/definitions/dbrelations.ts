// Définition des relations entre les tables de la BDD

import type { TableName } from '../../config/db.tables.ts'

type DbRelatedTables = {
    [key in TableName]: [string, string]
}

export type DbRelations = {
    [key in TableName]: Partial<DbRelatedTables>
}