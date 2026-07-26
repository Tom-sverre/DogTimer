import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainDashboard from './pages/MainDashboard'
import DogDashboard from './pages/DogDashboard'
import SleepTracker from './pages/SleepTracker'
import FeedingLog from './pages/FeedingLog'
import VetAppointments from './pages/VetAppointments'
import KnowledgeBase from './pages/KnowledgeBase'
import Settings from './pages/Settings'
import Navbar from './components/Navbar'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null, info: null } }
  static getDerivedStateFromError(e) { return { err: e } }
  componentDidCatch(err, info) { this.setState({ err, info }) }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 24, color: '#fff', background: '#0f1117', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#f87' }}>🐾 App-feil</h2>
          <pre style={{ color: '#faa', whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {'FEIL: ' + (this.state.err?.message || String(this.state.err))}
            {'\n\n'}
            {this.state.err?.stack}
          </pre>
          {this.state.info?.componentStack && (
            <pre style={{ color: '#ff0', whiteSpace: 'pre-wrap', fontSize: 13, marginTop: 16, borderTop: '1px solid #444', paddingTop: 16 }}>
              {'KOMPONENTSTACK:' + this.state.info.componentStack}
            </pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/dog/:dogId" element={<DogDashboard />} />
        <Route path="/dog/:dogId/søvn" element={<SleepTracker />} />
        <Route path="/dog/:dogId/mat" element={<FeedingLog />} />
        <Route path="/dog/:dogId/vet" element={<VetAppointments />} />
        <Route path="/dog/:dogId/kunnskap" element={<KnowledgeBase />} />
        <Route path="/innstillinger" element={<Settings />} />
      </Routes>
    </ErrorBoundary>
  )
}
