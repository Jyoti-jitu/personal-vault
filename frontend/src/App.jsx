import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import PaymentCardsPage from './pages/PaymentCardsPage';
import PersonalInformationPage from './pages/PersonalInformationPage';

import ImportantImagesPage from './pages/ImportantImagesPage';
import DocumentsPage from './pages/DocumentsPage';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary/20 selection:text-primary-dark">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/personal-info" element={<PersonalInformationPage />} />
                    <Route path="/important-images" element={<ImportantImagesPage />} />
                    <Route path="/cards" element={<PaymentCardsPage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
