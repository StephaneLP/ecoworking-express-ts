import { Model } from '../definitions/model.ts'

export const icon: Model = {
    tableName: 'icon',
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
            emptyAuthorized: false
        },
        description: {
            type: 'string',
            nullAuthorized: true,
            length: 500,
            emptyAuthorized: true
        },
        file: {
            type: 'string',
            nullAuthorized: false,
            length: 100,
            emptyAuthorized: false
        },
        path: {
            type: 'string',
            nullAuthorized: false,
            length: 500,
            emptyAuthorized: false
        },
        icon_type_id: {
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