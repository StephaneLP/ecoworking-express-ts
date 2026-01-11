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
        // Query Parameters
        const query = parseQueryParams(req.query)

        // Paramètres de la requête
        const params = {} as Params
        
        params.nestTables = setNestTables(query)
        params.mainTable = {model: city, columns: ['*']}
        params.joinTables = [{model: ecoworking, columns: ['*'], join: 'LEFT'}]
        params.order = [{model: city, column: query.col || 'name', dir: query.dir || 'ASC'}]

        params.where = []
        if(query.id) params.where.push({model: city, column: 'id', op: op.in, values: query.id.split(',')})
        if(query.name) params.where.push({model: city, column: 'name', op: op.like, values: [query.name], pattern: '%?%'})
        if(query.is_active) params.where.push({model: city, column: 'is_active', op: op.equal, values: [query.is_active]})

        await crud.readRecords(res, params, 'readCities')        
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> readCities()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}

export async function readCityList(req: express.Request, res: express.Response): Promise<void> {
    try {
        // Query Parameters
        const query = parseQueryParams(req.query)

        // Paramètres de la requête
        const params = {} as Params
        
        params.nestTables = setNestTables(query)
        params.mainTable = {model: city, columns: ['name']}
        params.order = [{model: city, column: 'name', dir: 'ASC'}]
        params.where = [{model: city, column: 'is_active', op: op.equal, values: ['true']}]

        await crud.readRecords(res, params, 'readCityList')        
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> readCityList()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}

export async function readCityById(req: express.Request, res: express.Response): Promise<void> {
    try {
        // Path Parameters
        const uriParams = parseUriParams(req.params)

        // Query Parameters
        const query = parseQueryParams(req.query)

        // Paramètres de la requête
        const params = {} as Params

        params.nestTables = setNestTables(query)
        params.mainTable = {model: city, columns: ['*']}
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
        // Body Parameters
        const body = parseBodyParams(req.body)

        // Paramètres de la requête
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
    try {
        // Path Parameters
        const uriParams = parseUriParams(req.params)
        
        // Body Parameters
        const body = parseBodyParams(req.body)

        // Paramètres de la requête
        const params = {} as Params

        params.model = city
        params.body = body
        params.where = [{model: city, column: 'id', op: op.equal, values: [uriParams.id]}]

        await crud.updateRecordById(res, params, 'readCityById')
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> createCity()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}

/*********************************************************
DELETE / DELETE / DELETE
*********************************************************/

export async function deleteCityById(req: express.Request, res: express.Response): Promise<void> {
    try {
        // Path Parameters
        const uriParams = parseUriParams(req.params)

        // Paramètres de la requête
        const params = {} as Params

        params.where = [{model: city, column: 'id', op: op.equal, values: [uriParams.id]}]
        
        await crud.deleteRecordById(res, params, 'deleteCityById()')
    }
    catch(error: unknown) {
        const message: string = (error instanceof Error ? error.message : String(error)) + ' -> deleteCityById()'
        sendError(res, 500, 'Erreur Serveur', message)
    }
}