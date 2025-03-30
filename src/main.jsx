import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AntdReact19Provider } from './utils/antdReact19Compat.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AntdReact19Provider>
      <App />
    </AntdReact19Provider>
  </React.StrictMode>,
);
