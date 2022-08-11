import { useState, useEffect, useContext } from "react"
import Container from "react-bootstrap/Container"
import Table from "react-bootstrap/Table"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { Button } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { AuthContext } from "../../contexts/authContext"
import { useNavigate, useParams } from "react-router"
import {languages, Story} from '../../api/models'
import {getStoriesByCollection} from '../../api/ourstory'

const StoriesPage: React.FunctionComponent<any> = (props) => {
  const {t} = useTranslation()
  const {employee, getToken} = useContext(AuthContext)
  const [stories, setStories] = useState<Story[]>([])
  const navigate = useNavigate()
  const params = useParams()
  const collectionId = params.collectionId
  const defaultLocale = params.defaultLocale
  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    const token = await getToken()
    getStoriesByCollection(
      token, 
      collectionId!,
      employee!.locale
    ).then((stories)=>{
      setStories(stories)
    })
    
  }

  const showDetails = (id: string) => {
    navigate(`/stories/details/${id}`)
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
          <h2>{t("label_stories")}</h2>
        </Col>
        <Col xs={2}>
          <Button variant="link" onClick={toAddStory}>
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
    </Container>
  )
}

export default StoriesPage
