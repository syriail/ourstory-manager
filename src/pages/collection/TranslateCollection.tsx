import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router"
import {
  Col,
  Container,
  Form,
  Row,
  Button,
  ProgressBar,
  InputGroup,
} from "react-bootstrap"
import { isEditor } from "../../utils"
import classes from "./Collections.module.scss"
import {useTranslation} from 'react-i18next'
import { useNavigate } from "react-router"
import {
  getCollectionById,
  saveCollectionTranslation
} from '../../api/ourstory'
import {Collection} from '../../api/models'
import { TranslateCollectionRequest } from "../../api/requests"
import { AuthContext } from "../../contexts/authContext"

const TranslateCollection: React.FunctionComponent<any> = (props) => {
    const {t}  = useTranslation()
    const navigate = useNavigate()
  const [collection, setCollection] = useState<Collection>()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<TagTranslation[]>([])
  const [errorMessage, setErrorMessage] = useState()
  const [beingUpdated, setBeingUpdated] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")
  const [invalidName, setInvalidName] = useState(false)
  const [invalidDescription, setInalidDescription] = useState(false)
  const [invalidTagName, setInvalidTagName] = useState(false)
  const routerParams = useParams()
  const {employee, getToken} = useContext(AuthContext)

  const locale = routerParams.locale
  const collectionId = routerParams.collectionId
  useEffect(() => {
    getCollection()
  }, [])
  const getCollection = async () => {
    if (collectionId && locale) {
      const token = await getToken()
      const theCollection = await getCollectionById(
        token, 
        collectionId,
        employee!.locale
      )
      if (theCollection) prepareTranslation(theCollection)
    }
  }
  const prepareTranslation = (collection: Collection) => {
    if (!collection) {
      setErrorMessage(t("error_not_found"))
    } else if (
      !isEditor(collection, employee?.id) &&
      collection.manager.id !== employee?.id
    ) {
      setErrorMessage(t("error_not_collection_editor"))
    } else {
      updateStates(collection)
    }
  }
  const updateStates = (collection: Collection) => {
    setCollection(collection)
    let tagsToTranslate = []
    if (collection.tags) {
      for (const tag of collection.tags) {
        tagsToTranslate.push({
          name: tag.name,
          slug: tag.slug,
          translation: "",
        })
      }
      setTags(tagsToTranslate)
    }
  }
  const updateTagTranslation = (slug:string, translation: string) => {
    let newTags = []
    for (const tag of tags) {
      if (tag.slug === slug) {
        newTags.push({ ...tag, translation })
      } else {
        newTags.push(tag)
      }
    }
    setTags(newTags)
  }
  const saveTranslation = async () => {
    if (validateCollectionInput()) {
      setBeingUpdated(true)
      setUpdateMessage(t("message_updating_collection"))
      const translatedTags = tags.map(tag=> {
        return {
          slug: tag.slug,
          name: tag.translation
        }
      })
      const request: TranslateCollectionRequest = {
        id: collection!.id,
        name,
        description,
        locale: locale!,
        tags: translatedTags
      }
      const token = await getToken()
      await saveCollectionTranslation(token, request)
      setBeingUpdated(false)
      navigate(`/collections/${collection!.id}`)
    }
  }
  const validateCollectionInput = () => {
    let valid = true
    if (!name || name.trim() === "") {
      valid = false
      setInvalidName(true)
    } else {
      setInvalidName(false)
    }
    if (!description || description.trim() === "") {
      valid = false
      setInalidDescription(true)
    } else {
      setInalidDescription(false)
    }
    let tagsValid = true
    for (const tag of tags) {
      if (!tag.translation || tag.translation.trim() === "") {
        tagsValid = false
        setInvalidTagName(true)
        break
      }
    }
    if (!tagsValid) valid = false
    return valid
  }
  const cancel = () => {
    props.history.goBack()
  }
  return beingUpdated ? (
    <div>
      <strong>{t("message_being_updated")}</strong>
      <ProgressBar animated now={45} />
      {updateMessage}
    </div>
  ) : !errorMessage && collection ? (
    <Container>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_language")}</strong>
        </Col>
        <Col xs={9}>
          <span>{t(`language_${locale}`)}</span>
        </Col>
      </Row>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_collection_manager")}</strong>
        </Col>
        <Col xs={9}>{`${collection.manager.firstName} ${collection.manager.lastName}`}</Col>
      </Row>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_name")}</strong>
        </Col>
        <Col xs={9}>
          <div>{collection.name}</div>
          <InputGroup className={classes.input} hasValidation>
            <Form.Control
              type="text"
              required
              isInvalid={invalidName}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              {t("error_collection_name_required")}
            </Form.Control.Feedback>
          </InputGroup>
        </Col>
      </Row>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_description")}</strong>
        </Col>
        <Col xs={9}>
          <div>{collection.description}</div>
          <InputGroup className={classes.input} hasValidation>
            <Form.Control
              as="textarea"
              required
              isInvalid={invalidDescription}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              {t("error_collection_description_required")}
            </Form.Control.Feedback>
          </InputGroup>
        </Col>
      </Row>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_tags")}</strong>
        </Col>
        <Col xs={9}>
          {tags.map((tag, index) => (
            <div key={index} className={classes.tagForm}>
              <span>{tag.name}</span>
              <InputGroup className={classes.input} hasValidation>
                <Form.Control
                  type="text"
                  required
                  isInvalid={invalidTagName}
                  value={tag.translation}
                  onChange={(e) => updateTagTranslation(tag.slug, e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  {t("error_tag_name")}
                </Form.Control.Feedback>
              </InputGroup>
            </div>
          ))}
        </Col>
      </Row>
      <Row className={classes.info}> </Row>
      <Row className={classes.info}>
        <Col xs={3}></Col>
        <Col xs={9}>
          <div className={classes.actionContainer}>
            <Button
              className={classes.submit}
              variant="dark"
              onClick={saveTranslation}
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
  ) : (
    <p>{errorMessage}</p>
  )
}

interface TagTranslation{
    slug: string
    name: string
    translation: string
}

export default TranslateCollection
