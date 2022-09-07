import { useContext, useState } from "react"
import { Alert, Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap"
import { EmployeeRole, languages } from "../../api/models"
import classes from './Users.module.scss'
import {useTranslation} from 'react-i18next'
import { useNavigate } from "react-router"
import { Username } from "../../components/auth/authFields"
import { useValidUsername } from "../../hooks/useAuthHooks"
import { AuthContext } from "../../contexts/authContext"
import { createEmployee } from "../../api/ourstory"
import { CreateEmployeeRequest } from "../../api/requests"

const AddUserPage: React.FunctionComponent = ()=>{
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [locale, setLocale] = useState("ar")
    const { username, setUsername, usernameIsValid } = useValidUsername('')
    const [password, setPassword] = useState("")
    const [roles, setRoles] = useState<EmployeeRole[]>([])
    const [isInvalidFirstName, setIsInvalidFirstName] = useState(false)
    const [isInvalidLastName, setIsInvalidLastName] = useState(false)
    const [isInvalidPassword, setIsInvalidPassword] = useState(false)
    const [isInvalidRoles, setIsInvalidRoles] = useState(false)
    const {getToken} = useContext(AuthContext)
    const {t} = useTranslation()
    const navigate = useNavigate()

    const submit = async()=>{
        if(!validateInput()) return
        const token = await getToken()
        const request: CreateEmployeeRequest = {
            firstName,
            lastName,
            email: username,
            password,
            roles,
            locale
        }
        createEmployee(token, request)
        .then(()=> navigate('/users', {replace: true}))
        .catch(error=>console.log(error))
    }

    const validateInput = ()=>{
        let valid = true
        if(!firstName || firstName.trim() === ''){
            valid = false
            setIsInvalidFirstName(true)
        }
        if(!lastName || lastName.trim() === ''){
            valid = false
            setIsInvalidLastName(true)
        }
        if(!password || password.length < 8){
            valid = false
            setIsInvalidPassword(true)
        }
        if(roles.length === 0){
            valid = false
            setIsInvalidRoles(true)
        }
        return valid
    }

    const handleRoleToggle = (role: EmployeeRole)=>{
        if(roles.includes(role)){
          let newRoles = roles.filter(r => r !== role)
          setRoles(newRoles)
        }else{
          setRoles([...roles, role])
        }
      }

    const cancel = ()=>{
        navigate(-1)
    }
    return (
        <Container>
            <Row className={classes.info}>
                <Col lg={5}>
                    <InputGroup >
                    <Form.Control
                        
                        type="text"
                        value={firstName}
                        placeholder={t("label_firstName")}
                        isInvalid={isInvalidFirstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Form.Control.Feedback type="invalid">
                        {t('error_user_firstName_required')}
                    </Form.Control.Feedback>
                    </InputGroup>
                </Col>
            </Row>
            <Row className={classes.info}>
                <Col lg={5}>
                    <InputGroup hasValidation >
                        <Form.Control
                            type="text"
                            value={lastName}
                            placeholder={t("label_lastName")}
                            isInvalid={isInvalidLastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            {t('error_user_lastName_required')}
                        </Form.Control.Feedback>
                    </InputGroup>
                </Col>
            </Row>
            <Row className={classes.info}>
                <Col lg={5}>
                    <Username username={username} usernameIsValid={usernameIsValid} setUsername={setUsername} />
                </Col>
            </Row>
            <Row className={classes.info}>
                <Col lg={5}>
                    <InputGroup hasValidation >
                        <Form.Control
                            type="text"
                            value={password}
                            placeholder={t("label_temp_password")}
                            isInvalid={isInvalidPassword}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            {t('error_temp_password_required')}
                        </Form.Control.Feedback>
                    </InputGroup>
                </Col>
            </Row>
            <Row className={classes.info}>
                <Col lg={1}>
                    {t("label_language")}
                </Col>
                <Col lg={4}>
                    <Form.Select
                        value={locale}
                        onChange={e=>setLocale(e.target.value)}
                        >
                        {languages.map((language, index) => (
                            <option key={index} value={language}>
                            {t(`language_${language}`)}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>
            
            <Row className={classes.info}>
                <Col lg={5}>
                    <div>{t("label_roles")}</div>
                    <Alert variant={isInvalidRoles ? "danger" : "light" }>{t('error_role_required')}</Alert>
                    {Object.values(EmployeeRole).map((role, i) => (
                        <div key={i} className={classes.roleContainer}>
                            <Form.Check key={i}
                            className={classes.checkbox}
                            type='checkbox'
                            label={t(`role_${role}`)}
                            checked={roles.includes(role)}
                            onChange={()=> handleRoleToggle(role)}
                            />
                        </div>
                    ))}
                  </Col>
              </Row>
              <Row>
                <Col lg={5}>
                <div className={classes.actionContainer}>
                <Button
                  className={classes.submit}
                  variant="dark"
                  onClick={submit}
                >
                  {t("button_save")}
                </Button>
                
                <Button variant="outline-dark" onClick={cancel}>
                  {t("button_cancel")}
                </Button>
                </div>
                </Col>
              </Row>
      </Container>
    )
}

export default AddUserPage