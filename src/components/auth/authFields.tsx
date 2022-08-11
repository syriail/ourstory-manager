import React from 'react'
import {
    Form,
    InputGroup,
  } from "react-bootstrap"
import {useTranslation} from 'react-i18next'
import classes from './Auth.module.scss'

export const Password: React.FunctionComponent<{
    password: string
    label: string
  passwordIsValid: boolean
  setPassword: (_: string) => void
}> = ({ label, password, passwordIsValid, setPassword }) => {
  
  return (
    <div className={classes.input}>
        <InputGroup hasValidation >
            <Form.Control
                
                type='password'
                required
                isInvalid={!passwordIsValid}
                placeholder= {label}
                value={password}
                onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setPassword(evt.target.value)
                    }}
            />
            <Form.Control.Feedback type="invalid">
                Invalid password
            </Form.Control.Feedback>
        </InputGroup>
    </div>

  )
}

export const Username: React.FunctionComponent<{ username: string, usernameIsValid: boolean, setUsername: (_: string) => void }> = ({
    username,
  usernameIsValid,
  setUsername,
}) => {
  const {t} = useTranslation()
  return (
    <div className={classes.input}>
    <InputGroup hasValidation>
        <Form.Control
            
            type="email"
            required
            isInvalid={!usernameIsValid}
            value={username}
            placeholder= {t('label_email')}
            onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>) => {
                setUsername(evt.target.value)
                }}
        />
        <Form.Control.Feedback type="invalid">
        Invalid username
        </Form.Control.Feedback>
    </InputGroup>
    </div>
  )
}

export const Code: React.FunctionComponent<{ code: string, codeIsValid: boolean, setCode: (_: string) => void }> = ({
    code,
  codeIsValid,
  setCode,
}) => {
  return (
    <InputGroup hasValidation>
        <Form.Control
            width={'100%'}
            type="text"
            required
            isInvalid={!codeIsValid}
            value={code}
            onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>) => {
                setCode(evt.target.value)
                }}
        />
        <Form.Control.Feedback type="invalid">
        Invalid code
        </Form.Control.Feedback>
    </InputGroup>
  )
}
