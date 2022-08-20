import {Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import CollectionDetails from '../pages/collection/CollectionDetailsPage'
import CollectionsPage from '../pages/collection/CollectionsPage'
import MutateCollectionPage from '../pages/collection/MutateCollectionPage'
import TranslateCollection from '../pages/collection/TranslateCollection'
import MutateStoryTranslationPage from '../pages/story/MutateStoryTranslationPage'
import MutateStroyPage from '../pages/story/MutateStroyPage'
import StoriesPage from '../pages/story/StoriesPage'
import StoryDetailsPage from '../pages/story/StoryDetailsPage'

const MainRouter: React.FunctionComponent = ()=>(
  <Routes>
    <Route path="/" element={<Layout />} >
      <Route path="/" element={<CollectionsPage collections={[]} isFetching={true}/>} />
      <Route path="collections" element={<CollectionsPage collections={[]} isFetching={true}/>} />
      <Route path="collections/:collectionId" element={<CollectionDetails />} />
      <Route path="collections/EDIT/:collectionId/:locale" element={<MutateCollectionPage action='EDIT'/>} />
      <Route path="collections/ADD" element={<MutateCollectionPage action='ADD'/>} />
      <Route path="collections/translate/:collectionId/:locale" element={<TranslateCollection />} />
      <Route path="stories/ADD/:collectionId/:locale" element={<MutateStroyPage action='ADD'/>} />
      <Route path="stories/EDIT/:collectionId/:locale/:storyId" element={<MutateStroyPage action='EDIT'/>} />
      <Route path="stories/:collectionId/:defaultLocale" element={<StoriesPage/>} />
      <Route path="stories/details/:storyId" element={<StoryDetailsPage />} />
      <Route path="stories/translate/ADD/:storyId/:locale" element={<MutateStoryTranslationPage />} />
      <Route path="stories/translate/EDIT/:storyId/:locale" element={<MutateStoryTranslationPage action='EDIT'/>} />
    </Route>
</Routes>
)
export default MainRouter
