import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Forge from './forge.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Forge />
  </StrictMode>,
)
