export enum AuthErrors{
    USER_NOT_FOUND,
    INVALID_PASSWORD,
    NEW_PASSWORD_REQUIRED
}
class AuthError extends Error{
    public readonly code: AuthErrors
    public readonly data: any
    constructor(code: AuthErrors, message:string, data?: any){
        super(message)
        this.code = code
        this.data = data
    }
}
export default AuthError