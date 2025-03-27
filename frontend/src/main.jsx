import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import {
  MantineProvider,
} from "@mantine/core"

import {
  Notifications
} from "@mantine/notifications"

import { BrowserRouter } from "react-router-dom"

import '@mantine/notifications/styles.css';
import '@mantine/core/styles.css';
import { AppContextProvider } from './Context/AppContext.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider>
      <BrowserRouter>
        <AppContextProvider>
          <Notifications />
          <App></App>
        </AppContextProvider>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
)
