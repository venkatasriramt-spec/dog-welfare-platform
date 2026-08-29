import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './navigation.css';
import './firebase-ui.css';

class AppErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <main className="startup-error"><p className="eyebrow">— PAWPATH COULDN’T START</p><h1>We found an app error.</h1><p>{this.state.error.message}</p><p>Open the browser console for details, then refresh after correcting it.</p></main>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(<StrictMode><AppErrorBoundary><App /></AppErrorBoundary></StrictMode>);
