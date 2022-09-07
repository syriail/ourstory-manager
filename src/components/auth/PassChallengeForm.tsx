import {useState} from 'react'
import {Password} from './authFields'
import {
    Form,
    Button,
  } from "react-bootstrap"
  import { useValidPassword } from '../../hooks/useAuthHooks'
  import { useTranslation } from 'react-i18next'
const PassChallengeForm: React.FunctionComponent<{completePasswordChanllengeHandler: (password: string)=>void}> = ({completePasswordChanllengeHandler})=>{
    
    const { password, setPassword, passwordIsValid } = useValidPassword('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [error, setError] = useState('')
    const {t} = useTranslation()
    const isValid = passwordIsValid && password.length > 0 && repeatPassword === password

    const submit = async(e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        if(isValid){
            await completePasswordChanllengeHandler(password)
        }
        
    }
    return (
        <>
            <h3>{t('label_new_password')}</h3>
            <Form onSubmit={submit}>
                <Password label='Password' password={password} passwordIsValid={passwordIsValid} setPassword={setPassword} />
                <Password label='Password' password={repeatPassword} passwordIsValid={password.length !== 0 && repeatPassword.length !== 0 && password === repeatPassword} setPassword={setRepeatPassword} />
                <Button variant='primary' type="submit">Login</Button>
            </Form>
        </>
    )
}

export default PassChallengeForm