import type { DbRelations } from '../orm/export.ts'

// Définition du type nom d'une table (Liste des tables de la BDD)

export type TableName = 'city' | 'ecoworking' | 'equipment' | 'evaluation' | 'icon' | 'icon_type' | 'role' | 'user' | 'information'

// Types de relation

export const relationType = {
    oneToOne: 'hasOne',
    oneToMany: 'oneToMany',
    belongsTo: 'belongsTo'
}

// Définition des relations entre les tables de la BDD

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