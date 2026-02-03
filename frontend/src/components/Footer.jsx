import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const links = [
    "Privacy Policy",
    "Terms of Service",
    "Cookie Policy",
    "Help Center"
];

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
            <div className="max-w-screen-2xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <ShieldCheckIcon className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xl font-heading font-bold text-gray-800">My Secure Vault</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8">
                        {links.map((link) => (
                            <a key={link} href="#" className="text-gray-500 hover:text-primary transition-colors text-sm font-medium">
                                {link}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} My Secure Vault. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        {/* Social placeholders */}
                        <div className="w-5 h-5 bg-gray-200 rounded-full hover:bg-primary/50 transition-colors cursor-pointer" />
                        <div className="w-5 h-5 bg-gray-200 rounded-full hover:bg-primary/50 transition-colors cursor-pointer" />
                        <div className="w-5 h-5 bg-gray-200 rounded-full hover:bg-primary/50 transition-colors cursor-pointer" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
