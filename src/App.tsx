import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SurveySwitcher } from './pages/SurveySwitcher'
import { OrbSurveyPage } from './pages/OrbSurveyPage'
import { ArenaSurvey } from './pages/ArenaSurvey'
import { AllQuestionsSurvey } from './pages/AllQuestionsSurvey'
import { TestSurvey } from './pages/TestSurvey'

export default function App() {
    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <div style={{ position: 'relative', width: '100%', height: '100%', flex: 1 }}>
                <Routes>
                    <Route path="/" element={<SurveySwitcher />} />
                    <Route path="/orb" element={<OrbSurveyPage />} />
                    <Route path="/arena" element={<ArenaSurvey />} />
                    <Route path="/all" element={<AllQuestionsSurvey />} />
                    <Route path="/test" element={<TestSurvey />} />
                    <Route path="/test-neobrutalism" element={<TestSurvey neoBrutal />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}
