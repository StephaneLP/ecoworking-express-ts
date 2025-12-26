import type { Model } from './models.ts'

export type MainTable = [Model, string[]]

export type JoinTables = [[Model, string[]]]

export type QueryTables = {
    mainTable: MainTable,
    joinTables: JoinTables
}

export type FilterParams = [Model, string, string, string[], string?][]

export type OrderParams = [Model, string, string][]

export type ReadAllParams = {
    tables: QueryTables,
    filter: FilterParams,
    order: OrderParams
}