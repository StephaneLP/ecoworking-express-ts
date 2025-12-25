import express from 'express'
import { parseQuery } from '../utils/tools.ts'
import { city } from '../models/city.model.ts'
import { ecoworking } from '../models/ecoworking.model.ts'
import type { TablesRequired } from '../orm/export.ts'

/*********************************************************
READ / GET / SELECT
*********************************************************/

export function readCities (req: express.Request, res: express.Response): void {
    const query = parseQuery(req.query)

    // TABLES & COLONNES (SELECT FROM) / Template : [ modèle, [colonne1, colonne2, ...]]
    const tables: TablesRequired = {
        mainTable: [city, ['*', 'id']],
        joinTables : [[ecoworking, ['id', 'name', 'phone', 'email', 'is_active', 'created_at', 'updated_at']]]
    }


    console.log(query)







    res.status(200).json({reponse: 'ok'})
}