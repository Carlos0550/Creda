import React, { ReactElement, ReactNode, useState } from 'react'

import "./Layout.css"
import { useAppContext } from '../Context/AppContext'
interface LayoutInterface {
    content: ReactNode,
}
function Layout({ content }: LayoutInterface) {
    const {  
        usersHook:{
            getLocaleUserInfo
        }
    } = useAppContext()
    const [userData] = useState(getLocaleUserInfo())

    const cutOutNames = (name:string) =>{
        if(!name) return "";
        const names = name.split(" ")
        if(names.length > 2){
            return `${names[0] + " " + names.slice(-1)}`
        }else{
            return name
        }
    }
    return (
        <div className='layount-container'>
            <header className='header'>
                <nav className='nav'>
                    <div className='app_name-container'>
                        Creda
                    </div>
                    <div className='user_info'>
                        {cutOutNames(userData?.user_name || "")}
                    </div>
                </nav>
            </header>
            <main>
                {content}
            </main>
        </div>
    )
}

export default Layout
