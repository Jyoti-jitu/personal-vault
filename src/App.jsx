import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import WhyChoose from './components/WhyChoose';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary/20 selection:text-primary-dark">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <WhyChoose />
                <CTA />
            </main>
            <Footer />
        </div>
    )
}

export default App
