import React, { useState, useContext } from 'react'

import { useNavigate } from 'react-router-dom'
import {
  Container
} from "react-bootstrap"

import { AuthContext, AuthStatus } from '../../contexts/authContext'
import LoginForm from '../../components/auth/LoginForm'
import classes from './Auth.module.scss'
import PassChallengeForm from '../../components/auth/PassChallengeForm'
import AuthError, { AuthErrors } from '../../api/authErrors'

const SignIn: React.FunctionComponent<{}> = () => {
  
  const [username, setUsername] = useState('')
  const [newPasswordRequired, setNewPasswordRequired] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)

  
  const passwordResetClicked = async () => {
    navigate('requestcode')
  }

  const loginHandler = async(username: string, password: string)=>{
    setUsername(username)
    try {
      await authContext.signInWithEmail(username, password)
      console.log('authContext.signInWithEmail(username, password) returned')
      if(authContext.authStatus === AuthStatus.SignedIn)
        navigate('/collections')
    } catch (err: any) {
        console.log(err)
        if(err instanceof AuthError && err.code === AuthErrors.NEW_PASSWORD_REQUIRED){
          setNewPasswordRequired(true)
        }else if (err.code === 'UserNotConfirmedException') {
        navigate('verify')
      } else {
        console.error(err)
        setError(err.message)
      }
    }
  }

  const completePasswordChanllengeHandler = async(password: string)=>{
    try{
      await authContext.completeNewPasswordChallenge(username, password, null)
      setNewPasswordRequired(false)
    }catch(error: any){
      console.error(error)
      setError(error.message)
    }
  }

  return (
    <Container className={classes.container}>
      {newPasswordRequired ? (
        <PassChallengeForm completePasswordChanllengeHandler={completePasswordChanllengeHandler}/>
      ): (
        <LoginForm loginHandler={loginHandler} />
      )}

    </Container>
  )
}

export default SignIn
