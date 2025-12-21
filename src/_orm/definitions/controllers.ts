import { Model } from './models'
import { TableName } from '../../config/db'

export type MainTable = [Model, TableName[]]

export type JoinTables = [[Model, TableName[]]]

export type TablesRequired = {
    mainTable: MainTable,
    joinTables: JoinTables
}