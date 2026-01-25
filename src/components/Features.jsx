import { ShieldCheckIcon, KeyIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const features = [
    {
        title: "Secure Storage",
        desc: "Keep your files encrypted and safe.",
        icon: ShieldCheckIcon,
        color: "bg-blue-50 text-blue-600",
        id: 1
    },
    {
        title: "Password Manager",
        desc: "Manage and store all your passwords.",
        icon: KeyIcon,
        color: "bg-orange-50 text-orange-600",
        id: 2
    },
    {
        title: "Private Notes",
        desc: "Save confidential notes and info.",
        icon: DocumentTextIcon,
        color: "bg-green-50 text-green-600",
        id: 3
    }
];

export default function Features() {
    return (
        <section id="features" className="py-12 bg-white relative z-20 -mt-10 lg:-mt-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-2xl">
                            <div className={`p-4 rounded-xl ${item.color}`}>
                                <item.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-snug">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
