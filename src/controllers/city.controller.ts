import type { Params } from '../orm/definitions.ts'

import express from 'express'
import { city } from '../models/city.model.ts'
import { ecoworking } from '../models/ecoworking.model.ts'
import { op } from '../orm/db.ts'
import { sendError } from './common/result.ts'
import { parseQueryParams, parseUriParams, parseBodyParams, setNestTables} from './common/parse.ts'
import * as crud from './common/crud.ts'

/*********************************************************
READ / GET / SELECT
*********************************************************/

export async function readCities(req: express.Request, res: express.Response): Promise<void> {
    try {
        const query = parseQueryParams(req.query)
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

        await crud.readRecords(res, params, 'readCities')        
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> readCities()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}

export async function readCityList(req: express.Request, res: express.Response): Promise<void> {
    try {
        const query = parseQueryParams(req.query)
        const params = {nestTables: setNestTables(query)} as Params

        // Tables
        params.mainTable = {model: city, columns: ['name']}

        // Clause WHERE
        params.where = [{model: city, column: 'is_active', op: op.equal, values: ['true']}]

        // Clause ORDER BY
        params.order = [{model: city, column: 'name', dir: 'ASC'}]

        await crud.readRecords(res, params, 'readCityList')        
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> readCityList()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}

export async function readCityById(req: express.Request, res: express.Response): Promise<void> {
    try {
        const query = parseQueryParams(req.query)
        const uriParams = parseUriParams(req.params)
        const params = {nestTables: setNestTables(query)} as Params

        // Tables
        params.mainTable = {model: city, columns: ['*']}

        // Clause WHERE
        params.where = [{model: city, column: 'id', op: op.equal, values: [uriParams.id]}]

        await crud.readRecordsById(res, params, 'readCityById')
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> readCities()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}

/*********************************************************
CREATE / POST / INSERT INTO
*********************************************************/

export async function createCity(req: express.Request, res: express.Response): Promise<void> {
    try {
        const body = parseBodyParams(req.body)
        const params = {} as Params

        params.model = city
        params.body = body

        await crud.createRecord(res, params, 'readCityById')
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> createCity()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}

/*********************************************************
UPDATE / PUT / INSERT INTO
*********************************************************/

export async function updateCityById(req: express.Request, res: express.Response): Promise<void> {
    console.log('UPDATE BY ID')
}

/*********************************************************
DELETE / DELETE / DELETE
*********************************************************/

export async function deleteCityById(req: express.Request, res: express.Response): Promise<void> {
    try {
        const uriParams = parseUriParams(req.params)
        const params = {} as Params

        // Clause WHERE
        params.where = [{model: city, column: 'id', op: op.equal, values: [uriParams.id]}]
        
        await crud.deleteRecordById(res, params, 'deleteCityById()')
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> deleteCityById()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}