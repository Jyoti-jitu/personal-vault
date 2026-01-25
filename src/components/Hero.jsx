import { ArrowRightIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import heroImage from '../assets/hero.png';
import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-100/40 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-green-50/40 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <h1 className="text-5xl lg:text-7xl font-heading font-bold text-gray-900 leading-[1.1]">
                            Protect Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dark to-primary">Digital Life</span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                            Store your sensitive files, passwords & notes safely and securely. The advanced vault for your personal data.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-xl shadow-blue-500/25 transform hover:-translate-y-1">
                                Get Started
                                <ArrowRightIcon className="h-5 w-5" />
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:border-gray-300">
                                <PlayCircleIcon className="h-6 w-6 text-gray-400" />
                                Learn More
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium pt-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <p>Trusted by <span className="text-gray-900 font-bold">10,000+</span> users</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative z-10 lg:scale-110">
                            <img src={heroImage} alt="Digital Vault Illustration" className="w-full h-auto drop-shadow-2xl rounded-2xl" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
