import React, { useEffect, useRef } from 'react'
import "./Home.css"
import FileUploader from './Components/FIleUploader/FileUploader'
import { useAppContext } from '../Context/AppContext'

import { Flex, Skeleton } from '@mantine/core'
import FileListComponent from './Components/FIleList/FileListComponent'
import ColumnsSelector from './Components/ColumnsSelector/ColumnsSelector'
function Home() {
  const {
    usePredictHook: {
      gettingPendingFiles, verifyPendingFilesForUser, userId, currentFileData
    }
  } = useAppContext()

  const alreadyFetched = useRef(false)
  useEffect(() => {
    if (!userId || alreadyFetched.current) return;
    verifyPendingFilesForUser()
    alreadyFetched.current = true
  }, [userId])
  return (
    <React.Fragment>
      <div className='home-container'>


        {currentFileData && Object.keys(currentFileData).length > 0 ? (
          <ColumnsSelector />
        ) : (
          <>
            <div className='operations-register-container'>
              {gettingPendingFiles ? (
                <Flex direction={"column"} gap={20} mt={10} mb={10} justify={"center"} align={"flex-start"} style={{flex: "1"}}>
                  <Skeleton height={15} width={300} animate />
                  <Skeleton height={15} width={400} animate />
                  <Skeleton height={15} width={400} animate />
                  <Skeleton height={15} width={400} animate />
                  <Skeleton height={15} width={400} animate />
                  <Skeleton height={15} width={400} animate />
                  <Skeleton height={15} width={400} animate />
                </Flex>
              ) : (
                <>
                <FileListComponent />
                
                </>
              )}
              
            </div>
            <div className='new-operation-container'>
              <FileUploader />
            </div>
            
          </>
        )}
      </div>
    </React.Fragment>
  )
}

export default Home
