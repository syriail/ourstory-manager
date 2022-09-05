import { Button, Col, Container, Row, Table } from "react-bootstrap"
import { useNavigate } from "react-router"
import {useTranslation} from 'react-i18next'
import { AuthContext } from "../../contexts/authContext"
import CenteredSpinner from "../../components/ui/CenteredSpinner"
import { useContext, useEffect, useState } from "react"
import { StaticPage } from "../../api/models"
import { getPages } from "../../api/ourstory"

const StaticPages: React.FunctionComponent = ()=>{
    const {employee, getToken} = useContext(AuthContext)
    const {t} = useTranslation()
    const navigate = useNavigate()
    const [pages, setPages] = useState<StaticPage[]>([])
    const [isFetching, setIsFetching] = useState(false)
    useEffect(()=>{
        loadPages()
    }, [])

    const loadPages = async(locale?: string)=>{
        setIsFetching(true)
        const localeToUse = locale || employee!.locale
        const token = await getToken()
        getPages(token, localeToUse)
        .then(pages => setPages(pages))
        .catch(error=> console.log(error))
        .finally(()=> setIsFetching(false))
    }
    const showDetails = (page: StaticPage)=>{
      navigate(`/pages/${page.slug}/${page.locale}`)
    }
    const toAddStaticPage = ()=>{
        navigate(`/pages/ADD/${employee?.locale}`)
    }
    return (
        <Container fluid >
      <Row>
        <Col xs={10}>
          <h2>{t("label_static_pages")}</h2>
        </Col>
        <Col xs={2}>
          <Button variant="dark" onClick={toAddStaticPage} style={{width:"100%"}}>
            {t("button_add_static_page")}
          </Button>
        </Col>
      </Row>
      
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t("label_static_page_slug")}</th>
            <th>{t("label_title")}</th>
            <th>{t("label_description")}</th>
          </tr>
        </thead>
        
        <tbody>
        {pages.map((page, index) => (
            <tr key={index} onClick={() => showDetails(page)}>
              <td>{page.slug}</td>
              <td>{page.name}</td>
              <td>{page.description}</td>
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
export default StaticPages