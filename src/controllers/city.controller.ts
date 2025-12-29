import express from 'express'
import type { Params } from '../orm/definitions.ts'
import { op } from '../orm/db.ts'
import { city } from '../models/city.model.ts'
import { ecoworking } from '../models/ecoworking.model.ts'
import { parseQuery } from './common/parse.ts'
import { readRecords } from './common/crud.ts'
import { sendError } from './common/result.ts'

/*********************************************************
READ / GET / SELECT
*********************************************************/

export async function readCities (req: express.Request, res: express.Response): Promise<void> {
    try {
        const query = parseQuery(req.query)
        const queryParams = {} as Params

        // Tables
        queryParams.mainTable = {model: city, columns: ['*']}
        queryParams.joinTables = [{model: ecoworking, columns: ['name', 'is_active']}]

        // Clause WHERE
        queryParams.where = []
        if(query.id) queryParams.where.push({model: city, column: 'id', op: op.in, values: query.id.split(',')})
        if(query.name) queryParams.where.push({model: city, column: 'name', op: op.like, values: [query.name], pattern: '%?%'})
        if(query.is_active) queryParams.where.push({model: city, column: 'is_active', op: op.equal, values: [query.is_active]})

        // Clause ORDER BY
        queryParams.order = [{model: city, column: query.col || 'name', dir: query.dir || 'ASC'}]

        await readRecords(res, queryParams, 'readCities')        
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> readCities()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}


