import express from 'express'
import { city } from '../models/city.model.ts'
import { ecoworking } from '../models/ecoworking.model.ts'
import type { QueryTables, FilterParams, OrderParams, ReadAllParams } from '../orm/export.ts'
import { runQuerySelect, op } from '../orm/export.ts'
import { parseQuery, initQueryParams } from '../utils/tools.ts'

/*********************************************************
READ / GET / SELECT
*********************************************************/

export async function readCities (req: express.Request, res: express.Response): void {
    const query = parseQuery(req.query)
    const queryTest: ReadAllParams = initQueryParams()

    queryTest.tables = {
        mainTable: [city, ['*']],
        joinTables: [[ecoworking, ['id', 'name', 'phone', 'email', 'is_active', 'created_at', 'updated_at']]]
    }

    if(query.id) queryTest.filter.push([city, 'id', op.in, query.id.split(',')])
    if(query.name) queryTest.filter.push([city, 'name', op.like, [query.name], '%?%'])
    if(query.is_active) queryTest.filter.push([city, 'is_active', op.equal, [query.is_active]])


    console.log(queryTest)
//     queryTest.tables.joinTables = [[ecoworking, ['id', 'name', 'phone', 'email', 'is_active', 'created_at', 'updated_at']]]
// console.log(queryTest)


    // TABLES & COLONNES (SELECT FROM) / Template : [ modèle, [colonne1, colonne2, ...]]
    const queryTables: QueryTables = {
        mainTable: [city, ['*']],
        joinTables : [[ecoworking, ['id', 'name', 'phone', 'email', 'is_active', 'created_at', 'updated_at']]]
    }

    // FILTRE (WHERE) / Template : [ modèle, colonne, opérateur, [valeurs] (,option : paterne)]
    const filterParams: FilterParams = []
    if(query.id) filterParams.push([city, 'id', op.in, query.id.split(',')])
    if(query.name) filterParams.push([city, 'name', op.like, [query.name], '%?%'])
    if(query.is_active) filterParams.push([city, 'is_active', op.equal, [query.is_active]])

    // TRI (ORDER BY) / Template [modèle, colonne, direction]
    const orderParams: OrderParams = [[city, query.col || 'name', query.dir || 'ASC']]

    const queryParams: ReadAllParams = {
        tables: queryTables,
        filter: filterParams,
        order: orderParams
    }

    // try {
    //     const dbRes = await runQuerySelect(queryParams)

    //     if (!dbRes.success) {
    //         return sendError(res, 400, `${params.functionName}/${dbRes.functionName}`, 'Erreur Requête', dbRes.msg)
    //     }

    //     const formatDbRes = Number(process.env.DB_RES_NEST_FORMAT) ? formatResponse(params, dbRes.result) : dbRes.result
    //     sendResult(res, 200, params.functionName, 'Requête exécutée avec succès', dbRes.result.length, formatDbRes)
    // }
    // catch(err) {
    //     sendError(res, 500, 'readCities', 'Erreur Serveur', err.message)
    // }

    res.status(200).json({reponse: 'ok'})
}