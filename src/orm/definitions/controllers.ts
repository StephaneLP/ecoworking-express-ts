import type { Model } from './models.ts'

export type MainTable = [Model, string[]]

export type JoinTables = [Model, string[]][]

export type WhereParams = [Model, string, string, string[], string?][]

export type OrderParams = [Model, string, string][]

export type Params = {
    mainTable: MainTable,
    joinTables?: JoinTables,
    where?: WhereParams,
    order?: OrderParams
}

export type DbResult = {
    success: boolean,
    message?: string,
    result?: any
}