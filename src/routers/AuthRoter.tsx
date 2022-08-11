import { Routes, Route } from 'react-router-dom'
import ForgotPassword from '../pages/auth/ForgotPassword'
import RequestCode from '../pages/auth/RequestCode'
import SignIn from '../pages/auth/SignIn'
import VerifyCode from '../pages/auth/VerifyCode'
const AuthRouter: React.FunctionComponent = ()=>(
  <Routes>
    <Route path="/" element={<SignIn />} >
        <Route path="verify" element={<VerifyCode />} />
        <Route path="requestcode" element={<RequestCode />} />
        <Route path="forgotpassword" element={<ForgotPassword />} />
        <Route path="*" element={<SignIn />} />
      </Route>
  </Routes>
)
export default AuthRouter