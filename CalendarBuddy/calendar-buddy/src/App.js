import React, { useState } from 'react';
import './App.css';
import GoogleCalendarIntegration from './components/GoogleCalendarIntegration';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Calendar Buddy</h1>
        <GoogleCalendarIntegration />
      </header>
    </div>
  );
}

export default App;