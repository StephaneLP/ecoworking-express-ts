import { Model } from '../orm/export'

export const equipment: Model = {
    tableName: 'equipment',
    tableColumns: {
        id: {
            type: 'integer',
            nullAuthorized: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: 'string',
            nullAuthorized: false,
            length: 200,
            emptyAuthorized: false,
        },
        rank: {
            type: 'integer',
            nullAuthorized: false,
        },
        icon_id: {
            type: 'integer',
            nullAuthorized: false,
            foreignKey: true
        },
        ecoworking_id: {
            type: 'integer',
            nullAuthorized: false,
            foreignKey: true
        }
    },
    dateColumns: {
        createDate: 'created_at',
        updateDate: 'updated_at'
    }
}