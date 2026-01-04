import express from 'express'
import type { Params } from '../orm/definitions.ts'
import { op } from '../orm/db.ts'
import { city } from '../models/city.model.ts'
import { ecoworking } from '../models/ecoworking.model.ts'
import { parseQuery, setNestTables } from './common/parse.ts'
import { readRecords } from './common/crud.ts'
import { sendError } from './common/result.ts'

/*********************************************************
READ / GET / SELECT
*********************************************************/

export async function readCities(req: express.Request, res: express.Response): Promise<void> {
    try {
        const query = parseQuery(req.query)
        const params = {nestTables: setNestTables(query)} as Params

        // Tables
        params.mainTable = {model: city, columns: ['*']}
        params.joinTables = [{model: ecoworking, columns: ['*'], join: 'LEFT'}]

        // Clause WHERE
        params.where = []
        if(query.id) params.where.push({model: city, column: 'id', op: op.in, values: query.id.split(',')})
        if(query.name) params.where.push({model: city, column: 'name', op: op.like, values: [query.name], pattern: '%?%'})
        if(query.is_active) params.where.push({model: city, column: 'is_active', op: op.equal, values: [query.is_active]})

        // Clause ORDER BY
        params.order = [{model: city, column: query.col || 'name', dir: query.dir || 'ASC'}]

        await readRecords(res, params, 'readCities')        
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> readCities()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}

export async function readCityList(req: express.Request, res: express.Response): Promise<void> {
    try {
        const query = parseQuery(req.query)
        const params = {nestTables: setNestTables(query)} as Params

        // Tables
        params.mainTable = {model: city, columns: ['name']}

        // Clause WHERE
        params.where = [{model: city, column: 'is_active', op: op.equal, values: ['true']}]

        // Clause ORDER BY
        params.order = [{model: city, column: 'name', dir: 'ASC'}]

        await readRecords(res, params, 'readCityList')        
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> readCityList()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}

export function readCityById(req: express.Request, res: express.Response): Promise<void> {
    try {
        const query = parseQuery(req.query)
        const params = {nestTables: setNestTables(query)} as Params

    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> readCities()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}