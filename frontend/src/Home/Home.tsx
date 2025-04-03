import React from 'react'
import "./Home.css"
import FileUploader from './Components/FIleUploader/FileUploader'
function Home() {
  return (
    <React.Fragment>
        <div className='home-container'>
          <div className='operations-register-container'>
              <h3>Registro de predicciones</h3>
              <p>Por el momento no hay ningún registro.</p>
          </div>

          <div className='new-operation-container'>
              <FileUploader/>
          </div>
        </div>
    </React.Fragment>
  )
}

export default Home
