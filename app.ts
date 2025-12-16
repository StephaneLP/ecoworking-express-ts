const express = require('express')
const serveFavicon = require('serve-favicon')
const cors = require('cors')
const checkJSONSyntax = require('./src/middlewares/parseJSON.ts')
const { logEvent } = require('./src/utils/log.ts')

// import { fileURLToPath } from 'url'
// import { dirname } from 'path'
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)


const app = express()

/*********************************************************
Middlewares
*********************************************************/

app.use(serveFavicon(__dirname + '/favicon.png'))
app.use(express.json())
app.use(checkJSONSyntax)
app.use(cors())

/*********************************************************
Middlewares spécifiques à l'environnement de développement
*********************************************************/

if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan')

    app.use(morgan('dev'))
}

/*********************************************************
Connexion BDD
*********************************************************/

// require('./src/config/db.js')

/*********************************************************
Ouverture du port
*********************************************************/

const port = process.env.PORT || 3000

app.listen(port, () => {
    logEvent(`L'application est démarrée sur le port ${port}`)
})