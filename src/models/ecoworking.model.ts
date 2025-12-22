import { Model } from '../orm/export'

export const ecoworking: Model = {
    tableName: 'ecoworking',
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
            length: 100,
            emptyAuthorized: false,
        },
        description: {
            type: 'string',
            nullAuthorized: true,
            length: 1000
        },
        website_url: {
            type: 'string',
            nullAuthorized: true,
            length: 200
        },
        phone: {
            type: 'string',
            nullAuthorized: true,
            length: 17
        },
        email: {
            type: 'string',
            nullAuthorized: true,
            length: 254
        },
        address: {
            type: 'string',
            nullAuthorized: true,
            length: 200
        },
        cp: {
            type: 'string',
            nullAuthorized: true,
            length: 5
        },
        map_url: {
            type: 'string',
            nullAuthorized: true,
            length: 200
        },
        is_active: {
            type: 'boolean',
            nullAuthorized: false
        },
        city_id: {
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