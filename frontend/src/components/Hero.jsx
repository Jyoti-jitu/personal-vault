import { ArrowRightIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import { CloudIcon, LockClosedIcon, StarIcon } from '@heroicons/react/24/solid'; // Using solid for illustrative elements
import heroImage from '../assets/hero-vault.png';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Floating animation variants
const floatVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" }
    },
    floating: {
        y: [-10, 10, -10],
        transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const cloudVariant = {
    animate: {
        x: [-20, 20, -20],
        transition: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const pulseVariant = {
    pulse: {
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8],
        filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const sparkleVariant = {
    twinkle: (i) => ({
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        transition: {
            duration: 2,
            delay: i * 0.5,
            repeat: Infinity,
            repeatDelay: 1
        }
    })
};

export default function Hero() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={targetRef} className="pt-32 pb-20 bg-gradient-to-br from-[#F5F9FF] via-white to-[#EFF6FF] overflow-hidden relative min-h-[90vh] flex items-center">

            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/30 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-50/40 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />

            <div className="max-w-screen-2xl mx-auto px-6 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={floatVariant}
                        className="space-y-8"
                    >
                        <h1 className="text-5xl lg:text-7xl font-heading font-bold text-gray-900 leading-[1.1]">
                            Protect Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dark to-primary relative">
                                Digital Life
                                <motion.svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <motion.path
                                        d="M0 5 Q 50 10 100 5"
                                        fill="transparent"
                                        stroke="#22C55E"
                                        strokeWidth="4"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 1 }}
                                    />
                                </motion.svg>
                            </span>
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

                        {/* Social Proof */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium pt-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <p>Trusted by <span className="text-gray-900 font-bold">10,000+</span> users</p>
                        </div>
                    </motion.div>

                    {/* 3D Illustration Area */}
                    <motion.div
                        style={{ y, opacity }}
                        className="relative"
                    >
                        {/* Glow Effect behind Vault */}
                        <motion.div
                            animate={{ opacity: [0.5, 0.8, 0.5], scale: [0.9, 1.0, 0.9] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 bg-blue-400/20 blur-[80px] rounded-full -z-10"
                        />

                        {/* Main Vault Image */}
                        <motion.div
                            animate="floating"
                            variants={floatVariant}
                            className="relative z-10 lg:scale-110 drop-shadow-2xl"
                        >
                            <img src={heroImage} alt="Digital Vault Illustration" className="w-full h-auto" />

                            {/* Overlay Animated Elements (to enhance the "alive" feel) */}

                            {/* 1. Breathing Lock Icon - Positioned as if floating near the door */}
                            <motion.div
                                variants={pulseVariant}
                                animate="pulse"
                                className="absolute -top-6 -right-6 lg:right-0 bg-white p-4 rounded-2xl shadow-lg border border-blue-50"
                            >
                                <LockClosedIcon className="w-8 h-8 text-primary" />
                            </motion.div>

                            {/* 2. Drifting Clouds */}
                            <motion.div
                                variants={cloudVariant}
                                animate="animate"
                                className="absolute top-1/2 -left-12 text-blue-200/80"
                            >
                                <CloudIcon className="w-16 h-16" />
                            </motion.div>
                            <motion.div
                                variants={cloudVariant}
                                animate="animate"
                                transition={{ delay: 2 }}
                                className="absolute -bottom-8 right-12 text-blue-100/80"
                            >
                                <CloudIcon className="w-12 h-12" />
                            </motion.div>

                            {/* 3. Sparkles */}
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    custom={i}
                                    variants={sparkleVariant}
                                    animate="twinkle"
                                    className={`absolute text-yellow-400 ${i === 1 ? 'top-10 left-10' : i === 2 ? 'top-20 right-20' : 'bottom-20 left-1/3'
                                        }`}
                                >
                                    <StarIcon className="w-6 h-6" />
                                </motion.div>
                            ))}

                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
