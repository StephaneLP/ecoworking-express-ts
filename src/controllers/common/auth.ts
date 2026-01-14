import { compare, genSalt, hash } from "bcrypt-ts"

/*********************************************************
GESTION DES MOTS DE PASSE
*********************************************************/

// Hachage du mot de passe
export async function hashPassword(password: string): Promise<string> {
    try {
        const saltRounds = 10
        const salt = await genSalt(saltRounds)
        const hashedPassword = await hash(password, salt)

        return hashedPassword
    }     
    catch(error: unknown) {
        const msg = (error instanceof Error ? error.message : String(error)) + ' -> hashPassword()'
        throw new Error(msg)
    }
}

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
