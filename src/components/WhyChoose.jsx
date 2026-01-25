import { LockClosedIcon, DevicePhoneMobileIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

const reasons = [
    {
        title: "Top-Notch Security",
        desc: "Advanced encryption to protect your data",
        icon: LockClosedIcon,
        color: "from-blue-400 to-blue-600"
    },
    {
        title: "Easy Access",
        desc: "Access your vault from any device.",
        icon: DevicePhoneMobileIcon,
        color: "from-indigo-400 to-indigo-600"
    },
    {
        title: "Automatic Backup",
        desc: "Your data is always backed up.",
        icon: CloudArrowUpIcon,
        color: "from-sky-400 to-sky-600"
    }
];

export default function WhyChoose() {
    return (
        <section className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-16">
                    Why Choose My Secure Vault?
                </h2>

                <div className="grid md:grid-cols-3 gap-12">
                    {reasons.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center group">
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} p-0.5 mb-6 transform transition-transform group-hover:scale-110 shadow-lg`}>
                                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                                    <item.icon className="w-10 h-10 text-gray-700" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-500 max-w-xs">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
