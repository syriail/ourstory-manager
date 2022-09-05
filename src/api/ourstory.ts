
import Axios from 'axios'
import * as OurStory from './models'
import * as Requests from './requests'
import algoliasearch from 'algoliasearch'
import { SearchResponse } from '@algolia/client-search'

const endpoint = process.env.REACT_APP_API_ENDPOINT
const algoliaClient = algoliasearch(
    process.env.REACT_APP_ALGOLIA_APP_ID!,
    process.env.REACT_APP_ALGOLIA_SEARCH_KEY!
  )

export const getEmployee = async(token: string, id:string):Promise<OurStory.Employee>=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.get(`${endpoint}/employees/${id}`, {headers})
        .then((res)=>{
            if(res.status === 200){
                if(res.data){
                    resolve(res.data.employee as OurStory.Employee)
                }else{
                    reject('')
                }
            }else{
                reject('')
            }
        })
        .catch(error => reject(error))
    })
}

export const getCollections = async(token: string, locale: string):Promise<OurStory.Collection[]> =>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.get(`${endpoint}/collections?locale=${locale}`, {headers})
        .then((res)=>{
            if(res.status === 200){
                if(res.data && res.data.collections){
                    resolve(res.data.collections as OurStory.Collection[])
                }else{
                    reject('')
                }
            }else{
                reject('')
            }
        })
        .catch(error => reject(error))
    })
}

export const getEmployeesByRole = async(token: string, role: OurStory.EmployeeRole): Promise<OurStory.Employee[]> =>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.get(`${endpoint}/employees/role/${role}`, {headers})
        .then((res)=>{
            if(res.status === 200){
                resolve(res.data.employees)
            }else{
                reject('')
            }
        }).catch(error => reject(error))
    })
}

export const getCollectionById = async(token: string, collectionId: string, locale: string):Promise<OurStory.Collection>=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.get(`${endpoint}/collections/details/${collectionId}?locale=${locale}`, {headers})
        .then((res)=>{
            if(res.status === 200){
                console.log('return collection detials')
                console.log(res.data.collection)
                resolve(res.data.collection)
            }else{
                reject('')
            }
        }).catch(error=>reject(error))
    })
}

export const createCollection = async(token: string, request: Requests.CreateCollectionRequest):Promise<OurStory.Collection> =>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.post(`${endpoint}/collections`, request, {headers})
        .then((response)=>{
            if(response.status === 201){
                resolve(response.data.collection)
            }else{
                reject('')
            }
        })
        .catch(error=>{
            reject(error)
        })
    })
}

export const updateCollection = async(token: string, collection: OurStory.Collection)=>{
    const editorsIds = collection.editors ? collection.editors.map((editor: OurStory.Employee) => editor.id) : []
    
    let body: Requests.UpdateCollectionRequest = {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        defaultLocale: collection.defaultLocale,
        editors: editorsIds,
        tags: collection.tags ? collection.tags : []
    }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.patch(`${endpoint}/collections`, body, {headers})
        .then((response)=>{
            if(response.status === 201){
                resolve('Ok')
            }else{
                reject('')
            }
        }).catch(error=>reject(error))
    })
}

export const saveCollectionTranslation = async(token: string, translation: Requests.TranslateCollectionRequest)=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.post(`${endpoint}/collections/translate`, translation, {headers})
        .then(response =>{
            if(response.status === 201){
                resolve('Ok')
            }else{
                reject('')
            }
        }).catch(error=> reject(error))
    })
}

export const createStory = async(token: string, request: Requests.CreateStoryRequest): Promise<OurStory.Story>=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.post(`${endpoint}/stories`, request, {headers})
        .then(response=>{
            if(response.status === 201){
                resolve(response.data.story)
            }else{
                reject('')
            }
        })
        .catch(error=> reject(error))
    })
}

export const getStoriesByCollection = async(token: string, collectionId: string, locale: string, lastId?: string):Promise<{lastId: string | undefined, stories: OurStory.Story[]}> =>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.get(`${endpoint}/stories/${collectionId}?locale=${locale}&last=${lastId}`, {headers})
        .then(response=>{
            if(response.status === 200){
                resolve(response.data)
            }else{
                reject('')
            }
        }).catch(error => reject(error))
    })
}

export const getStoryDetails = async(token: string, storyId: string, locale: string): Promise<OurStory.Story>=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.get(`${endpoint}/stories/details/${storyId}?locale=${locale}`, {headers})
        .then(response =>{
            if(response.status === 200){
                resolve(response.data)
            }else{
                reject('')
            }
        }).catch(error=> reject(error))
    })
}

