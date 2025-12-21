import { TableColumns } from '../definitions/models'

// Opérateur clause WHERE

export const op = {
    equal: '=',
    like: 'LIKE',
    in: 'IN'
}

// Recherche de la colonne étant la clé primaire de la table

export function getPKColumn (columns: TableColumns): string {
    for (let column in columns) {
        if (columns[column].primaryKey) return column
    }
    return "id" // Champ PK par défaut
}