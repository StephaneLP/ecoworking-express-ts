import { createTransport } from 'nodemailer'
import { readFileSync } from 'fs'

const mailFrom = {address: process.env.MAIL_ADDRESS, password: process.env.MAIL_PASSWORD}

export async function sendMailRegistration(address: string, subject: string, nickName: string, url: string, template: string) {
    let data: string = readFileSync("./src/mailer/templates/" + template, { encoding: 'utf8' })

    data = data.replace("$pseudo", nickName)
    data = data.replace("$url", url)

    const transporter = createTransport({
        host : "mail.mailo.com",
        port : 465,
        auth : {
            user : mailFrom.address,
            pass : mailFrom.password
        }
    })
    
    const info = await transporter.sendMail({
        from : mailFrom.address, 
        to: address, 
        subject: subject,
        html: data
    })

    return info
}