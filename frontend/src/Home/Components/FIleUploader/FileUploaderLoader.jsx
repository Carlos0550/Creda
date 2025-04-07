import React from 'react'

function FileUploaderLoader() {
    return (
        <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="#ffffff"
        >
            <style>{`
      @keyframes loader3 {
        0% { transform: rotate(0); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
            <path
                fill="#ffffff"
                d="M6.685 13.626a1.626 1.626 0 100-3.252 1.626 1.626 0 000 3.252zm5.315 0a1.626 1.626 0 100-3.252 1.626 1.626 0 000 3.252zm5.316 0a1.626 1.626 0 100-3.252 1.626 1.626 0 000 3.252z"
                style={{
                    animation: "loader3 1s cubic-bezier(.63,-.71,.32,1.28) infinite both",
                    transformOrigin: "center center"
                }}
            />
        </svg>
    )
}

export default FileUploaderLoader
