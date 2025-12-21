import { Model } from '../_orm/export'

export const role: Model = {
    tableName: 'role',
    tableColumns: {
        id: {
            type: 'integer',
            nullAuthorized: false,
            primaryKey: true
        },
        name: {
            type: 'string',
            nullAuthorized: false,
            length: 20,
            emptyAuthorized: false,
        },
        code: {
            type: 'string',
            nullAuthorized: false,
            length: 10,
            emptyAuthorized: false
        },
        rank: {
            type: 'integer',
            nullAuthorized: false
        }
    }
}