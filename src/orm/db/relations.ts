import type { TableName } from '../../config/db.tables.ts'
import type { JoinTables } from '../definitions/controllers.ts'
import type { DbRelations } from '../definitions/dbrelations.ts'

// Relations entre les tables de la BDD

export const relationType = {
    oneToOne: 'hasOne',
    oneToMany: 'oneToMany',
    belongsTo: 'belongsTo'
}

export const dbRelations = {} as DbRelations

// La table 'mainTableName' est-elle parente de la table 'table' (relation one to many) ?

export function isParent (mainTableName: TableName, table: TableName): boolean {
    if (dbRelations[mainTableName] && dbRelations[mainTableName][table]) {
        return dbRelations[mainTableName][table][0] === relationType.oneToMany
    }
    return false
}

// La table 'mainTableName' est-elle parente d'au moins une table du tableau joinTables (relation one to many) ?

export function hasChildren (mainTableName: TableName, joinTables: JoinTables): boolean {
    for (let table of joinTables) {
        if (isParent(mainTableName, table[0].tableName)) return true
    }
    return false
}
