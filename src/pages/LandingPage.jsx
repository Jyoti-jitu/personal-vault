import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import WhyChoose from '../components/WhyChoose';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function LandingPage() {
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <Features />
                <WhyChoose />
                <CTA />
            </main>
            <Footer />
        </>
    );
}
