import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/css/index.css'
import {EditorPage} from "./pages/EditorPage/EditorPage.tsx";
// import App from './app/tsx/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*<App />*/}
      <EditorPage></EditorPage>
  </StrictMode>,
)
