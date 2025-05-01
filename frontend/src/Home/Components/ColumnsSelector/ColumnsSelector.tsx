import React, { useEffect, useRef, useState } from 'react'
import "./ColumnsSelector.css"
import { useAppContext } from '../../../Context/AppContext'
import { Radio } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ColumnsSelectorModal from './Modals/ColumnsSelectorModal';

type AnalysisStep = "columnsSelect" | ""
function ColumnsSelector() {
    const {
        usePredictHook: {
            currentFileData

        }
    } = useAppContext()
    const [checked, setChecked] = useState<boolean>(false);
    const [openedHasNotIdColumn, { open: openHasNotIdColumn, close: closeHasNotIdColumn }] = useDisclosure(false);

    const [columns, setColumns] = useState([])
    const [rows, setRows] = useState([]);
    const [hoveredColIndex, setHoveredColIndex] = useState(null);

    // const [steps, setSteps] = useState

    useEffect(() => {
        if (currentFileData) {
            const {
                data: { sample_data }
            } = currentFileData

            if (sample_data && sample_data.length > 0) {
                const cols = Object.keys(sample_data[0])
                setColumns(cols)
                setRows(sample_data);
            }
        }
    }, [currentFileData])

    const alreadyAllowed = useRef(false)
    useEffect(()=>{
        if(!checked || alreadyAllowed.current) return;
        alreadyAllowed.current = true
        openHasNotIdColumn()
    },[checked])


    return (
        <div className='column-selector-table-container'>
            <div className="column-selector-steps">
                <div className="column-selector-step_1">
                    <p className='column-selector-p'>Por favor, seleccione la columna que sirva como identificador del cliente, puede ser un ID, un nombre, un email, etc</p>
                    <Radio
                        label="No tengo una columna de identificador de cliente"
                        checked={checked}
                        onClick={() => setChecked(!checked)}
                    />
                </div>
            </div>
            <table className='column-selector-table'>
                <thead>
                    <tr>
                        {columns.map((col, colIndex) => (
                            <th
                                key={col}
                                onMouseEnter={() => setHoveredColIndex(colIndex)}
                                onMouseLeave={() => setHoveredColIndex(null)}
                                className={hoveredColIndex === colIndex ? 'hovered-column' : ''}
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col, colIndex) => (
                                <td
                                    key={col}
                                    onMouseEnter={() => setHoveredColIndex(colIndex)}
                                    onMouseLeave={() => setHoveredColIndex(null)}
                                    className={hoveredColIndex === colIndex ? 'hovered-column' : ''}
                                >
                                    {String(row[col])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <ColumnsSelectorModal
                openedHasNotIdColumn={openedHasNotIdColumn}
                closeHasNotIdColumn={closeHasNotIdColumn}
            />
        </div>
    )
}

export default ColumnsSelector