export const getMediaUploadUrl = async(token: string, storyId:string, format: OurStory.MediaFormat, fileExtension: string):Promise<OurStory.UploadAttachmentData> =>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.get(`${endpoint}/uploadUrl/${storyId}?mediaFormat=${format}&fileExtension=${fileExtension}`, {headers})
        .then(response=>{
            if(response.status === 200){
                resolve(response.data)
            }else{
                reject('')
            }
        }).catch(error=> reject(error))
    })
}

export const getMediaDownloadUrl = async(token: string, path: string): Promise<string> =>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.get(`${endpoint}/downloadUrl?path=${path}`, {headers})
        .then(response =>{
            if(response.status === 200){
                resolve(response.data)
            }else{
                reject('')
            }
        }).catch(error=> reject(error))
    })
}

export const uploadMediaFile = async(token: string, uploadUrl:string, file: File, contentType:string, onUploadProgress:(progressEvent: any) => void)=>{
    const headers = {
        'Content-Type': contentType
      }
    let data = new FormData();
    data.append('file', file)
    return new Promise((resolve, reject)=>{
        const config = {
            headers,
            onUploadProgress
        }
        Axios.put(uploadUrl, file, config)
        .then(response=>{
            resolve(response.data)
        }).catch(error=> reject(error))
    })
}

export const deleteMediaFile = async(token:string, storyId: string, path: string)=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.delete(`${endpoint}/media/${storyId}?path=${path}`, {headers})
        .then(response =>{
            if(response.status === 204){
                resolve(true)
            }else{
                reject('')
            }
        }).catch(error=> reject(error))
    })
}

export const deleteStoryPermanently = (token: string, storyId:string)=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.delete(`${endpoint}/story/${storyId}`, {headers})
        .then(response =>{
            if(response.status === 204){
                resolve(true)
            }else{
                reject('')
            }
        }).catch(error=> reject(error))
    })
}

export const updateStory = (token: string, storyId: string, request: Requests.CreateStoryRequest)=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.patch(`${endpoint}/story/${storyId}`, request, {headers})
        .then(response =>{
            if(response.status === 200){
                resolve(true)
            }else{
                reject('')
            }
        }).catch(error=> reject(error))
    })
}
export const translateStory = (token: string, request: Requests.TranslateStoryRequest)=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.post(`${endpoint}/story/translate`, request, {headers})
        .then(response =>{
            if(response.status === 201){
                resolve(true)
            }else{
                reject('')
            }
        }).catch(error=> reject(error))
    })
}
export const search = async(locale: string, text: string, pageSize: number, pageNumber: number): Promise<any>=>{
    const indexName = `${process.env.REACT_APP_ALGOLIA_INDEX_PREFIX}${locale}`
    const algoliaIndex = algoliaClient.initIndex(indexName)

    return new Promise((resolve, reject)=>{
        algoliaIndex.search(text, {restrictSearchableAttributes:["storyTitle"], page: pageNumber, hitsPerPage: pageSize})
            .then((result: SearchResponse<any>)=>{
                console.log('Raw result of search')
                console.log(result)
                resolve(parseSearchResults(result))
            })
            .catch(error=> reject(error))
    })
    
}
const parseSearchResults = (result: SearchResponse<OurStory.Story>)=>{
    let stories: any[] = []
    for(const hit of result.hits){
        
        stories.push({
            id: hit.objectID,
            collectionId: hit.collectionId,
            storyTitle: hit.storyTitle
        })
        
    }
    return stories
}

export const createPage = (token: string, request: Requests.CreateStaticPage)=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.post(`${endpoint}/pages`, request, {headers})
        .then(response =>{
            if(response.status === 201){
                resolve(true)
            }else{
                reject('')
            }
        }).catch(error=> reject(error))
    })
}
export const updatePage = (token: string, request: Requests.CreateStaticPage)=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.patch(`${endpoint}/pages`, request, {headers})
        .then(response =>{
            if(response.status === 201){
                resolve(true)
            }else{
                reject('')
            }
        }).catch(error=> reject(error))
    })
}
export const getPages = (token: string, locale: string): Promise<OurStory.StaticPage[]>=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.get(`${endpoint}/pages/${locale}`, {headers})
        .then(response =>{
            if(response.status === 200){
                resolve(response.data.pages)
            }else{
                reject([])
            }
        }).catch(error=> reject(error))
    })
}

export const getPageDetails = (token: string, slug: string, locale: string): Promise<OurStory.StaticPage> => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.get(`${endpoint}/page/${slug}/${locale}`, {headers})
        .then(response =>{
            if(response.status === 200){
                resolve(response.data)
            }else{
                reject('')
            }
        }).catch(error=> reject(error))
    })
}
export const deletePage = (token: string, slug: string) => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    return new Promise((resolve, reject)=>{
        Axios.delete(`${endpoint}/pages/delete/${slug}`, {headers})
        .then(response =>{
            if(response.status === 204){
                resolve(true)
            }else{
                reject('')
            }
        }).catch(error=> reject(error))
    })
}
