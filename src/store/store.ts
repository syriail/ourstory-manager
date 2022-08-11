import { createStore, combineReducers, applyMiddleware } from "redux"
import thunk from "redux-thunk"
import collectionsReducer from "./collectionsReducer"
import { composeWithDevTools } from "redux-devtools-extension"

//const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const configureStore = () => {
  const store = createStore(
    combineReducers({
      collections: collectionsReducer
    }),
    composeWithDevTools(applyMiddleware(thunk))
  )

  return store
}
const store = configureStore()
export default store
