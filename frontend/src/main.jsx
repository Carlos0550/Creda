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

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { AppContextProvider } from './Context/AppContext.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <MantineProvider
      theme={{
        fontFamily: 'Poppins, sans-serif', 
      }}
      withGlobalStyles 
      withNormalizeCSS
    >
      <BrowserRouter>
        <AppContextProvider>
          <Notifications />
          <App />
        </AppContextProvider>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
)