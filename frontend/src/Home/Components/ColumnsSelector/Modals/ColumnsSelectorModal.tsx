import { Button, Modal } from '@mantine/core'
import React from 'react'

interface Props{
    openedHasNotIdColumn: boolean
    closeHasNotIdColumn: () => void
}
function ColumnsSelectorModal({openedHasNotIdColumn, closeHasNotIdColumn}: Props) {
  return (
    <Modal
        opened={openedHasNotIdColumn}
        onClose={closeHasNotIdColumn}
        title={<h3>Identificador de registros no encontrado</h3>}
        centered
        >
        <p>Tu archivo no incluye una columna que identifique a cada cliente (como <i>cliente_id</i>, <i>DNI</i>, <i>correo</i>, etc.).</p>
        <p>Sin esta columna, Creda no podrá vincular los resultados de riesgo a una persona específica.</p>
        <p>Por eso, se generará un identificador interno automáticamente para cada registro. Esto permite continuar con el análisis, pero tené en cuenta que no podrás saber a qué cliente corresponde cada predicción.</p>
        <Button onClick={closeHasNotIdColumn} color='black' c={"white"}>Entendido</Button>
    </Modal>

  )
}

export default ColumnsSelectorModal
