import { Button, Col, Container, Form, Row, Table } from "react-bootstrap"
import { useNavigate } from "react-router"
import {useTranslation} from 'react-i18next'
import { AuthContext } from "../../contexts/authContext"
import CenteredSpinner from "../../components/ui/CenteredSpinner"
import { useContext, useEffect, useState } from "react"
import { StaticPage, languages } from "../../api/models"
import { getPages } from "../../api/ourstory"
import classes from './StaticPage.module.scss'

const StaticPages: React.FunctionComponent = ()=>{
    const {employee, getToken} = useContext(AuthContext)
    const {t} = useTranslation()
    const navigate = useNavigate()
    const [pages, setPages] = useState<StaticPage[]>([])
    const [locale, setLocale] = useState('')
    const [isFetching, setIsFetching] = useState(false)
    useEffect(()=>{
        setLocale(employee!.locale)
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
    const localeChanged = (locale: string)=>{
      setLocale(locale)
      loadPages(locale)
    }
    const showDetails = (page: StaticPage)=>{
      navigate(`/pages/${page.slug}/${page.locale}`)
    }
    const toAddStaticPage = ()=>{
        navigate(`/pages/ADD/${locale}`)
    }
    return (
        <Container fluid >

        <Row>
          <Col xs={5}>
            <h2>{t("label_static_pages")}</h2>
          </Col>
          <Col xs={5}>
          <Form.Select
              className={classes.input}
              value={locale}
              onChange={(e) => localeChanged(e.target.value)}
            >
              <option value="">---</option>
              {languages.map((locale, index) => (
                    <option key={index} value={locale}>
                      {t(`language_${locale}`)}
                    </option>
                  ))}
            </Form.Select>
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