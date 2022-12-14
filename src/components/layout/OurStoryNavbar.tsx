import { useContext, useEffect } from "react"
import Navbar from "react-bootstrap/Navbar"
import Nav from "react-bootstrap/Nav"
import Container from "react-bootstrap/Container"
import NavDropdown from "react-bootstrap/NavDropdown"
import { connect } from "react-redux"
import { Button } from "react-bootstrap"
import { Collection, EmployeeRole } from "../../api/models"
import { AuthContext } from "../../contexts/authContext"
import {useTranslation} from 'react-i18next'
import classes from './Layout.module.scss'
import { useNavigate } from "react-router"
import SearchBox from "./SearchBox"

const OurStoryNavbar: React.FunctionComponent = (props: any) => {

  const {signOut, employee} = useContext(AuthContext)
  const {t, i18n}  = useTranslation()
  const navigate = useNavigate()

    const logout = () => {
    signOut()
    navigate('/')
  }
  const changeLanguage = (locale: string)=>{
    i18n.changeLanguage(locale)
  }
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className='flex-grow-1'>
            <Nav.Link className={classes.navItem} href="/collections">
              {t('label_collections')}
            </Nav.Link>
            {props.collections.length > 0 && (
              <NavDropdown
                className={classes.navItem}
                title={t('label_stories')}
                id="basic-nav-dropdown"
              >
                {props.collections.map((collection: Collection, index: number) => (
                  <NavDropdown.Item key={index} href={`/stories/${collection.id}/${collection.defaultLocale}`}>
                    {collection.name} ({collection.storiesCount})
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            )}
            {employee && employee.roles.includes(EmployeeRole.ADMIN) && 
              <Nav.Link className={classes.navItem} href="/pages">
              {t('label_static_pages')}
            </Nav.Link>
            }
            {employee && employee.roles.includes(EmployeeRole.ADMIN) && 
              <Nav.Link className={classes.navItem} href="/users">
              {t('label_users')}
            </Nav.Link>
            }
            
          </Nav>
          <div className={classes.searchWrapper}>
            <SearchBox />
          </div>
          <Nav.Item>
            <Button variant="dark" onClick={logout}>
            {t('button_logout')}
            </Button>
          </Nav.Item>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

const mapStateToProps = (state: any) => {
  return {
    collections: state.collections.collections
  }
}


export default connect(mapStateToProps)(OurStoryNavbar)
/*
<NavDropdown
              className={classes.navItem}
                title={t('label_language')}
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item onClick={()=> changeLanguage('ar')}>
                    Arbaic
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={()=> changeLanguage('en')}>
                    English
                  </NavDropdown.Item>
              </NavDropdown>
*/
