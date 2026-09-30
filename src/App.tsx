import { HashRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './features/dashboard/Dashboard'
import { DailyLogPage } from './features/daily-log/DailyLogPage'
import { CalendarPage } from './features/calendar/CalendarPage'
import { ExpensesPage } from './features/expenses/ExpensesPage'
import { SettingsPage } from './features/settings/SettingsPage'

function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/log" element={<DailyLogPage />} />
              <Route path="/log/:date" element={<DailyLogPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </ErrorBoundary>
  )
}

export default App
