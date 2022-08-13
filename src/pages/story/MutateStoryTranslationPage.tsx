import React, { useContext, useEffect, useState } from "react"
import { useParams } from "react-router"
import {useTranslation} from 'react-i18next'
import { useNavigate } from "react-router"
import {
  Col,
  Container,
  Form,
  Row,
  Button,
  ProgressBar,
  InputGroup,
} from "react-bootstrap"
import classes from "./Stories.module.scss"
import { AuthContext } from "../../contexts/authContext"
import { getStoryDetails, translateStory } from "../../api/ourstory"
import { Story } from "../../api/models"
import { TagValueRequest, TranslateStoryRequest } from "../../api/requests"

const MutateStoryTranslationPage: React.FunctionComponent<{action?: string}> = ({action}) => {
    const {t}  = useTranslation()
    const navigate = useNavigate()
    const routerParams = useParams()
    const {employee, getToken}  = useContext(AuthContext)
  const [story, setStory] = useState<Story>()
  //const [tags, setTags] = useState<TagValue[]>([])
  const [tagsTransltion, setTagsTranslation] = useState<{[key: string]:string}>({})
  const [title, setTitle] = useState("")
  const [tellerName, setTellerName] = useState("")
  const [tellerOrigin, setTellerOrigin] = useState("")
  const [tellerResidency, setTellerResidency] = useState("")
  const [collectorName, setCollectorName] = useState("")
  const [abstraction, setAbstraction] = useState("")
  const [transcript, setTranscript] = useState("")
  const [invalidTitle, setInvalidTitle] = useState(false)
  const [invlaidTellerName, setInvlaidTellerName] = useState(false)
  const [invalidTellerOrigin, setInvalidTellerOrigin] = useState(false)
  const [invalidTellerResidency, setInvalidTellerResidency] = useState(false)
  const [invalidResearcherName, setInvalidResearcherName] = useState(false)
  const [invalidTagTranslation, setInvalidTagTranslation] = useState<{[key:string]:boolean}>({})
  const [invalidAbstraction, setInvalidAbstraction] = useState(false)
  const [invalidTranscript, setInvalidTranscript] = useState(false)
  const [errorMessage, setErrorMessage] = useState()
  const [beingUpdated, setBeingUpdated] = useState(false)
  const locale = routerParams.locale
  const storyId = routerParams.storyId
  useEffect(() => {
    getStory()
  }, [])
  const getStory = async () => {
    if (storyId) {
        const token = await getToken()
      getStoryDetails(token, storyId, employee!.locale)
      .then(story=>{
        console.log(story!.tags)
        setStory(story)
      })
      .catch(error=>{
        console.log(error)
        setErrorMessage(t("error_not_found"))
      })
      if(action === 'EDIT'){
        //If action is edit translation
        getStoryDetails(token, storyId, locale!)
        .then(story=>{
          prepareToEdit(story)
        })
        .catch(error=>{
          console.log(error)
        })
      }
      
    }
  }
  const prepareToEdit = (story: Story) => {
    setTitle(story.storyTitle)
    setTranscript(story.storyTranscript || '')
    setAbstraction(story.storyAbstraction || '')
    setCollectorName(story.storyCollectorName || '')
    setTellerName(story.storyTellerName || '')
    setTellerOrigin(story.storyTellerPlaceOfOrigin || '')
    setTellerResidency(story.storyTellerResidency || '')
    if(story.tags){
      let translations: {[key:string]: string} = {}
      for(const tag of story.tags){
        translations[tag.slug] = tag.value
      }
      console.log(translations)
      setTagsTranslation(translations)
    }
    // let tagsToTranslate: TagValue[] = []
    // if(story.tags){
    //     for (const tag of story.tags) {
    //         tagsToTranslate.push({
    //             storyId: story.id,
    //             collectionId: story.collectionId,
    //             locale: tag.locale,
    //           slug: tag.slug,
    //           name: tag.name,
    //           value: tag.value,
    //         })
    //       }
    // }
    // setTags(tagsToTranslate)
  }
  const updateTagTranslation = (slug: string, translation: string) => {
    let newTagsTranslation = {...tagsTransltion}
    newTagsTranslation[slug] = translation
    setTagsTranslation(newTagsTranslation)
    // let tempTags = []
    // for (const tag of tags) {
    //   if (tag.slug === slug) {
    //     tempTags.push({
    //       ...tag,
    //       translation,
    //     })
    //   } else {
    //     tempTags.push(tag)
    //   }
    // }
    // setTags(tempTags)

  }
  const saveStory = async () => {
    if (validateStoryTranslation()) {
      setBeingUpdated(true)
      const request = buildRequest()
      const token = await getToken()
      translateStory(token, request)
      .then(()=>{
        setBeingUpdated(false)
        navigate(`/stories/details/${storyId}`, {replace: true})
      }).catch(error=>{
        console.log(error)
        setErrorMessage(error.message)
        setBeingUpdated(false)
      })
      
    }
  }

  const buildRequest = ():TranslateStoryRequest =>{
    const request: TranslateStoryRequest = {
      id: story!.id,
      collectionId: story!.collectionId,
      storyTitle: title,
      storyTranscript: transcript,
      locale: locale!
    }
    if(abstraction) request.storyAbstraction = abstraction
    if(collectorName) request.storyCollectorName = collectorName
    if(tellerName) request.storyTellerName = tellerName
    if(tellerOrigin) request.storyTellerPlaceOfOrigin = tellerOrigin
    if(tellerResidency) request.storyTellerResidency = tellerResidency
    const tags: TagValueRequest[] = []
    if(story!.tags){
      for(const tag of story!.tags){
        tags.push({
          slug: tag.slug,
          value: tagsTransltion[tag.slug]
        })
      }
    }
    request.tags = tags
    return request
  }
  const validateStoryTranslation = () => {
    let valid = true
    if (!title || title.trim() === "") {
      valid = false
      setInvalidTitle(true)
    } else {
      setInvalidTitle(false)
    }
    if ((!abstraction || abstraction.trim() === "") && story!.storyAbstraction) {
      valid = false
      setInvalidAbstraction(true)
    } else {
      setInvalidAbstraction(false)
    }
    if ((!transcript || transcript.trim() === "")) {
      valid = false
      setInvalidTranscript(true)
    } else {
      setInvalidTranscript(false)
    }
    if (
      (!collectorName || collectorName.trim() === "") &&
      story!.storyCollectorName
    ) {
      valid = false
      setInvalidResearcherName(true)
    } else {
      setInvalidResearcherName(false)
    }
    if ((!tellerName || tellerName.trim() === "") && story!.storyTellerName) {
      valid = false
      setInvlaidTellerName(true)
    } else {
      setInvlaidTellerName(false)
    }
    if (
      (!tellerOrigin || tellerOrigin.trim() === "") &&
      story!.storyTellerPlaceOfOrigin
    ) {
      valid = false
      setInvalidTellerOrigin(true)
    } else {
      setInvalidTellerOrigin(false)
    }
    if (
      (!tellerResidency || tellerResidency.trim() === "") &&
      story!.storyTellerResidency
    ) {
      valid = false
      setInvalidTellerResidency(true)
    } else {
      setInvalidTellerResidency(false)
    }
    let tagsInvalid:{[key: string]: boolean} = {}
    if(story!.tags){
      for (const tag of story!.tags) {
        const tagTranslation = tagsTransltion[tag.slug]
        if ((!tagTranslation || tagTranslation.trim() === "") && tag.value) {
          tagsInvalid[tag.slug] = true
          valid = false
        }else{
          tagsInvalid[tag.slug] = false
        }
      }
    }
    setInvalidTagTranslation(tagsInvalid)

    return valid
  }
  const cancel = () => {
    navigate(`/stories/details/${storyId}`, {replace: true})
  }
  return beingUpdated ? (
    <div>
      <strong>{t("message_being_updated")}</strong>
      <ProgressBar animated now={45} />
    </div>
  ) : !errorMessage && story ? (
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
          <strong>{t("label_title")}</strong>
        </Col>
        <Col xs={9}>
          <div>{story.storyTitle}</div>
          <InputGroup className={classes.input} hasValidation>
            <Form.Control
              type="text"
              isInvalid={invalidTitle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Form.Control.Feedback type="invalid" tooltip>
              {t("error_story_title_required")}
            </Form.Control.Feedback>
          </InputGroup>
        </Col>
      </Row>
      <Container className={classes.container}>
        <h5>{t("label_story_teller")}</h5>
        <Row className={classes.info}>
          <Col xs={3}>
            <strong>{t("label_name")}</strong>
          </Col>
          <Col xs={9}>
            <div>{story.storyTellerName}</div>
            <InputGroup className={classes.input} hasValidation>
              <Form.Control
                type="text"
                isInvalid={invlaidTellerName}
                value={tellerName}
                onChange={(e) => setTellerName(e.target.value)}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {t("error_teller_name_required")}
              </Form.Control.Feedback>
            </InputGroup>
          </Col>
        </Row>
        <Row className={classes.info}>
          <Col xs={3}>
            <strong>{t("label_origin")}</strong>
          </Col>
          <Col xs={9}>
            <div>{story.storyTellerPlaceOfOrigin}</div>
            <InputGroup className={classes.input} hasValidation>
              <Form.Control
                type="text"
                isInvalid={invalidTellerOrigin}
                value={tellerOrigin}
                onChange={(e) => setTellerOrigin(e.target.value)}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {t("error_teller_origin_required")}
              </Form.Control.Feedback>
            </InputGroup>
          </Col>
        </Row>
        <Row className={classes.info}>
          <Col xs={3}>
            <strong>{t("label_resdency")}</strong>
          </Col>
          <Col xs={9}>
            <div>{story.storyTellerResidency}</div>
            <InputGroup className={classes.input} hasValidation>
              <Form.Control
                type="text"
                isInvalid={invalidTellerResidency}
                value={tellerResidency}
                onChange={(e) => setTellerResidency(e.target.value)}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {t("error_teller_residency_required")}
              </Form.Control.Feedback>
            </InputGroup>
          </Col>
        </Row>
      </Container>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_researcher_name")}</strong>
        </Col>
        <Col xs={9}>
          <div>{story.storyCollectorName}</div>
          <InputGroup className={classes.input} hasValidation>
            <Form.Control
              type="text"
              isInvalid={invalidResearcherName}
              value={collectorName}
              onChange={(e) => setCollectorName(e.target.value)}
            />
            <Form.Control.Feedback type="invalid" tooltip>
              {t("error_researcher_name_required")}
            </Form.Control.Feedback>
          </InputGroup>
        </Col>
      </Row>
      <Container className={classes.container}>
        <h5>{t("label_tags")}</h5>
        {story.tags?.map((tag, index) => (
          <Row key={index}>
            <Col xs={3}>
              <strong>{tag.name}</strong>
            </Col>
            <Col xs={9}>
              <div className={classes.tagForm}>
                <span>{tag.value}</span>
                <InputGroup className={classes.input} hasValidation>
                  <Form.Control
                    type="text"
                    isInvalid={invalidTagTranslation[tag.slug]}
                    value={tagsTransltion[tag.slug]}
                    onChange={(e) =>
                      updateTagTranslation(tag.slug, e.target.value)
                    }
                  />
                  <Form.Control.Feedback type="invalid" tooltip>
                    {t("error_tag_translation")}
                  </Form.Control.Feedback>
                </InputGroup>
              </div>
            </Col>
          </Row>
        ))}
      </Container>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_abstraction")}</strong>
        </Col>
        <Col xs={9}>
          <div>{story.storyAbstraction}</div>
          <InputGroup className={classes.input} hasValidation>
            <Form.Control
              as="textarea"
              isInvalid={invalidAbstraction}
              rows={4}
              value={abstraction}
              onChange={(e) => setAbstraction(e.target.value)}
            />
            <Form.Control.Feedback type="invalid" tooltip>
              {t("error_abstraction_required")}
            </Form.Control.Feedback>
          </InputGroup>
        </Col>
      </Row>
      <Row className={classes.info}>
        <Col xs={3}>
          <strong>{t("label_transcript")}</strong>
        </Col>
        <Col xs={9}>
          <div>{story.storyTranscript}</div>
          <InputGroup className={classes.input} hasValidation>
            <Form.Control
              as="textarea"
              isInvalid={invalidTranscript}
              rows={6}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
            <Form.Control.Feedback type="invalid" tooltip>
              {t("error_transcript_required")}
            </Form.Control.Feedback>
          </InputGroup>
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
              onClick={saveStory}
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

export default MutateStoryTranslationPage