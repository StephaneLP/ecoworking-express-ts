import { compare } from "bcrypt-ts"

/*********************************************************
GESTION DES MOTS DE PASSE
*********************************************************/

// Hachage du mot de passe
const saltRounds = 10

// export async function hashPassword (password) {
//     try {
//         const salt = await bcrypt.genSalt(saltRounds)
//         const hashedPassword = await bcrypt.hash(password, salt)

//         return {success: true, password: hashedPassword}
//     } catch (err) {
//         return {success: false, msg: `${err.name}, ${err.message}`}
//     }
// }

// Comparaison des mots de passe
export async function comparePasswords(password: string, dbPassword: string): Promise<boolean> {
    try {
        return await compare(password, dbPassword)
    }
    catch(error: unknown) {
        const msg = (error instanceof Error ? error.message : String(error)) + ' -> comparePasswords()'
        throw new Error(msg)
    }
}
