import express from 'express'
import { logEvent } from './src/utils/log.ts'

const app = express()

/*********************************************************
Middlewares
*********************************************************/

import serveFavicon from 'serve-favicon'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { checkJSONSyntax } from './src/middlewares/parseJSON.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.use(serveFavicon(__dirname + '/favicon.png'))
app.use(express.json())
app.use(checkJSONSyntax)
app.use(cors())

/*********************************************************
Middlewares spécifiques à l'environnement de développement
*********************************************************/

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan')

    app.use(morgan('dev'))
}

/*********************************************************
Connexion BDD
*********************************************************/

import './src/config/db.ts'

/*********************************************************
Routes
*********************************************************/

import cityRoutes from './src/routes/city.routes.ts'

app.use('/ville/', cityRoutes)

/*********************************************************
Ouverture du port
*********************************************************/

const port = process.env.PORT || 3000

app.listen(port, () => {
    logEvent(`L'application est démarrée sur le port ${port}`)
})