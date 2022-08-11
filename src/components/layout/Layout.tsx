import { useEffect, useContext } from "react";
import { Outlet } from "react-router-dom";
import {connect} from 'react-redux'
import Container from "react-bootstrap/Container"
import classes from "./Layout.module.scss"
import { fetchCollections } from "../../store/actions";
import OurStoryNavbar from "./OurStoryNavbar";
import { AuthContext } from "../../contexts/authContext";
import {useTranslation} from 'react-i18next'

const Layout: React.FunctionComponent<any> = (props:any) => {
  const {employee, getToken} = useContext(AuthContext)
  const {i18n}  = useTranslation()
    useEffect(()=>{
      if(employee){
        loadStuff()
      }
        
    }, [employee])

    const loadStuff = async()=>{
      i18n.changeLanguage(employee!.locale)
        const token = await getToken()
        console.log('The token which been fetched: ' + token)
        
        props.fetchCollections(token, employee!.locale)
    }
  return (
    <>
        <OurStoryNavbar />
        <Container className={classes.content}>
          <Outlet />
        </Container>
    </>  
    )
}

const mapDispatchToProps = (dispatch:any)=>({
    fetchCollections: (token: string, locale: string)=> dispatch(fetchCollections(token, locale))
})

export default connect(null, mapDispatchToProps)(Layout)
