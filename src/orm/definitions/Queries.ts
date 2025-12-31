import type { Model } from './Models.ts'

export type JoinType = 'INNER' | 'LEFT' | 'RIGHT'

export type Table = {
    model: Model,
    columns: string[]
}

export type JoinTables = Array<{
    model: Model,
    columns: string[],
    join: JoinType
}>

export type WhereParams = Array<{
    model: Model, 
    column: string, 
    op: string, 
    values: Array<string | number | boolean>, 
    pattern?: string   
}> 

export type OrderParams = Array<{
    model: Model,
    column: string, 
    dir: string
}>

export type Params = {
    mainTable: Table,
    joinTables: JoinTables,
    where: WhereParams,
    order: OrderParams,
    nestTables: boolean
}

export type DbResult = {
    success: boolean,
    message?: string,
    result?: any
}

export type BuildQuery = {
    queryString: string,
    queryParams: Array<string | number | boolean>
}