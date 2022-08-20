import { useState, useEffect, useContext } from "react"
import Container from "react-bootstrap/Container"
import Table from "react-bootstrap/Table"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { Button } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { AuthContext } from "../../contexts/authContext"
import { useNavigate, useParams } from "react-router"
import {Collection, languages, Story} from '../../api/models'
import {getStoriesByCollection} from '../../api/ourstory'
import CenteredSpinner from "../../components/ui/CenteredSpinner"
import { connect } from "react-redux"

const StoriesPage: React.FunctionComponent<{getStoriesCount?:any, collectionsBeingFetched?:boolean}> = (props) => {
  const {t} = useTranslation()
  const {employee, getToken} = useContext(AuthContext)
  const [stories, setStories] = useState<Story[]>([])
  const [pageHistory, setPageHistory] = useState<string[]>(['undefined'])
  const [lastId, setLastId] = useState<string | undefined>()
  const [isFetching, setIsFetching] = useState(true)
  const [storiesCount, setStoriesCount] = useState(0)

  const navigate = useNavigate()
  const params = useParams()
  const collectionId = params.collectionId
  const defaultLocale = params.defaultLocale
  useEffect(()=>{
    setStoriesCount(props.getStoriesCount(collectionId))

    
  }, [props.collectionsBeingFetched])

  useEffect(() => {
    loadStories()
  }, [pageHistory])


  const loadStories = async () => {
    setIsFetching(true)
    const token = await getToken()
    let lastPageHistory = pageHistory[pageHistory.length - 1]
    getStoriesByCollection(
      token, 
      collectionId!,
      employee!.locale,
      lastPageHistory === 'undefined' ? undefined : lastPageHistory
    ).then((res)=>{
      setIsFetching(false)
      setStories(res.stories)
      setLastId(res.lastId)
    })
  }

  const nextPage = ()=>{
    if(lastId){
      setPageHistory([...pageHistory, lastId])
    }
    
  }
  const prevPage = ()=>{
    if(pageHistory.length === 1) return
    const newHistory = pageHistory.slice(0, pageHistory.length - 1)
    setPageHistory(newHistory)
  }

  const showDetails = (id: string) => {
    window.open(`/stories/details/${id}`, '_blank')
  }
  const toAddStory = () => {
    navigate(`/stories/ADD/${collectionId}/${defaultLocale}`)
  }
  const toEditStory = (id: string) => {
    navigate(`/stories/EDIT/${collectionId}/${defaultLocale}/${id}`)
  }
  return (
    <Container fluid>
      <Row>
        <Col xs={10}>
          <h2>{t("label_stories")} ({storiesCount})</h2>
        </Col>
        <Col xs={2}>
          <Button variant="dark" onClick={toAddStory} style={{width:"100%"}}>
            {t("button_add_story")}
          </Button>
        </Col>
      </Row>
     
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t("label_title")}</th>
            <th>{t("label_story_type")}</th>
            <th>{t("label_default_language")}</th>
            <th>{t("label_available_translations")}</th>
            <th>{t("label_actions")}</th>
          </tr>
        </thead>
        <tbody>
          {stories.map((story, index) => (
            <tr key={index}>
              <td onClick={() => showDetails(story.id)}>{story.storyTitle}</td>
              
              <td onClick={() => showDetails(story.id)}>
                {story.storyType.map((type, index)=>(
                  <span key={index}>{t(`story_type_${type}`)}, </span>
                ))}
              </td>
              <td onClick={() => showDetails(story.id)}>
                {t(`language_${story.defaultLocale}`)}
              </td>
              <td onClick={() => showDetails(story.id)}>
                {story.availableTranslations.map((locale, index) => (
                  <div key={index}>{t(`language_${locale}`)}{' '}</div>
                ))}
              </td>
              <td>
                <Button variant="light" onClick={(e) => toEditStory(story.id)}>
                  {t("button_edit_story")}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {isFetching && 
        <CenteredSpinner />
      }
      <div>
        <Button disabled={lastId === undefined} onClick={nextPage}>Next</Button>
        <Button disabled={pageHistory.length === 1} onClick={prevPage}>Prev</Button>
      </div>
    </Container>
  )
}

const mapStateToProps = (state: any)=>{
  return {
    collectionsBeingFetched: state.collections.isFetching,
    getStoriesCount: (collectionId: string)=> {
      const collection  = state.collections.collections.find((c: Collection) => c.id === collectionId)
      if(collection) return collection.storiesCount
      return 0
      
    }
  }
}

export default connect(mapStateToProps)(StoriesPage)

