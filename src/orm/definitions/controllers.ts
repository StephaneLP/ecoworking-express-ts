import type { Model } from './models.ts'

export type MainTable = [Model, string[]]

export type JoinTables = [[Model, string[]]]

export type TablesRequired = {
    mainTable: MainTable,
    joinTables: JoinTables
}