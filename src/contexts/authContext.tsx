import React, { useState, useEffect, useContext } from 'react'
import * as authorizer from '../api/auth'
import { getEmployee } from '../api/ourstory';
import AuthError, { AuthErrors } from '../api/authErrors';
import { Employee } from '../api/models';
import { CognitoAccessToken, CognitoRefreshToken } from 'amazon-cognito-identity-js';

export enum AuthStatus {
  Loading,
  SignedIn,
  SignedOut,
}

export interface IAuth {
  employee?: Employee
  attrInfo?: any
  authStatus?: AuthStatus
  getToken?: any
  signInWithEmail?: any
  completeNewPasswordChallenge?: any
  signOut?: any
  verifyCode?: any
  sendCode?: any
  forgotPassword?: any
  changePassword?: any
  getAttributes?: any
  setAttribute?: any
}

const defaultState: IAuth = {
  authStatus: AuthStatus.Loading
}

type Props = {
  children?: React.ReactNode
}

export const AuthContext = React.createContext(defaultState)

export const AuthIsSignedIn = ({ children }: Props) => {
  const { authStatus }: IAuth = useContext(AuthContext)

  return <>{authStatus === AuthStatus.SignedIn ? children : null}</>
}

export const AuthIsNotSignedIn = ({ children }: Props) => {
  const { authStatus }: IAuth = useContext(AuthContext)

  return <>{authStatus === AuthStatus.SignedOut ? children : null}</>
}

const AuthProvider = ({ children }: Props) => {
  const [authStatus, setAuthStatus] = useState(AuthStatus.Loading)
  const [attrInfo, setAttrInfo] = useState([])
  const [employee, setEmployee] = useState<Employee | undefined>(undefined)

  useEffect(() => {
    getSessionInfo()
  }, [setAuthStatus, authStatus])

  if (authStatus === AuthStatus.Loading) {
    return null
  }
  async function getSessionInfo() {
    try {
      const session = await getSession()
      const attr: any = await getAttributes()
      setAttrInfo(attr)
      const employee = await getEmployee(session.getAccessToken().getJwtToken(), session.getIdToken().payload.sub)
      console.log(employee)
      setEmployee(employee)
      setAuthStatus(AuthStatus.SignedIn)
    } catch (err) {
      console.log(err)
      setAuthStatus(AuthStatus.SignedOut)
    }
  }

  async function signInWithEmail(username: string, password: string) {
    try {
      await authorizer.signInWithEmail(username, password)
      setAuthStatus(AuthStatus.SignedIn)
    } catch (err) {
      setAuthStatus(AuthStatus.SignedOut)
      throw err
    }
  }
  const completeNewPasswordChallenge = async(username: string, password: string, data: any)=>{
    try{
      await authorizer.completeNewPasswordChallenge(username, password, data)
      setAuthStatus(AuthStatus.SignedOut)
    }catch(error){
      setAuthStatus(AuthStatus.SignedOut)
      throw error
    }
  }

  function signOut() {
    authorizer.signOut()
    setAuthStatus(AuthStatus.SignedOut)
  }

  async function verifyCode(username: string, code: string) {
    try {
      await authorizer.verifyCode(username, code)
    } catch (err) {
      throw err
    }
  }

  async function getSession() {
    try {
      console.log('Get seesion in authContext')
      const session = await authorizer.getSession()
      return session
    } catch (err) {
      throw err
    }
  }

  async function getToken(){
    try{
      const session = await getSession()
      return session.getAccessToken().getJwtToken()
    }catch(error){
      console.log(error)
      setAuthStatus(AuthStatus.SignedOut)
    }
    
  }

  async function getAttributes() {
    try {
      const attr = await authorizer.getAttributes()
      return attr
    } catch (err) {
      throw err
    }
  }

  async function setAttribute(attr: any) {
    try {
      const res = await authorizer.setAttribute(attr)
      return res
    } catch (err) {
      throw err
    }
  }

  async function sendCode(username: string) {
    try {
      await authorizer.sendCode(username)
    } catch (err) {
      throw err
    }
  }

  async function forgotPassword(username: string, code: string, password: string) {
    try {
      await authorizer.forgotPassword(username, code, password)
    } catch (err) {
      throw err
    }
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    try {
      await authorizer.changePassword(oldPassword, newPassword)
    } catch (err) {
      throw err
    }
  }

  const state: IAuth = {
    authStatus,
    employee,
    attrInfo,
    getToken,
    signInWithEmail,
    completeNewPasswordChallenge,
    signOut,
    verifyCode,
    sendCode,
    forgotPassword,
    changePassword,
    getAttributes,
    setAttribute,
  }

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export default AuthProvider
