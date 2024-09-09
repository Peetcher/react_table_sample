import React, {useEffect, useRef, useState} from 'react';
import ProgressBar from "./ProgressBar";
import "../styles/InputForm.css"

const initialTableData = [
  [{ id: '0-1', value: '30 января 2024'}, { id: '0-2', value: 'Смена 2' }, { id: '0-3', value: 'Мастер: Иванов И. И.', type:'Name'}, { id: '0-4', value: 'РПТКМ-120' }],
  [{ id: '1-1', value: 'Персонал' }, { id: '1-2', value: '100500 человек' }, { id: '1-3', value: 'Комментарий в 3-5 строчек, который тоже можно редактировать.'}],
  [{ id: '2-1', value: 'КТП 2000 321' }, { id: '2-2', value: 'Работает' }, { id: '2-3', value: '24', type:'Int' }, { id: '2-4', value: 'SPI 3432' }],
  [{ id: '3-2', value: '98.4%' , type:'Interest' }, { id: '3-3', value: 'Функционирует, но не бьет' }]
];

const compareTables = (table1, table2) => {
  let differences = [];

  for (let i = 0; i < table1.length; i++) {
    for (let j = 0; j < table1[i].length; j++) {
      const cell1 = table1[i][j];
      const cell2 = table2[i] ? table2[i][j] : undefined; 

      if (cell2 && cell1.value !== cell2.value) {
        differences.push({
          id: cell1.id,
          value1: cell1.value,
          value2: cell2.value,
        });
      }
    }
  }

  return differences;
};
const InputForm = () => {

  const [prevTableData, setPrevTableData] = useState(initialTableData);
  const [tableData, setTableData] = useState(initialTableData);
  const [editedData, setEditedData] = useState({});
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const progressRef = useRef(null);
  const intervalRef = useRef(null);

  const validateInput = (value, colIndex, rowIndex) => {
    const type_of_data = tableData[rowIndex][colIndex]["type"];

    if (typeof type_of_data === 'undefined') {
      return {isValid: true, newValue: value}; 
    }

    let isValid = false;

    switch (type_of_data) {
      case 'Name':
        isValid = /^[А-Яа-яЁё.\s]+$/.test(value);
        break;
      case 'Int':
        isValid = /^\d*\.?\d*$/.test(value);
        break;
      case 'Interest':
        let numberValue = value.split('%')[0].trim(); 
        value = numberValue + '%'; 
        isValid = /^\d*\.?\d*$/.test(numberValue); 
        break;
    }

    return {isValid, newValue: value}; 
  };

  // Handle change in grid cell
  const handleCellChange = (rowIndex, colIndex, newValue) => {
    clearInterval(intervalRef.current);
    clearTimeout(progressRef.current);
    setProgress(0);
    setCountdown(0);

    const { isValid, newValue: validatedValue } = validateInput(newValue, colIndex, rowIndex);

    if (!isValid) return;


    const newTableData = tableData.map(row => row.map(cell => ({...cell})));
    newTableData[rowIndex][colIndex].value = validatedValue;

    setTableData(newTableData);
  };

  useEffect(() => {
    progressRef.current = setTimeout(() => {
      setEditedData(prevEditedData => {
        return compareTables(tableData, prevTableData);
      });
    }, 5000);

  }, [tableData]);

  useEffect(() => {
    if (Object.keys(editedData).length > 0) {
      setProgress(0);
      setCountdown(0);
      startProgressBar();

    }

  }, [editedData]);

  // Start progress bar and countdown
  const startProgressBar = () => {
    setCountdown(10);
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          sendEditedData();
          return prev;
        }
        return prev + 10;
      });
      setCountdown(prev => prev - 1);
    }, 1000);

  };

  const sendEditedData = () => {
    console.log('Edited Data:', editedData);
    setPrevTableData(tableData);
    setEditedData({});
    setProgress(0);
    setCountdown(0);
  };

  const renderRow = (rowData, rowIndex, gridClass) => (
      <div className={gridClass} key={`row-${rowIndex}`}>
        {rowData.map((cell, colIndex) => (
            <div key={cell.id} className={`grid-cell-${rowIndex +'-'+ colIndex}`}>
              <textarea
                  value={cell.value}
                  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
              />
            </div>
        ))}
      </div>
  );

  return (
      <div className="InputForm">

        <div className="grid-container">
          {/* Data rows */}
          {tableData.map((rowData, index) => renderRow(rowData, index, `row-${index}`))}
        </div>

        <div className="ProgressBar-container">

          {countdown > 0 &&
              (
              <ProgressBar countdown={countdown} progress={progress}/>
          )}
        </div>

      </div>

  );
};

export default InputForm;
