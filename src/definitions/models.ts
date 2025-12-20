type TableName = string

type TableColumns = {
    type: 'integer' | 'string' | 'boolean',
    nullAuthorized: boolean,
    length?: number,
    emptyAuthorized?: boolean,
    autoIncrement?: boolean,
    primaryKey?: boolean,
    foreignKey?: boolean
}

type DateColumns ={
    [Key: string]: string
}

type Model = {
    tableName: TableName,
    tableColumns: {[key: string]: TableColumns},
    dateColumns?: DateColumns
}

export default Model