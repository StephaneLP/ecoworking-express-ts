import Model from './common/types.ts'

export const iconType: Model = {
    tableName: 'icon_type',
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
            length: 45,
            emptyAuthorized: false
        }
    },
    dateColumns: {
        createDate: 'created_at',
        updateDate: 'updated_at'
    }
}
