import {Provider} from 'react-redux'
import '../src/styles/global.scss'
import AuthProvider, { AuthIsSignedIn, AuthIsNotSignedIn } from './contexts/authContext'
import AuthRouter from './routers/AuthRoter';
import MainRouter from './routers/MainRouter';
import store from './store/store'
import {useTranslation} from 'react-i18next'
import { useEffect } from 'react';

function App() {
  const {i18n}  = useTranslation()

  useEffect(()=>{
    if (i18n.language === "ar") {
      document.body.style.direction = "rtl"
      document.body.dir = "rtl"
    } else {
      document.body.style.direction = "ltr"
      document.body.dir = "ltr"
    }
  }, [i18n.language])
  

  return (
    <AuthProvider>
      <AuthIsSignedIn>
        <Provider store={store}>
          <MainRouter />
        </Provider>
      </AuthIsSignedIn>
      <AuthIsNotSignedIn>
        <AuthRouter />
      </AuthIsNotSignedIn>
    </AuthProvider>
  )
}

export default App;
