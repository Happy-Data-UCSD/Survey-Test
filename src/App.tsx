import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SurveySwitcher } from './pages/SurveySwitcher'
import { OrbSurveyPage } from './pages/OrbSurveyPage'
import { ArenaSurvey } from './pages/ArenaSurvey'
import { AllQuestionsSurvey } from './pages/AllQuestionsSurvey'

export default function App() {
    return (
        <BrowserRouter>
            <div style={{ position: 'relative', width: '100%', height: '100%', flex: 1 }}>
                <Routes>
                    <Route path="/" element={<Navigate to="/survey" replace />} />
                    <Route path="/survey" element={<SurveySwitcher />} />
                    <Route path="/survey/orb" element={<OrbSurveyPage />} />
                    <Route path="/survey/arena" element={<ArenaSurvey />} />
                    <Route path="/survey/all" element={<AllQuestionsSurvey />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}
