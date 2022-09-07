import { useContext, useEffect, useState } from "react"
import Container from "react-bootstrap/Container"
import Table from "react-bootstrap/Table"
import Button from "react-bootstrap/Button"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import {useTranslation} from 'react-i18next'
import { useNavigate } from "react-router"
import { AuthContext } from "../../contexts/authContext"
import CenteredSpinner from "../../components/ui/CenteredSpinner"
import { Employee } from "../../api/models"
import { getEmployees } from "../../api/ourstory"

const UsersPage: React.FunctionComponent = ()=>{
    const [employees, setEmployees] = useState<Employee[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const {getToken} = useContext(AuthContext)
    const {t} = useTranslation()
    const navigate = useNavigate()

    useEffect(()=>{
      loadEmployees()
    }, [])

    const loadEmployees = async()=>{
      setIsFetching(true)
      const token = await getToken()
      getEmployees(token)
      .then(employees => setEmployees(employees))
      .catch(error=> console.log(error))
      .finally(()=> setIsFetching(false))
    }

    const toAddUser = ()=>{
      navigate('/users/add')
    }
    const showDetails = (id: string)=>{}
    return (
        <Container fluid >
      <Row>
        <Col xs={10}>
          <h2>{t("label_users")}</h2>
        </Col>
        <Col xs={2}>
          <Button variant="dark" onClick={toAddUser} style={{width:"100%"}}>
            {t("button_add_user")}
          </Button>
        </Col>
      </Row>
      
      <Table striped bordered hover>
      <thead>
          <tr>
            <th>{t("label_name")}</th>
            <th>{t("label_language")}</th>
            <th>{t("label_email")}</th>
            <th>{t("label_roles")}</th>
          </tr>
        </thead>
      <tbody>
          {employees.map((employee, index) => (
            <tr key={index} onClick={() => showDetails(employee.id)}>
              <td>{`${employee.firstName} ${employee.lastName}`}</td>
              <td>
                {t(`language_${employee.locale}`)}
              </td>
              <td>{employee.email}</td>
              <td>
                {employee.roles?.map((role, index) => (
                  <div
                    key={index}
                  >{t(`role_${role}`)}</div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {isFetching && 
          <CenteredSpinner />
        }
      </Container>
    )
}

export default UsersPage