import express from 'express'
import { parseQuery } from '../utils/tools.ts'

/*********************************************************
READ / GET / SELECT
*********************************************************/

export function readCities (req: express.Request, res: express.Response): void {
    const query = parseQuery(req.query)
    console.log(query)







    res.status(200).json({reponse: 'ok'})
       console.log('OK')
}