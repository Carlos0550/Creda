import React, { useEffect, useRef } from 'react'
import "./Home.css"
import FileUploader from './Components/FIleUploader/FileUploader'
import { useAppContext } from '../Context/AppContext'

import { Flex, Skeleton } from '@mantine/core'
import FileListComponent from './Components/FIleList/FileListComponent'
function Home() {
  const {   
    usePredictHook: {
      gettingPendingFiles, verifyPendingFilesForUser, userId
    }
  } = useAppContext()

  const alreadyFetched = useRef(false)
  useEffect(()=>{
    if(!userId || alreadyFetched.current) return;
    verifyPendingFilesForUser()
    alreadyFetched.current = true
  },[userId])
  return (
    <React.Fragment>
        <div className='home-container'>
          <div className='operations-register-container'>
              {!gettingPendingFiles && (
                <FileListComponent/>
              )}
              {gettingPendingFiles && (
                <Flex direction={"column"} gap={20} mt={10} mb={10} justify={"center"} align={"flex-start"}>
                  <Skeleton height={15} width={200} animate/>
                  <Skeleton height={15} width={400} animate/>
                  <Skeleton height={15} width={400} animate/>
                  <Skeleton height={15} width={400} animate/>
              </Flex>
              )}
          </div>

          <div className='new-operation-container'>
              <FileUploader/>
          </div>
        </div>
    </React.Fragment>
  )
}

export default Home
