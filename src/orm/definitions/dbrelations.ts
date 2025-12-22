// Définition des relations entre les tables de la BDD

import { TableName } from '../../config/db'

type DbRelatedTables = {
    [key in TableName]: [string, string]
}

export type DbRelations = {
    [key in TableName]: Partial<DbRelatedTables>
}