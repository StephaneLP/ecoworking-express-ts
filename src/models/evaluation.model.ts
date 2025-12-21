import { Model } from '../_orm/export'

export const evaluation: Model = {
    tableName: 'evaluation',
    tableColumns: {
        id: {
            type: 'integer',
            nullAuthorized: false,
            autoIncrement: true,
            primaryKey: true
        },
        note: {
            type: 'integer',
            nullAuthorized: false,
        },        
        comment: {
            type: 'string',
            nullAuthorized: false,
            length: 2000,
            emptyAuthorized: false,
        },
        is_active: {
            type: 'boolean',
            nullAuthorized: false
        },
        user_id: {
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