import { Collection } from "../api/models"
import { getCollections } from "../api/ourstory"
export const fetchCollections = (token: string, locale:string) => async (dispatch:any) =>{
    dispatch({type:'LOAD_COLLECTIONS'})
    const collections = await getCollections(token, locale)
    console.log(collections)
    return dispatch({ type: 'COLLECTIONS_LOADED', payload: collections })
}

export const collectionUpdated = (collection: Collection) => (dispatch: any)=>{
    return dispatch({type:'COLLECTION_UPDATED', payload: collection})
}
export const collectionAdded = (collection: Collection) => (dispatch: any)=>{
    return dispatch({type:'COLLECTION_ADDED', payload: collection})
}