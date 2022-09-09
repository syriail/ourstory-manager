import { ChangeEvent, Fragment, useContext, useEffect, useState } from "react"
import { Alert, Button, Col, Container, Form, Modal, ProgressBar, Row, Spinner } from "react-bootstrap"
import classes from "./Stories.module.scss"
import ReactPlayer from "react-player"
import { useTranslation } from "react-i18next"
import { AuthContext } from "../../contexts/authContext"
import { useNavigate, useParams } from "react-router"
import {languages, MediaFile, MediaFormat, Story, Collection} from '../../api/models'
import {
  getStoryDetails,
  getMediaDownloadUrl,
  getMediaUploadUrl,
  uploadMediaFile,
  getCollectionById,
  deleteMediaFile,
  deleteStoryPermanently
} from '../../api/ourstory'
import CenteredSpinner from "../../components/ui/CenteredSpinner"
const StoryDetailsPage: React.FunctionComponent<any> = (props) => {
    const {employee, getToken} = useContext(AuthContext)
    const {t} = useTranslation()
    const navigate = useNavigate()
  const [story, setStory] = useState<Story>()
  const [collection, setCollection] = useState<Collection>()
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [translationToAdd, setTranslationToAdd] = useState("")
  const [mediaToShow, setMediaToShow] = useState<MediaFile>()
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [beingLoaded, setBeingLoaded] = useState(true)
  const [mediaBeingRemoved, setMediaBeingRemoved] = useState(false)

  const params = useParams()
  const storyId = params.storyId
  useEffect(() => {
    loadStory()
  }, [])
  useEffect(()=>{
    loadCollection()
  }, [story])

  const loadStory = async () => {
    const token = await getToken()
    const story = await getStoryDetails(token, storyId!, employee!.locale)
    if(story.mediaFiles) setMediaFiles(story.mediaFiles)
    setStory(story)
  }

  const loadCollection = async()=>{
    if(story){
      const token = await getToken()
      const collection = await getCollectionById(token, story?.collectionId, story.defaultLocale)
      setCollection(collection)
      setBeingLoaded(false)
    }
    
  }
  const showMedia = async (mediaFile: MediaFile) => {
    try {
      const token = await getToken()
      const url = await getMediaDownloadUrl(token, mediaFile.mediaPath)
      setMediaToShow({ mediaPath:url, format: mediaFile.format })
      setShowMediaModal(true)
    } catch (error) {
      console.log(error)
    }
  }
  const handleCloseMediaModal = () => {
    setShowMediaModal(false)
    setMediaToShow(undefined)
  }
  const addTranslation = () => {
    if(translationToAdd) navigate(`/stories/translate/ADD/${storyId}/${translationToAdd}`)
  }
  const removeMedia = async (path: string) => {
    setMediaBeingRemoved(true)
    try {
      const token = await getToken()
     await deleteMediaFile(token, story!.id, path)
      setMediaFiles(mediaFiles.filter(m=> m.mediaPath !== path))
    } catch (error) {
      console.log(error)
    }
    setMediaBeingRemoved(false)
  }
  const mediaUploaded = (mediaFile: MediaFile) => {
    setMediaFiles([...mediaFiles, mediaFile])
  }
  const deleteStory = async()=>{
    if(story){
      const token = await getToken()
      await deleteStoryPermanently(token, story.id)
      navigate(`/stories/${story.collectionId}/${employee?.locale}`, {replace: true})
    }
  }
  const toEditStory = ()=>{
    navigate(`/stories/EDIT/${story?.collectionId}/${story?.defaultLocale}/${story?.id}`)
  }
  if (beingLoaded) return (
    <>
      {beingLoaded &&
        <CenteredSpinner />
      }
    </>
  )
  return story ?(
    <Fragment>
      
      <Container>
        <Row className={classes.info}>
          <Col xs={3}>
            <strong>{t("label_title")}</strong>
          </Col>
          <Col xs={9}>
            <span>{story.storyTitle}</span>
          </Col>
        </Row>
        <Row className={classes.info}>
          <Col xs={3}>
            <strong>{t("label_story_type")}</strong>
          </Col>
          <Col xs={9}>
            {story.storyType.map((type, index)=>(
              <span key={index}>{t(`story_type_${type}`)} - </span>
            ))}
            
          </Col>
        </Row>
        <Container className={classes.container}>
            <div><strong>{t("label_media_files")}</strong></div>
            {mediaFiles.map((mediaFile, index) => (
              <div key={index} className={classes.actionContainer}>
                {mediaBeingRemoved &&
                  <Spinner animation="border" variant="light"/>
                }
              <p>{t(`format_${mediaFile.format}`)}</p>
              <Button variant="link" onClick={() => showMedia(mediaFile)}>
                {t("button_show")}
              </Button>
              <Button
                variant="link"
                onClick={() => removeMedia(mediaFile.mediaPath)}
              >
                {t("button_delete")}
              </Button>
            </div>
          ))}
          <AddMedia storyId={story.id} onUpload={mediaUploaded} />
          </Container>
        <Row className={classes.info}>
          <Col xs={3}>
            <strong>{t("label_default_language")}</strong>
          </Col>
          <Col xs={9}>
            <span>{t(`language_${story.defaultLocale}`)}</span>
          </Col>
        </Row>
        <Row className={classes.info}>
          <Col xs={3}>
            <strong>{t("label_available_translations")}</strong>
          </Col>
          <Col xs={9}>
            {story.availableTranslations.map((locale, index) => (
              <a href={`/stories/translate/EDIT/${story!.id}/${locale}`} key={index}>{t(`language_${locale}`)} {' '}</a>
            ))}
          </Col>
        </Row>
        <Row className={classes.info}>
          <Col xs={3}>
            <strong>{t("label_researcher_name")}</strong>
          </Col>
          <Col xs={9}>
            <span>{story.storyCollectorName}</span>
          </Col>
        </Row>
        <Container className={classes.container}>
          <h5>{t("label_story_teller")}</h5>
          <Row>
            <Col xs={3}>
              <strong>{t("label_name")}</strong>
            </Col>
            <Col xs={9}>
              <span>{story.storyTellerName}</span>
            </Col>
          </Row>
          <Row>
            <Col xs={3}>
              <strong>{t("label_age")}</strong>
            </Col>
            <Col xs={9}>
              <span>{story.storyTellerAge}</span>
            </Col>
          </Row>
          <Row>
            <Col xs={3}>
              <strong>{t("label_gender")}</strong>
            </Col>
            <Col xs={9}>
              <span>{t(`gender_${story.storyTellerGender}`)}</span>
            </Col>
          </Row>
          <Row>
            <Col xs={3}>
              <strong>{t("label_origin")}</strong>
            </Col>
            <Col xs={9}>
              <span>{story.storyTellerPlaceOfOrigin}</span>
            </Col>
          </Row>
          <Row>
            <Col xs={3}>
              <strong>{t("label_resdency")}</strong>
            </Col>
            <Col xs={9}>
              <span>{story.storyTellerResidency}</span>
            </Col>
          </Row>
        </Container>
        <Container className={classes.container}>
          <h5>{t("label_tags")}</h5>
          {story.tags?.map((tag, index) => (
            <Row key={index}>
              <Col xs={3}>
                <strong>{tag.name}</strong>
              </Col>
              <Col xs={9}>
                <span>{tag.value}</span>
              </Col>
            </Row>
          ))}
        </Container>
        <Row className={classes.info}>
          <Col xs={3}>
            <strong>{t("label_abstraction")}</strong>
          </Col>
          <Col xs={9}>
            <span>{story.storyAbstraction}</span>
          </Col>
        </Row>
        <Row className={classes.info}>
          <Col xs={3}>
            <strong>{t("label_transcript")}</strong>
          </Col>
          <Col xs={9}>
            <span>{story.storyTranscript}</span>
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
                  locale !== story.defaultLocale &&
                  !story.availableTranslations.includes(locale) &&
                  collection?.availableTranslations.includes(locale)
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
        <Row>
          <Col xs={6}>
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
          </Col>
        </Row>
        <Row>
          <Col xs={3}>
            <Button
                className={classes.submit}
                variant="dark"
                onClick={toEditStory}
              >
                {t("button_edit_story")}
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
      </Container>
      <Modal
        show={showMediaModal}
        size="lg"
        centered
        onHide={handleCloseMediaModal}
      >
        <Modal.Body>
          {mediaToShow?.format === MediaFormat.IMAGE ? (
            <img className={classes.mediaImage} src={mediaToShow?.mediaPath} />
          ) : (
            <ReactPlayer
              url={mediaToShow?.mediaPath}
              controls
              playing={false}
              height={mediaToShow?.format === MediaFormat.AUDIO ? "50px" : "360px"}
              
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMediaModal}>
            {t("button_close")}
          </Button>
        </Modal.Footer>
      </Modal>
        
    </Fragment>
  ) : (
    <p>{t("error_not_found")}</p>
  )
}
export default StoryDetailsPage

type MediaFormatKeyString = keyof typeof MediaFormat

const AddMedia: React.FunctionComponent<{storyId:string, onUpload:(mediaFile: MediaFile)=>void}> = ({ storyId, onUpload}) => {
  const {getToken} = useContext(AuthContext)
  const [mediaFormat, setMediaFormat] = useState<MediaFormat>(MediaFormat.VIDEO)
  const [mediaData, setMediaData] = useState<File | undefined>()
  const [acceptedFile, setAcceptedFile] = useState("video/*")
  const [beingUploaded, setBeingUploaded] = useState(false)
  const [uploadCompleted, setUploadCompleted] = useState(0)
  const {t} = useTranslation()
  const mediaFormatChanged = (selectedFormat: string) => {
    const key = selectedFormat as MediaFormatKeyString
    setMediaFormat(MediaFormat[key])
    switch (selectedFormat) {
      case "VIDEO":
        setAcceptedFile("video/mp4")
        break
      case "AUDIO":
        setAcceptedFile("audio/*")
        break
      case "IMAGE":
        setAcceptedFile("image/*")
        break
    }
  }
  const fileToUploadSelected = (e: ChangeEvent<HTMLInputElement>)=>{
    if(e.target.files){
      const file = e.target.files[0]
      setMediaData(file)
    }
    
  }
  const uploadMedia = async () => {
    if (mediaData) {
      setBeingUploaded(true)
      const fileName = mediaData.name
      const nameParts = fileName.split(".")
      const ext = nameParts[nameParts.length - 1]
      try {
        const token = await getToken()
        const urls = await getMediaUploadUrl(token, storyId, mediaFormat, ext)
        await uploadMediaFile(token, urls.uploadUrl, mediaData, acceptedFile, (progressEvent:any)=>{
          setUploadCompleted(Math.round( (progressEvent.loaded * 100) / progressEvent.total ))
        })
        setBeingUploaded(false)
        setMediaData(undefined)
        onUpload({ format: mediaFormat, mediaPath: urls.attachmentUrl })
      } catch (error) {
        console.log(error)
      }
    }
  }
  return (
    <div style={{ margin: "10px" }}>
      <div className={classes.actionContainer}>
        <div>{t("label_format")}</div>
        <Form.Select
          className={classes.input}
          aria-label="formatSelect"
          value={mediaFormat}
          onChange={(e) => mediaFormatChanged(e.target.value)}
        >
          {Object.keys(MediaFormat).map((mediaFormat, i) => (
            <option key={i} value={mediaFormat}>
              {t(`format_${mediaFormat}`)}
            </option>
          ))}
        </Form.Select>
        <input
          type="file"
          accept={acceptedFile}
          disabled={beingUploaded}
          onChange={(e) => fileToUploadSelected(e)}
        />

        <Button disabled={beingUploaded} variant="light" onClick={uploadMedia}>
          {t("button_upload")}
        </Button>
      </div>
      {beingUploaded && <ProgressBar animated now={uploadCompleted} variant="info" />}
    </div>
  )
}