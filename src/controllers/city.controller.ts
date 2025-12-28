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
        queryParams.mainTable = [city, ['*']],
        queryParams.joinTables = [[ecoworking, ['*']]]

        // Clause WHERE
        queryParams.where = []
        if(query.id) queryParams.where.push([city, 'id', op.in, query.id.split(',')])
        if(query.name) queryParams.where.push([city, 'name', op.like, [query.name], '%?%'])
        if(query.is_active) queryParams.where.push([city, 'is_active', op.equal, [query.is_active]])

        // Clause ORDER BY
        queryParams.order = [[city, query.col || 'name', query.dir || 'ASC']]

        await readRecords(res, queryParams, 'readCities')        
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> readCities()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}


