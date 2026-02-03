import { useState, useEffect } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-screen-2xl mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 cursor-pointer group">
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <ShieldCheckIcon className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-xl font-heading font-bold text-gray-800 tracking-tight">My Secure Vault</span>
                </Link>
                <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
                    <a href="#features" className="hover:text-primary transition-colors">Features</a>
                    <a href="#about" className="hover:text-primary transition-colors">About</a>
                    <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
                    <Link to="/login" className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition-all hover:shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5 active:translate-y-0">
                        Login
                    </Link>
                </div>
            </div>
        </nav>
    );
}
