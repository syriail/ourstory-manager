import { useContext } from "react"
import { connect } from "react-redux"
import Container from "react-bootstrap/Container"
import Table from "react-bootstrap/Table"
import { isEditor } from "../../utils"
import Button from "react-bootstrap/Button"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import classes from "./Collections.module.scss"
import {useTranslation} from 'react-i18next'
import { Collection } from "../../api/models"
import { useNavigate } from "react-router"
import { AuthContext } from "../../contexts/authContext"
import CenteredSpinner from "../../components/ui/CenteredSpinner"


const CollectionsPage: React.FunctionComponent<{collections: Collection[], isFetching: boolean}> = (props) => {
  const {employee} = useContext(AuthContext)
    const {t} = useTranslation()
    const navigate = useNavigate()

  const showDetails = (id: string) => {
    navigate(`/collections/${id}`)
  }
  const toAddStory = (collectionId: string, defaultLocale: string) => {
    navigate(`/stories/ADD/${collectionId}/${defaultLocale}`)
  }
  const toAddCollection = () => {
    navigate(`/collections/ADD/`)
  }
  const toEditCollection = (collectionId: string, locale: string) => {
    navigate(`/collections/EDIT/${collectionId}/${locale}`)

  }
  //bg="light"
  return (
    <Container fluid >
      <Row>
        <Col xs={10}>
          <h2>{t("label_collections")}</h2>
        </Col>
        <Col xs={2}>
          <Button variant="dark" onClick={toAddCollection} style={{width:"100%"}}>
            {t("button_add_collection")}
          </Button>
        </Col>
      </Row>
      
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t("label_name")}</th>
            <th>{t("label_collection_manager")}</th>
            <th>{t("label_default_language")}</th>
            <th>{t("label_available_translations")}</th>
            <th>{t("label_editors")}</th>
            <th>{t("label_actions")}</th>
          </tr>
        </thead>
        
        <tbody>
          {props.collections.map((collection, index) => (
            <tr key={index}>
              <td onClick={(e) => showDetails(collection.id)}>{collection.name}</td>
              <td
                onClick={(e) => showDetails(collection.id)}
              >{`${collection.manager.firstName} ${collection.manager.lastName}`}</td>
              <td onClick={(e) => showDetails(collection.id)}>
                {t(`language_${collection.defaultLocale}`)}
              </td>
              <td onClick={(e) => showDetails(collection.id)}>
                {collection.availableTranslations.map((locale, index) => (
                  <div key={index}>{t(`language_${locale}`)}</div>
                ))}
              </td>
              <td onClick={(e) => showDetails(collection.id)}>
                {collection.editors?.map((editor, index) => (
                  <div
                    key={index}
                  >{`${editor.firstName} ${editor.lastName}`}</div>
                ))}
              </td>
              <td>
                <div className={classes.actionContainer}>
                  {(isEditor(collection, employee?.id) ||
                    collection.manager.id === employee?.id) && (
                    <Button
                      variant="light"
                      onClick={(e) =>
                        toAddStory(collection.id, collection.defaultLocale)
                      }
                    >
                      {t("button_add_story")}
                    </Button>
                  )}
                  {collection.manager.id === employee?.id && (
                    <Button
                      variant="light"
                      onClick={(e) => toEditCollection(collection.id, collection.defaultLocale)}
                    >
                      {t("button_edit_collection")}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {props.isFetching && 
          <CenteredSpinner />
        }
    </Container>
  )
}

const mapStateToProps = (state: any) => {
  return {
    collections: state.collections.collections,
    isFetching: state.collections.isFetching
  }
}

export default connect(mapStateToProps, null)(CollectionsPage)
