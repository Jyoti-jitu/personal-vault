export default function CTA() {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary opacity-5 pattern-grid-lg" />
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
                    Get Started with My Secure Vault Today!
                </h2>
                <p className="text-xl text-gray-500 mb-10">
                    Join thousands of users who trust us with their digital life.
                </p>

                <div className="flex flex-col items-center gap-4">
                    <button className="bg-accent hover:bg-accent-hover text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl shadow-green-500/30 transform transition-all hover:-translate-y-1 hover:shadow-2xl active:translate-y-0">
                        Create Your Free Account
                    </button>
                    <p className="text-sm text-gray-400 font-medium tracking-wide">
                        NO CREDIT CARD REQUIRED
                    </p>
                </div>
            </div>
        </section>
    );
}
