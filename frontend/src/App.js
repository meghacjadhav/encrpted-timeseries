import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');
function App() {
  const [res, setResult] = useState([]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected!!');
    });

    socket.on('savedData', (savedData) => {
      setResult((prevRes) => [...prevRes, savedData]);
    });
  }, []);

  return (
    <>
    <h1>Encrypted Timeseries</h1>
    <React.Fragment>
      {res.map((item, index) => (
        <div key={index}>
          <p>Name: {item.name}</p>
          <p>Origin: {item.origin}</p>
          <p>Destination: {item.destination}</p>
          <p>Timestamp: {new Date(item.timestamp).toLocaleString()}</p>
          <hr />
        </div>
      ))}
    </React.Fragment>
  </>
  );
}

export default App;
