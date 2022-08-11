import { Collection } from "../api/models"

const collectionsReducer = (
  state: {collections: Collection[], isFetching: boolean} = {
    collections: [],
    isFetching: false
  },
  action: {type: string, payload: any}
) => {
  switch (action.type) {
    case "LOAD_COLLECTIONS": {
      return {
        ...state,
        isFetching: true
      }
    }
    case "COLLECTIONS_LOADED": {
      return {
        ...state,
        collections: action.payload,
        isFetching: false
      }
    }
    case "COLLECTION_UPDATED": {
      const newCollections = state.collections.map((collection)=>{
        if(collection.id != action.payload.id) return collection
        return action.payload
      })
      return {
        ...state,
        collections: newCollections
      }
    }

    case "COLLECTION_ADDED": {
      return {
        ...state,
        collections: [...state.collections, action.payload]
      }
    }
    
    default:
      return state
  }
}
export default collectionsReducer
