import { FormEventHandler, useEffect, useState } from "react"
import {useTranslation} from 'react-i18next'
import { ListGroup } from "react-bootstrap"
import classes from './Layout.module.scss'
import { search } from "../../api/ourstory"
const SearchBox: React.FunctionComponent = () => {

  const {t, i18n} = useTranslation()
  const [queryText, setQueryText] = useState("")
  const [stories, setStories] = useState<any[]>([])

  useEffect(()=>{
    if(!queryText || queryText.trim() === '') setStories([])
  }, [queryText])

  const doSearch: FormEventHandler = (e) => {
    e.preventDefault()
    if(!queryText || queryText.trim() === '') return
    search(i18n.language, queryText, 20, 0)
    .then((stories)=> setStories(stories))
    .catch(error=>console.log(error))
  }
  const storySelected = (id: any)=>{
    setQueryText("")
    window.open(`/stories/details/${id}`)
  }
  return (
    <div className={classes.searchWithResults}>
    <form onSubmit={doSearch}>
      <input type="submit" value="Search" />
      <input
        type="search"
        name="search"
        id="search"
        value={queryText}
        onChange={(e) => setQueryText(e.target.value)}
        placeholder={t("button_search")}
      />
    </form>
    {stories.length > 0 &&
      <div className={classes.searchResults}>
      <ListGroup as="ul">
        {
          stories.map((story, index)=>(
            <ListGroup.Item key={index} as="li" action onClick={()=> storySelected(story.id)}>
              {story.storyTitle}
            </ListGroup.Item>
          ))
        }
      </ListGroup>
      </div>
    }
    
    
    </div>
  )
}

export default SearchBox
