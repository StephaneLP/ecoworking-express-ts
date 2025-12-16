import fs from 'fs'

type TypeMessage = 'Error' | 'Event' | 'Request'

function logMessage (type: TypeMessage, msg: string): void {
    const date = new Date()
    const formattedDate = date.toLocaleString()
    const message = formattedDate + ' ; ' + msg.replace(/(\r\n|\n|\r)/gm," / ")
    const isDev = (process.env.NODE_ENV === 'development')
    let file: string

    switch(type) {
        case 'Error':
            file = './logs/error.log'
            break
        case 'Event':
            file = './logs/event.log'
            break
        case 'Request':
            file = './logs/request.log'
            break
    }

    fs.appendFile(file, message + '\n', (err) => {
        if (err && isDev) {
            console.log(`Erreur d'écriture dans le fichier log (${err})`)
            return
        }
        if(isDev) console.log(`[${type}] ${message}`)
    })
}

export function logError (msg: string): void {logMessage('Error', msg)}
export function logEvent (msg: string): void {logMessage('Event', msg)}
export function logRequest (msg: string): void {logMessage('Request', msg)} 