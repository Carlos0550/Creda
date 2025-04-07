import React, { useEffect, useRef, useState } from 'react';
import "./FileUploader.css"

import { FaTrash } from "react-icons/fa";
import { Button } from '@mantine/core';
import { FaBrain } from "react-icons/fa";
import { useAppContext } from '../../../Context/AppContext';
import FileUploaderLoader from './FileUploaderLoader';
function FileUploader() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const {
    usePredictHook: {
      sendFile, uploading, pendingColumns
    }
  } = useAppContext()

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleClearFile = () => {
    setIsDragging(false)
    setFile(undefined)
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleClick = () => {
    if (!fileInputRef.current) return
    fileInputRef.current.click();
  };

  const formatBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const value = bytes / Math.pow(1024, i)
    return `${value.toFixed(2)} ${sizes[1]}`
  }

  const handleSendFile = () => sendFile(file)
  const text = "Su archivo está en proceso de ser analizado, espere unos segundos...";
  return (
    <div
      className={`file-uploader-container ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {!pendingColumns && !file && (
        <label htmlFor="image-FILE">
          <input
            ref={fileInputRef}
            type="file"
            id="image-FILE"
            onChange={handleChange}
            accept='.csv, .tsv, .xlsx, .xls, .ods'
            style={{ display: 'none' }}
          />
          <Button type="submit" onClick={handleClick}>Seleccioná o arrastrá un archivo</Button>
        </label>
      )}

      {!pendingColumns && file && (
        <div className='file-information'>
          <ul>
            <strong>{file.name}</strong>
            <li>Tipo de archivo: {file.type.split("/").slice(-1)}</li>
            <li>Tamaño: {formatBytes(file.size)}</li>
          </ul>
          <div className="buttons-flex">
            <Button onClick={() => handleClearFile()} c={"white"} color="red" variant="outline"><FaTrash /> Eliminar</Button>
            <Button
              disabled={uploading}
              loading={uploading}
              color={"dark"} c="white" onClick={handleSendFile}><FaBrain /> Iniciar analisis</Button>
          </div>
        </div>
      )}

      {pendingColumns && (
        <div className='pending-columns-loader-container'>
          <span className="pending-c-loader">
            <FileUploaderLoader/>
          </span>

          <div className="wave-text">
            {text.split("").map((char, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.02}s` }}>
                {char}
              </span>
            ))}
          </div>        
        </div>
      )}
    </div>
  );
}

export default FileUploader;
