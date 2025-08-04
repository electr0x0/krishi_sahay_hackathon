import { getWorkSteps } from "@/lib/getData";
import Link from "next/link";

export default async function HowItWorks() {
  const steps = await getWorkSteps();

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            কিভাবে কাজ করে
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            মাত্র তিনটি সহজ ধাপে শুরু করুন আপনার স্মার্ট কৃষি যাত্রা
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-200 to-green-400"></div>
            
            {steps.map((step, index) => (
              <div key={step.id} className={`relative flex items-center mb-12 lg:mb-16 ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              }`}>
                {/* Step Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl">{step.icon}</div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step Number Circle */}
                <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-green-600 text-white rounded-full items-center justify-center font-bold text-xl shadow-lg z-10">
                  {step.step}
                </div>

                {/* Mobile Step Number */}
                <div className="lg:hidden w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg mr-4">
                  {step.step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              আজই শুরু করুন
            </h3>
            <p className="text-gray-600 mb-6">
              হাজারো কৃষকের সাথে যোগ দিন এবং আপনার কৃষিকাজে নিয়ে আসুন প্রযুক্তির ছোঁয়া
            </p>
            <Link href="/dashboard">
              <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                এখনই নিবন্ধন করুন
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
