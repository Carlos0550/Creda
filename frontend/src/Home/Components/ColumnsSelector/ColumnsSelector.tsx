import React, { useEffect, useState } from 'react'
import "./ColumnsSelector.css"
import { useAppContext } from '../../../Context/AppContext'
function ColumnsSelector() {
    const {
        usePredictHook: {
            currentFileData

        }
    } = useAppContext()

    const [columns, setColumns] = useState([])
    const [rows, setRows] = useState([]);
    const [hoveredColIndex, setHoveredColIndex] = useState(null);


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
    return (
        <div className='column-selector-table-container'>
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
        </div>
    )
}

export default ColumnsSelector
