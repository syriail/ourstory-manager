import React, { useEffect, useState, useContext } from "react"
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
import { connect } from "react-redux"
import classes from "./Collections.module.scss"
import {
  getEmployeesByRole,
  getCollectionById,
  updateCollection,
  createCollection
} from '../../api/ourstory'
import {Collection, Employee, EmployeeRole, Tag, languages} from '../../api/models'
import { useTranslation } from "react-i18next"
import { AuthContext } from "../../contexts/authContext"
import { useNavigate } from "react-router"
import { collectionAdded, collectionUpdated } from "../../store/actions"
import { CreateCollectionRequest } from "../../api/requests"
import CenteredSpinner from "../../components/ui/CenteredSpinner"


const MutateCollectionPage: React.FunctionComponent<{action: string, collectionCreated:(collection: Collection)=>void, collectionUpdated:(collection: Collection)=>void}> = (props) => {
    const {t, i18n} = useTranslation()
    const {employee, getToken} = useContext(AuthContext)
    const navigate = useNavigate()
  const [collection, setCollection] = useState<Collection>()
  const [manager, setManager] = useState(employee)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<Tag[]>([])
  const [editors, setEditors] = useState<Employee[]>([])
  const [tagSlug, setTagSlug] = useState("")
  const [tagName, setTagName] = useState("")
  const [errorMessage, setErrorMessage] = useState('')
  const [tagToEdit, setTagToEdit] = useState<Tag>()
  const [allEditors, setAllEditors] = useState<Employee[]>([])
  const [beingUpdated, setBeingUpdated] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")
  const [defaultLocale, setDefaultLocale] = useState(employee!.locale!)
  const [invalidName, setInvalidName] = useState(false)
  const [invalidDescription, setInalidDescription] = useState(false)
  const [invalidTagSlug, setInvalidTagSlug] = useState(false)
  const [invalidTagName, setInvalidTagName] = useState(false)
  const [beingLoaded, setBeingLoaded] = useState(true)
  
  const routerParams = useParams()

  const collectionId = routerParams.collectionId
  const locale = routerParams.locale

  useEffect(() => {
    getAllEditors()
    getCollection()
  }, [])

  const getAllEditors = () => {
    getToken().then((token: string)=>{
      getEmployeesByRole(token, EmployeeRole.EDITOR)
      .then((editors) => {
        setAllEditors(editors)
      })
      .catch((error) => console.log(error))
    })
    
  }
  const prepareMutation = (theCollection?: Collection) => {
    switch (props.action) {
      case 'ADD':
        if (!employee?.roles?.includes(EmployeeRole.ADMIN)) {
          setErrorMessage(t("error_not_collection_manager"))
        }else{
          updateStates()
        }
        break
      case 'EDIT':
        if (!theCollection) {
          setErrorMessage(t("error_not_found"))
        } else if (theCollection.manager.id !== employee?.id) {
          setErrorMessage(t("error_not_collection_manager"))
        } else {
          updateStates(theCollection)
        }
        break
    }
  }
  const getCollection = async () => {
    if (collectionId && locale) {
      const token = await getToken()
      getCollectionById(token, collectionId, locale)
      .then(collection => prepareMutation(collection))
      .catch(error=> console.log(error))
    }else{
      prepareMutation()
    }
    
  }
  const updateStates = (collection?: Collection) => {
    if(collection){
      setManager(collection.manager)
      setCollection(collection)
      setName(collection.name)
      setDescription(collection.description ? collection.description : "")
      setDefaultLocale(collection.defaultLocale)
      if (collection.tags) setTags(collection.tags)
      if (collection.editors) setEditors(collection.editors)
    }else{
      setDefaultLocale(employee!.locale!)
    }
    setBeingLoaded(false)
  }
  const tagNameChanged = (e: { target: { value: any } }) => {
    const value = e.target.value
    setTagName(value)
    tagSlugChanged(value)
  }
  const tagSlugChanged = (value: string) => {
    if (value.trim() === "") {
      setTagSlug(value)
      return
    }
    let slug = value.replaceAll(" ", "_")
    const regex = /([A-Za-z_]+)/g
    const match = slug.match(regex)
    if (match && match.length === 1 && match[0]===slug) setTagSlug(slug.toLowerCase())
  }
  const saveTag = () => {
    if (validateTag()) {
      if (tagToEdit) {
        updateTag()
      } else {
        addTag()
      }
    }
  }
  const addTag = () => {
    setTags([
      ...tags,
      {
        slug: tagSlug,
        name: tagName,
      },
    ])
    setTagName("")
    setTagSlug("")
    setInvalidTagSlug(false)
    setInvalidTagName(false)
  }
  const updateTag = () => {
    if(tagToEdit){
      let newTags: Tag[] = []
      for (const tag of tags) {
        if (tagToEdit.slug === tag.slug) {
          newTags.push({ slug: tagSlug, name: tagName })
        } else {
          newTags.push(tag)
        }
      }
      setTags(newTags)
      setTagToEdit(undefined)
      setTagName("")
      setTagSlug("")
    }   
  }
  const removeTag = (slug: string) => {
    let newTags = []
    for (const tag of tags) {
      if (tag.slug !== slug) newTags.push(tag)
    }
    setTags(newTags)
  }
  const editTag = (tag: Tag) => {
    setTagToEdit(tag)
    setTagName(tag.name ? tag.name : "")
    setTagSlug(tag.slug)
  }
  const addEditor = (e: { target: { value: string } }) => {
    let alreadyExists = false
    for (const editor of editors) {
      if (editor.id === e.target.value) {
        alreadyExists = true
        break
      }
    }
    if (!alreadyExists) {
      for (const editor of allEditors) {
        if (editor.id === e.target.value) {
          setEditors([...editors, editor])
          break
        }
      }
    }
  }
  const removeEditor = (id: string) => {
    let newEditors = []
    for (const editor of editors) {
      if (editor.id !== id) newEditors.push(editor)
    }
    setEditors(newEditors)
  }
  const saveCollection = () => {
    if (validateCollectionInput()) {
      switch (props.action) {
        case 'ADD':
          addNewCollection()
          break
        case 'EDIT':
          saveUpdatedCollection()
          break
      }
    }
  }
  const addNewCollection = async () => {
    console.log('add new collection')
    setBeingUpdated(true)
    setUpdateMessage(t("message_updating_collection"))
    const createRequest: CreateCollectionRequest = {
      name,
      defaultLocale,
      description,
      editors: editors? editors.map(editor => editor.id) : [],
      tags
    }
    const token = await getToken()
    const collection  = await createCollection(token, createRequest)
    props.collectionCreated(collection)
     setBeingUpdated(false)
     navigate('/', {replace: true})
  }
  const saveUpdatedCollection = async () => {
    let collectionToUpdate = collection
    if(collectionToUpdate){
      setBeingUpdated(true)
      setUpdateMessage(t("message_updating_collection"))
      
      collectionToUpdate.name = name
      collectionToUpdate.description = description
      collectionToUpdate.editors = editors
      collectionToUpdate.tags = tags
      const token = await getToken()
      await updateCollection(token, collectionToUpdate)
      props.collectionUpdated(collectionToUpdate)
      setBeingUpdated(false)
      navigate('/', {replace: true})
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
    return valid
  }
  const validateTag = () => {
    let valid = true
    if (!tagName || tagName.trim() === "") {
      valid = false
      setInvalidTagName(true)
    } else {
      setInvalidTagName(false)
    }
    if (!tagSlug || tagSlug.trim() === "") {
      valid = false
      setInvalidTagSlug(true)
    } else {
      setInvalidTagSlug(false)
    }
    return valid
  }
  const cancel = () => {
    navigate(-1)
  }
  return beingUpdated ? (
    <div>
      <strong>{t("message_being_updated")}</strong>
      <ProgressBar animated now={45} />
      {updateMessage}
    </div>
  ) : !errorMessage ? (
    <Container>
      {beingLoaded &&
        <CenteredSpinner />
      }
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_language")}</strong>
        </Col>
        <Col xs={9}>
          {props.action === 'ADD' && (
            <Form.Select
              className={classes.input}
              value={locale}
              onChange={e=>setDefaultLocale(e.target.value)}
            >
              {languages.map((language, index) => (
                <option key={index} value={language}>
                  {t(`language_${language}`)}
                </option>
              ))}
            </Form.Select>
          )}
          {props.action === 'EDIT' && (
            <span>{t(`language_${locale}`)}</span>
          )}
        </Col>
      </Row>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_name")}</strong>
        </Col>
        <Col xs={9}>
        <InputGroup className={classes.input} hasValidation>
              <Form.Control
                type="text"
                required
                isInvalid={invalidName}
                placeholder={t("label_name")}
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
        <InputGroup className={classes.input} hasValidation>
              <Form.Control
                className={classes.input}
                as="textarea"
                rows={4}
                required
                isInvalid={invalidDescription}
                placeholder={t("label_description")}
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
          <strong>{t("label_collection_manager")}</strong>
        </Col>
        <Col xs={9}>{`${manager?.firstName} ${manager?.lastName}`}</Col>
      </Row>

      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_editors")}</strong>
        </Col>
        <Col xs={9}>
          <Form.Select className={classes.input} onChange={addEditor}>
            <option>----</option>
            {allEditors.map((editor, index) => (
              <option
                key={index}
                value={editor.id}
              >{`${editor.firstName} ${editor.lastName}`}</option>
            ))}
          </Form.Select>
          {editors.map((editor, index) => (
            <div key={index}>
              <span>{`${editor.firstName} ${editor.lastName}`}</span>
              <Button
                variant="link"
                onClick={(e) => {
                  removeEditor(editor.id)
                }}
              >
                {t("button_remove")}
              </Button>
            </div>
          ))}
        </Col>
      </Row>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_tags")}</strong>
        </Col>
        <Col xs={9}>
          {tags.map((tag, index) => (
            <div key={index}>
              <span>{tag.name}</span>{" "}
              <Button
                variant="link"
                onClick={(e) => {
                  removeTag(tag.slug)
                }}
              >
                {t("button_remove")}
              </Button>
              <Button
                variant="link"
                onClick={(e) => {
                  editTag(tag)
                }}
              >
                {t("button_edit")}
              </Button>
            </div>
          ))}
          <Form>
            <div className={classes.tagForm}>
              <InputGroup hasValidation>
                <Form.Control
                  type="text"
                  required
                  isInvalid={invalidTagSlug}
                  placeholder={t("label_name")}
                  value={tagName}
                  onChange={tagNameChanged}
                />
                <Form.Control.Feedback type="invalid">
                  {t("error_tag_name")}
                </Form.Control.Feedback>
                
              </InputGroup>
              <InputGroup hasValidation>
                <Form.Control
                  type="text"
                  required
                  isInvalid={invalidTagName}
                  placeholder={t("label_slug")}
                  value={tagSlug}
                  onChange={(e)=> tagSlugChanged(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  {t("error_tag_slug_required")}
                </Form.Control.Feedback>
                <div className={classes.tooltip}>
                <span className="material-symbols-outlined">help</span>
                <span className={classes.tooltiptext}>{t("tooltip_slug")}</span>
          </div>
              </InputGroup>
            </div>
            <Button variant="light" onClick={saveTag}>
              {tagToEdit ? t("button_save") : t("button_add_tag")}
            </Button>
          </Form>
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
              onClick={saveCollection}
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
const mapStateToProps = (state: any) => {
  return {
    collections: state.collections.collections
  }
}

const mapDispatchToProps = (dispatch: any)=>{
  return {
    collectionUpdated: (collection: Collection)=> dispatch(collectionUpdated(collection)),
    collectionCreated: (collection: Collection)=> dispatch(collectionAdded(collection))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MutateCollectionPage)
