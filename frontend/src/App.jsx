import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import AppRoutes from './routes/AppRoutes';
import Intro from './components/Intro';

function App() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      {!introDone && <Intro onDone={() => setIntroDone(true)} />}
      {introDone && (
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <PlayerProvider>
                <AppRoutes />
              </PlayerProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
