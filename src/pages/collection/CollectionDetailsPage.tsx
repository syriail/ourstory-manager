import { useContext, useEffect } from "react"
import { useState } from "react"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import classes from "./Collections.module.scss"
import { useTranslation } from "react-i18next"
import { getFormattedDate } from "../../utils"
import { Button, Form } from "react-bootstrap"
import {Collection, languages} from '../../api/models'
import { useNavigate, useParams } from "react-router"
import { AuthContext } from "../../contexts/authContext"
import { getCollectionById } from "../../api/ourstory"

const CollectionDetails: React.FunctionComponent = () => {
  const [collection, setCollection] = useState<Collection>()
  const [translationToAdd, setTranslationToAdd] = useState("")
  const {employee, getToken} = useContext(AuthContext)
  const {t} = useTranslation()
  const navigate = useNavigate()
    const params = useParams()
  const collectionId = params.collectionId
  useEffect(() => {
    getCollection()
  }, [])
  const getCollection = async() => {
    if(collectionId){
      const token = await getToken()
        getCollectionById(token, collectionId!, employee!.locale)
    .then(c => setCollection(c))
    }else{
        navigate('/', {replace: true})
    }
    
  }

  const addTranslation = () => {
    if (translationToAdd && translationToAdd !== "")
      navigate(`/collections/translate/${collection!.id}/${translationToAdd}`)
  }

  return collection ? (
    <Container>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_name")}</strong>
        </Col>
        <Col xs={9}>
          <span>{collection.name}</span>
        </Col>
      </Row>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_default_language")}</strong>
        </Col>
        <Col xs={9}>
          <span>{t(`language_${collection.defaultLocale}`)}</span>
        </Col>
      </Row>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_available_translations")}</strong>
        </Col>
        <Col xs={9}>
          {collection.availableTranslations.map((locale, index) => (
            <span key={index}>{t(`language_${locale}`) + ' '}</span>
          ))}
        </Col>
      </Row>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_description")}</strong>
        </Col>
        <Col xs={9}>
          <span>{collection.description}</span>
        </Col>
      </Row>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_create_date")}</strong>
        </Col>
        <Col xs={9}>{getFormattedDate(collection.createdAt)}</Col>
      </Row>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_collection_manager")}</strong>
        </Col>
        <Col
          xs={9}
        >{`${collection.manager.firstName} ${collection.manager.lastName}`}</Col>
      </Row>

      {collection.editors && (
        <Row className={classes.info}>
          <Col xs={3}>
            <strong>{t("label_editors")}</strong>
          </Col>
          <Col xs={9}>
            {collection.editors.map((editor, index) => (
              <div key={index}>{`${editor.firstName} ${editor.lastName}`}</div>
            ))}
          </Col>
        </Row>
      )}
      {collection.tags && (
        <Row className={classes.info}>
          <Col xs={3}>
            <strong>{t("label_tags")}</strong>
          </Col>
          <Col xs={9}>
            {collection.tags.map((tag, index) => (
              <div key={index}>
                <span>{tag.name}</span>
              </div>
            ))}
          </Col>
        </Row>
      )}
      <Row className={classes.info}>
        <Col xs={3}>
          <Form.Select
            className={classes.input}
            value={translationToAdd}
            onChange={(e)=> setTranslationToAdd(e.target.value)}
          >
            <option value="">---</option>
            {languages.map((key, index) => {
              if (
                key !== collection.defaultLocale &&
                !collection.availableTranslations.includes(key)
              ) {
                return (
                  <option key={index} value={key}>
                    {t(`language_${key}`)}
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
    </Container>
  ) : (
    <p>{t("error_not_found")}</p>
  )
}
export default CollectionDetails
