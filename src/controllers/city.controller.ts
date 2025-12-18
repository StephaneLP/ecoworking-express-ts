import type { Request, Response, NextFunction } from 'express'

export function readCities (req: Request, res: Response): void {
    res.status(200).json({reponse: 'ok'})
       console.log('OK')
}