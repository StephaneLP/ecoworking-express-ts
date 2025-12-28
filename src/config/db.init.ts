import mariadb from 'mariadb'
import { logEvent, logError } from "../utils/log.ts"
import { dbRelations, relationType } from '../orm/db/relations.ts'

/*********************************************************
Connecteur à la BDD (Pool)
*********************************************************/

export const pool: mariadb.Pool = mariadb.createPool({
     host: process.env.DB_HOST,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_DATABASE,
     port: Number(process.env.DB_PORT),
     insertIdAsNumber: true,
     bigIntAsNumber: true,
     connectionLimit: 5,
})

/*********************************************************
Test de la connexion à la BDD
*********************************************************/

;
(async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        logEvent(`Connexion à la BDD (threadId=${conn.threadId})`)
    } catch (err) { 
        logError(`Erreur de connexion à la BDD (err=${err})`)
    } finally {
        if (conn) conn.end()
    }    
})()

/*********************************************************
Initialisation du modèle relationnel : relations entre les tables de la BDD
*********************************************************/

dbRelations.role = {
    user: [relationType.oneToMany, 'role.id = user.role_id']
}

dbRelations.user = {
    role: [relationType.belongsTo, 'user.role_id = role.id'],
    icon: [relationType.belongsTo, 'user.icon_id = icon.id'],
    evaluation: [relationType.oneToMany, 'user.id = evaluation.user_id']
}

dbRelations.icon_type = {
    icon: [relationType.oneToMany, 'icon_type.id = icon.icon_type_id']
}

dbRelations.icon = {
    icon_type: [relationType.belongsTo, 'icon.icon_type_id = icon_type.id'],
    user: [relationType.oneToMany, 'icon.id = user.icon_id'],
    equipment: [relationType.oneToMany, 'icon.id = equipment.icon_id'],
}

dbRelations.city = { 
    ecoworking: [relationType.oneToMany, 'city.id = ecoworking.city_id']
}

dbRelations.ecoworking = {
    city: [relationType.belongsTo, 'ecoworking.city_id = city.id'],
    information: [relationType.oneToMany, 'ecoworking.id = information.ecoworking_id'],
    equipment: [relationType.oneToMany, 'ecoworking.id = equipment.ecoworking_id'],
    evaluation: [relationType.oneToMany, 'ecoworking.id = evaluation.ecoworking_id']
}

dbRelations.equipment = {
    icon: [relationType.belongsTo, 'equipment.icon_id = icon.id'],
    ecoworking: [relationType.belongsTo, 'equipment.ecoworking_id = ecoworking.id']
}

dbRelations.evaluation = {
    user: [relationType.belongsTo, 'evaluation.user_id = user.id'],
    ecoworking: [relationType.belongsTo, 'evaluation.ecoworking_id = ecoworking.id']
}
