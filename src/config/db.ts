import { DbRelations } from '../definitions/model.ts'

const relationType = {
    onetoOne: 'hasOne',
    oneToMany: 'oneToMany',
    belongsTo: 'belongsTo'
}

export const dbRelations: Partial<DbRelations> = {
    role: {
        user: [relationType.oneToMany, 'role.id = user.role_id']
    },
    user: {
        role: [relationType.belongsTo, 'user.role_id = role.id'],
        icon: [relationType.belongsTo, 'user.icon_id = icon.id'],
        evaluation: [relationType.oneToMany, 'user.id = evaluation.user_id']
    },
    icon_type: {
        icon: [relationType.oneToMany, 'icon_type.id = icon.icon_type_id']
    },
    icon: {
        icon_type: [relationType.belongsTo, 'icon.icon_type_id = icon_type.id'],
        user: [relationType.oneToMany, 'icon.id = user.icon_id'],
        equipment: [relationType.oneToMany, 'icon.id = equipment.icon_id'],
    },
    city: { 
        ecoworking: [relationType.oneToMany, 'city.id = ecoworking.city_id']
    },
    ecoworking: {
        city: [relationType.belongsTo, 'ecoworking.city_id = city.id'],
        information: [relationType.oneToMany, 'ecoworking.id = information.ecoworking_id'],
        equipment: [relationType.oneToMany, 'ecoworking.id = equipment.ecoworking_id'],
        evaluation: [relationType.oneToMany, 'ecoworking.id = evaluation.ecoworking_id']
    },
    equipment: {
        icon: [relationType.belongsTo, 'equipment.icon_id = icon.id'],
        ecoworking: [relationType.belongsTo, 'equipment.ecoworking_id = ecoworking.id']
    },
    evaluation: {
        user: [relationType.belongsTo, 'evaluation.user_id = user.id'],
        ecoworking: [relationType.belongsTo, 'evaluation.ecoworking_id = ecoworking.id']
    }
}

export const op = {
    equal: '=',
    like: 'LIKE',
    in: 'IN'
}

// La table 'mainTableName' est-elle parente de la table 'table' (relation one to many) ?
const isParent = (mainTableName, table) => {
    return dbRelations[mainTableName][table][0] === relationType.oneToMany
}

// La table 'mainTableName' est-elle parente d'au moins une table du tableau joinTables (relation one to many) ?
const hasChildren = (mainTableName, joinTables) => {
    for (let table of joinTables) {
        if (isParent(mainTableName, table[0].tableName)) return true
    }
    return false
}

// Recherche de la colonne étant la clé primaire de la table
const getPKColumn = (columns) => {
    for (let column in columns) {
        if (columns[column].primaryKey) return column
    }
    return "id" // Champ PK par défaut
}
