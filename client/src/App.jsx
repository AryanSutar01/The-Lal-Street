// client/src/App.jsx
import React from 'react';
import PortfolioAnalyzer from './components/PortfolioAnalyzer';
import './App.css';

function App() {
  return (
    <div className="App">
      <main className="main-content">
        <PortfolioAnalyzer />
      </main>
      <footer className="App-footer">
        <p>© 2024 The Lal Street - Your Financial Planning Partner</p>
      </footer>
    </div>
  );
}

export default App;