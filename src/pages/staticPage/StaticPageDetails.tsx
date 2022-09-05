import React, { useContext, useEffect, useState } from "react"
import { Alert, Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap"
import { useNavigate } from "react-router"
import { AuthContext } from "../../contexts/authContext"
import CenteredSpinner from "../../components/ui/CenteredSpinner"
import { useTranslation } from "react-i18next"
import classes from "./StaticPage.module.scss"
import { useParams } from "react-router"
import { getPageDetails, deletePage } from "../../api/ourstory"
import { languages, StaticPage } from "../../api/models"
const StaticPageDetails: React.FunctionComponent = ()=>{
    const {getToken} = useContext(AuthContext)
    const {t} = useTranslation()
    const [pageDetails, setPageDetails] = useState<StaticPage>()
    const [translationToAdd, setTranslationToAdd] = useState('')
    const [isFetching, setIsFetching] = useState(false)
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)
    const params = useParams()
    const navigate = useNavigate()
    const slug = params.slug
    const locale = params.locale

    useEffect(()=>{
        loadPage()
    }, [])

    const loadPage = async()=>{
        setIsFetching(true)
        const token = await getToken()
        getPageDetails(token, slug!, locale!)
        .then(page=>setPageDetails(page))
        .catch(error => console.log(error))
        .finally(()=> setIsFetching(false))
    }
    const addTranslation = ()=>{
        if(translationToAdd) navigate(`/pages/TRANSLATE/${pageDetails!.slug}/${translationToAdd}`)
    }
    const toEditPage = ()=>{
      navigate(`/pages/EDIT/${pageDetails!.slug}/${locale}`)
    }
    const removePage = async()=>{
      const token = await getToken()
      deletePage(token, pageDetails!.slug)
      .then(()=> navigate(`/pages`, {replace: true}))
      .catch(error=> console.log(error))
    }
    if (isFetching) return (
        <CenteredSpinner />
      )
    return pageDetails ? (
        <Container>
            <Row className={classes.info}>
                <Col sm={3}><strong>{t("label_static_page_slug")}</strong></Col>
                <Col sm={9}>{pageDetails.slug}</Col>
            </Row>
            <Row className={classes.info}>
                <Col sm={3}><strong>{t("label_title")}</strong></Col>
                <Col sm={9}>{pageDetails.name}</Col>
            </Row>
            <Row className={classes.info}>
                <Col sm={3}><strong>{t("label_description")}</strong></Col>
                <Col sm={9}>{pageDetails.description}</Col>
            </Row>
            <Row className={classes.info}>
                <Col sm={3}><strong>{t("label_static_page_layouts")}</strong></Col>
                <Col sm={9}>
                    {pageDetails.layouts.map((layout, index)=>(
                        <span key={index}>{t(`page_layout_${layout}`)} - </span>
                    ))}
                </Col>
            </Row>
            <Row className={classes.info}>
            <Col xs={3}>
                <strong>{t("label_available_translations")}</strong>
            </Col>
            <Col xs={9}>
                {pageDetails.availableTranslations?.map((locale, index) => (
                    <span key={index}>
                    {pageDetails.locale === locale ? (<p>{t(`language_${locale}`)} {' '}</p>) : (
                        <a href={`/pages/${pageDetails.slug}/${locale}`}>{t(`language_${locale}`)} {' '}</a>
                    )}
                    </span>
                ))}
            </Col>
        </Row>
        <Row className={classes.info}>
          <Col xs={3}>
            <Form.Select
              className={classes.input}
              value={translationToAdd}
              onChange={(e) => setTranslationToAdd(e.target.value)}
            >
              <option value="">---</option>
              {languages.map((locale, index) => {
                if (
                  !pageDetails.availableTranslations?.includes(locale) 
                ) {
                  return (
                    <option key={index} value={locale}>
                      {t(`language_${locale}`)}
                    </option>
                  )
                }
              })}
            </Form.Select>
          </Col>
          <Col xs={3}>
            <Button variant="light" onClick={addTranslation}>
              {t("button_add_translation")}
            </Button>
          </Col>
        </Row>
        <Row className={classes.info}>
            <Col sm={12}>
            <div className={classes.container} dangerouslySetInnerHTML={{__html: pageDetails.content!}}></div>
            </Col>
        </Row>
        
        <Row>
          <Col xs={6}>
          {showDeleteAlert && 
              <Alert show={showDeleteAlert} variant="danger">
                <Alert.Heading>{t('alert_header_delete_page')}</Alert.Heading>
                <p>
                  {t('alert_text_delete_page')}
                </p>
                <hr />
                <div className="d-flex justify-content-around">
                  <Button onClick={() => setShowDeleteAlert(false)} variant="outline-danger">
                    {t('button_cancel')}
                  </Button>
                  <Button onClick={removePage} variant="danger">
                    {t('button_confirm')}
                  </Button>
                </div>
              </Alert>
              }
          </Col>
        </Row>
        {!showDeleteAlert && 
          <Row>
          <Col xs={3}>
            <Button
                className={classes.submit}
                variant="dark"
                onClick={toEditPage}
              >
                {t("button_edit")}
              </Button>
          </Col>
          <Col xs={3}>
          <Button
            className={classes.deleteButton}
            variant="danger"
            onClick={()=> setShowDeleteAlert(true)}
          >
            {t("button_delete")}
          </Button>
          </Col>
        </Row>
        }
        </Container>
    ):(
        <p>{t("error_not_found")}</p>
    )
}

export default StaticPageDetails