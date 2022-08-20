import { Spinner } from 'react-bootstrap'
import classes from './UI.module.scss'
const CenteredSpinner: React.FunctionComponent = ()=>{
    return (
        <div className={classes.spinnerContainer}>
            <div className={classes.spinnerBox}>
            <Spinner  animation="border" variant="light"/></div>
            </div>
    )
}

export default CenteredSpinner