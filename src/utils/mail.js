const nodemailer = require("nodemailer")
const fs = require("fs")
const mailFrom = {address: process.env.MAIL_ADDRESS, password: process.env.MAIL_PASSWORD}

const sendMailRegistration = async (address, subject, nickName, url, template) => {
    let data = fs.readFileSync("./src/templates/" + template, { encoding: 'utf8' })

    data = data.replace("$pseudo", nickName)
    data = data.replace("$url", url)

    const transporter = nodemailer.createTransport({
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

module.exports = {sendMailRegistration}