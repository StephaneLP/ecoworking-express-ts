import express from 'express'
import serveFavicon from 'serve-favicon'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import {addEvent} from './src/utils/log.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const app = express()

/*********************************************************
Middlewares
*********************************************************/

app.use(serveFavicon(__dirname + '/favicon.png'))
app.use(express.json())
app.use(cors())

// app.use(checkJSONSyntax)

/*********************************************************
Ouverture du port
*********************************************************/

const port = process.env.PORT || 3000

app.listen(port, () => {
    addEvent(`L'application est démarrée sur le port ${port}`)
})