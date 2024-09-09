import React from 'react';
import "../styles/ProgressBar.css"
const ProgressBar = ({countdown, progress}) => {

    return (

        <div className="progress-container">
            <p>Отправка данных через {countdown} секунд...</p>
            <progress value={progress} max="100"></progress>
        </div>
    )

}

export default ProgressBar