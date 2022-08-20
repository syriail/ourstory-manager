import { Fragment, useContext, useEffect, useState } from "react"

import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  ProgressBar,
  Row,
} from "react-bootstrap"
import classes from "./Stories.module.scss"
import {Collection, StoryType, MediaFormat, languages, MediaFile, Gender, TagValue, Story} from '../../api/models'
import {CreateStoryRequest, TagValueRequest} from '../../api/requests'
import {createStory, deleteStoryPermanently, getCollectionById, getStoryDetails, updateStory} from '../../api/ourstory'
import {useTranslation} from 'react-i18next'
import { AuthContext } from "../../contexts/authContext"
import { useNavigate, useParams } from "react-router"
import {TagValueInputProps} from './utils'
import CenteredSpinner from "../../components/ui/CenteredSpinner"



const MutateStroyPage: React.FunctionComponent<any> = (props) => {
    const {employee, getToken} = useContext(AuthContext)
  const [collection, setCollection] = useState<Collection>()
  const [story, setStory] = useState<Story>()
  const [tagValues, setTagValues] = useState<TagValueInputProps[]>([])
  const [title, setTitle] = useState("")
  const [storyTypes, setStoryTypes] = useState<StoryType[]>([])
  const [researcherName, setResearcherName] = useState("")
  const [abstraction, setAbstraction] = useState("")
  const [transcript, setTranscript] = useState("")
  const [tellerName, setTellerName] = useState("")
  const [age, setAge] = useState("")
  const [origin, setOrigin] = useState("")
  const [residency, setResidency] = useState("")
  const [gender, setGender] = useState("UNSPECIFIED")
  const [defaultLocale, setDefaultLocale] = useState(employee!.locale)
  const [beingUpdated, setBeingUpdated] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isTitleValid, setIsTitleValid] = useState(true)
  const [isStoryTypeValid, setIsStoryTypeValid] = useState(true)
  const [isTranscriptValid, setIsTranscriptValid] = useState(true)
  const [beingLoaded, setBeingLoaded] = useState(true)

  const {t} = useTranslation()
  const navigate = useNavigate()

  const params = useParams()

  const collectionId = params.collectionId
  const storyId = params.storyId
  const locale = params.locale
  useEffect(() => {
    setDefaultLocale(locale!)
    getCollection()
  }, [])


  const getCollection = async () => {
    const token = await getToken()
    const collection = await getCollectionById(token, collectionId!, locale!)
    if(props.action === 'EDIT'){
      const story = await getStoryDetails(token, storyId!, locale!)
      setStory(story)
      prepareMutation(collection, story)
    }else if(props.action === 'ADD'){
      prepareMutation(collection)
    }
    setBeingLoaded(false)
  }
  const prepareMutation = (collection: Collection, story?:Story) => {
    if (collection) {
      setCollection(collection)
      let tagValues = []
      if(!story){
        if(collection.tags){
          for (const tag of collection.tags) {
            tagValues.push({
              slug: tag.slug,
              name: tag.name,
              value: "",
            })
          }
        }
      }else{
        setTitle(story.storyTitle)
        setAbstraction(story.storyAbstraction || '')
        setTranscript(story.storyTranscript || '')
        setAge(story.storyTellerAge ? `${story.storyTellerAge}` : '')
        setGender(story.storyTellerGender || 'UNSPECIFIED')
        setOrigin(story.storyTellerPlaceOfOrigin || '')
        setResearcherName(story.storyCollectorName || '')
        setResidency(story.storyTellerResidency || '')
        // const storyTypes: StoryType[] = []
        // for(const sType of story.storyType){
        //   storyTypes.push(sType as StoryType)
        // }
        setStoryTypes(story.storyType as StoryType[])
        if(collection.tags){
          for (const tag of collection.tags) {
            const storyTag = story.tags?.find(t=> t.slug === tag.slug)
            tagValues.push({
              slug: tag.slug,
              name: tag.name,
              value: storyTag ? storyTag.value : '',
            })
          }
        }
      }
      
      
      setTagValues(tagValues)
    }
  }

  const tagValueChanged = (slug: string, value: string) => {
    if(!value || value.trim() === '') return
    let tags = []
    for (const tag of tagValues) {
      if (tag.slug === slug) {
        tags.push({ ...tag, value })
      } else {
        tags.push(tag)
      }
    }
    setTagValues(tags)
  }
  const saveStory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(validateForm()){
      if(props.action === 'ADD'){
        addNewStory()
      }else if(props.action === 'EDIT'){
        saveUpdatedStory()
      }
    }
    
    
  }
  const addNewStory = async () => {
    setBeingUpdated(true)
    setUpdateMessage(t("message_updating_story"))
    const storyDetails = buildStoryRequest()
    const token = await getToken()
    const story = await createStory(token, storyDetails)

    navigate(`/stories/details/${story.id}`, {replace: true})
  }

  const saveUpdatedStory = async()=>{
    setBeingUpdated(true)
    setUpdateMessage(t("message_updating_story"))
    const storyDetails = buildStoryRequest()
    const token = await getToken()
    await updateStory(token, storyId!, storyDetails)
    navigate(`/stories/details/${storyId}`, {replace: true})
  }

  const buildStoryRequest = (): CreateStoryRequest=>{
    let TagValuesRequest: TagValueRequest[] = []
    for(const tagValue of tagValues){
      if(tagValue.value && tagValue.value.trim() !== ''){
        TagValuesRequest.push({
          slug: tagValue.slug,
          value: tagValue.value
        })
      }
    }
    let storyDetails: CreateStoryRequest = {
        collectionId: collection!.id,
        defaultLocale: collection!.defaultLocale,
        storyTitle: title,
        storyType: storyTypes,
        tags: TagValuesRequest
    }
    if (age && age.trim() !== "") {
        storyDetails.storyTellerAge = parseInt(age)
    }
    if(abstraction && abstraction.trim() !== '') storyDetails.storyAbstraction = abstraction
    if(transcript && transcript.trim() !== '') storyDetails.storyTranscript = transcript
    if(tellerName && tellerName.trim() !== '') storyDetails.storyTellerName = tellerName
    if(origin && origin.trim() !== '') storyDetails.storyTellerPlaceOfOrigin = origin
    if(residency && residency.trim() !== '') storyDetails.storyTellerResidency = residency
    if(researcherName && researcherName.trim() !== '') storyDetails.storyCollectorName = researcherName
    if(gender) storyDetails.storyTellerGender = gender
    return storyDetails
  }
  const validateForm = (): boolean=>{
    let valid = true
    if(!title || title.trim() === ''){
      valid = false
      setIsTitleValid(false)
    }
    if(!transcript || transcript.trim() === ''){
      valid = false
      setIsTranscriptValid(false)
    }
    if(storyTypes.length === 0){
      valid = false
      setIsStoryTypeValid(false)
    }
    return valid
  }

