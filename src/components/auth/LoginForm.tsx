import {useState} from 'react'
import {Username, Password} from './authFields'
import {
    Form,
    Button,
  } from "react-bootstrap"
  import {useTranslation} from 'react-i18next'
  import { useValidPassword, useValidUsername } from '../../hooks/useAuthHooks'
const LoginForm: React.FunctionComponent<{loginHandler: (username: string, password: string)=>void}> = ({loginHandler})=>{
    const { username, setUsername, usernameIsValid } = useValidUsername('')
    const { password, setPassword, passwordIsValid } = useValidPassword('')
    const [error, setError] = useState('')
    const {t} = useTranslation()
    const isValid = usernameIsValid && username.length > 0 || passwordIsValid || password.length > 0

    const submit = async(e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        if(isValid){
            console.log('call loginHandler')
            loginHandler(username, password)
        }
        
    }
    return (
        <>
            <h3>{t('button_login')}</h3>
            <Form onSubmit={submit}>
                <Username username={username} usernameIsValid={usernameIsValid} setUsername={setUsername} />
                <Password label={t('label_password')} password={password} passwordIsValid={passwordIsValid} setPassword={setPassword} />
                <Button variant='primary' type="submit">{t('button_login')}</Button>
            </Form>
        </>
    )
}

export default LoginForm