const log = require('../utils/log')

const checkJSONSyntax = (err, req, res, next) => {
    if (err instanceof SyntaxError) {
        res.status(err.status).json({status: 'error', code: err.status, message: 'Erreur de syntaxe : les données transmises au serveur ne sont pas conformes au format JSON'})
        log.addError(`Code : ${err.status} ; Fonction : checkJSONSyntax ; Message : ${err.name}, ${err.message}`)
        return
    }
    next()
}

module.exports = checkJSONSyntax