const handleStoryTypeToggle = (storyType: StoryType)=>{
  if(storyTypes.includes(storyType)){
    let newStoryTypes = storyTypes.filter(t => t !== storyType)
    setStoryTypes(newStoryTypes)
  }else{
    setStoryTypes([...storyTypes, storyType])
  }
}
const deleteStory = async()=>{
  if(story){
    const token = await getToken()
    await deleteStoryPermanently(token, story.id)
    navigate(`/stories/${collectionId}/${employee?.locale}`, {replace: true})
  }
  
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
  ) : (
    <Fragment>
      <Form onSubmit={saveStory}>
        {beingLoaded &&
          <CenteredSpinner />
        }
        <Row>
          <Col xs={12} lg={6}>
            <span>{`${t("message_story_language")} ${
              t(`language_${defaultLocale}`)
            }`}</span>
            <Container>
              <InputGroup hasValidation >
                <Form.Control
                  className={classes.input}
                  type="text"
                  value={title}
                  placeholder={t("label_title")}
                  isInvalid={!isTitleValid}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Form.Control.Feedback type="invalid" tooltip>
                  {t('error_story_title_required')}
                </Form.Control.Feedback>
              </InputGroup>
              <Container
                className={classes.container} //Story type>
              >
              <div>{t("label_story_type")}</div>

              <Alert variant={isStoryTypeValid ? "light" : "danger"}>{t('error_story_type_required')}</Alert>
                {Object.values(StoryType).map((storyType, i) => (
                  <div key={i} className={classes.storyTypeContainer}>
                    <div className={classes.tooltip}>
                      <span className="material-symbols-outlined">help</span>
                      <span className={classes.tooltiptext}>{t(`story_type_${storyType}`)}</span>
                    </div>
                    <Form.Check key={i}
                      className={classes.checkbox}
                      type='checkbox'
                      label={t(`story_type_${storyType}`)}
                      checked={storyTypes.includes(storyType)}
                      onChange={()=> handleStoryTypeToggle(storyType)}
                    />
                    
                  </div>
                    
                  ))}
              </Container>
              <Form.Control //researcher name
                className={classes.input}
                type="text"
                value={researcherName}
                onChange={(e) => setResearcherName(e.target.value)}
                placeholder={t("label_researcher_name")}
              />
              <Container
                className={classes.container} //Story teller>
              >
                <h5>{t("label_story_teller")}</h5>
                <Form.Control
                  className={classes.input}
                  type="text"
                  value={tellerName}
                  onChange={(e) => setTellerName(e.target.value)}
                  placeholder={t("label_name")}
                />
                <Form.Control
                  className={classes.input}
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder={t("label_age")}
                />
                <Form.Control
                  className={classes.input}
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder={t("label_origin")}
                />
                <Form.Control
                  className={classes.input}
                  type="text"
                  value={residency}
                  onChange={(e) => setResidency(e.target.value)}
                  placeholder={t("label_resdency")}
                />
                <div>{t("label_gender")}</div>
                <Form.Select
                  className={classes.input}
                  aria-label="genderSelect"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  {Object.values(Gender).map((gender, i) => (
                    <option key={i} value={gender}>
                      {t(`gender_${gender}`)}
                    </option>
                  ))}
                </Form.Select>
              </Container>
              <Form.Control //abstraction
                className={classes.input}
                as="textarea"
                value={abstraction}
                onChange={(e) => setAbstraction(e.target.value)}
                placeholder={t("label_abstraction")}
                style={{ height: "100px" }}
              />
              <InputGroup hasValidation >
                <Form.Control //transcript
                  className={classes.input}
                  as="textarea"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={t("label_transcript")}
                  isInvalid={!isTranscriptValid}
                  style={{ height: "200px" }}
                />
                <Form.Control.Feedback type="invalid" tooltip>
                  {t('error_transcript_required')}
                </Form.Control.Feedback>
              </InputGroup>
              {tagValues.length > 0 && (
                <Container className={classes.container}>
                  <h5>{t("label_tags")}</h5>
                  {tagValues.map((tag, index) => (
                    <Form.Control
                      key={index}
                      type="text"
                      value={tag.value}
                      placeholder={tag.name}
                      onChange={(e) =>
                        tagValueChanged(tag.slug, e.target.value)
                      }
                    />
                  ))}
                </Container>
              )}
              <div className={classes.actionContainer}>
                <Button
                  className={classes.submit}
                  variant="dark"
                  type="submit"
                >
                  {t("button_save")}
                </Button>
                
                <Button variant="outline-dark" onClick={cancel}>
                  {t("button_cancel")}
                </Button>
                
              </div>
              {showDeleteAlert && 
                <Alert show={showDeleteAlert} variant="danger">
                <Alert.Heading>{t('alert_header_delete_story')}</Alert.Heading>
                <p>
                  {t('alert_text_delete_story')}
                </p>
                <hr />
                <div className="d-flex justify-content-around">
                  <Button onClick={() => setShowDeleteAlert(false)} variant="outline-danger">
                    {t('button_cancel')}
                  </Button>
                  <Button onClick={deleteStory} variant="danger">
                    {t('button_confirm')}
                  </Button>
                </div>
              </Alert>
              }
              {story && 
                <div className={classes.actionContainer}>
                  <Button
                    className={classes.deleteButton}
                    variant="danger"
                    onClick={()=> setShowDeleteAlert(true)}
                  >
                    {t("button_delete")}
                  </Button>
                </div>
              }
              
            </Container>
          </Col>
        </Row>
      </Form>

    </Fragment>
  )
}

export default MutateStroyPage


