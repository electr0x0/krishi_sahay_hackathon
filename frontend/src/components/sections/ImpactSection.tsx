import { Card, CardContent } from "@/components/ui/card";
import { getImpactStats } from "@/lib/getData";

export default async function ImpactSection() {
  const stats = await getImpactStats();

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            আমাদের প্রভাব
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            দেখুন কিভাবে কৃষি সহায় বাংলাদেশের কৃষকদের জীবনে ইতিবাচক পরিবর্তন এনেছে
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {stats.map((stat) => (
            <Card key={stat.id} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">
                  {stat.value}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {stat.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* SDG Alignment */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 lg:p-12 text-white text-center">
          <h3 className="text-2xl lg:text-3xl font-bold mb-6">
            টেকসই উন্নয়ন লক্ষ্যে আমাদের অবদান
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold mb-2">SDG 2</h4>
              <p className="text-green-100">ক্ষুধা নিবারণ</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-3">💼</div>
              <h4 className="font-semibold mb-2">SDG 8</h4>
              <p className="text-green-100">কর্মসংস্থান বৃদ্ধি</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-3">🌍</div>
              <h4 className="font-semibold mb-2">SDG 13</h4>
              <p className="text-green-100">জলবায়ু সুরক্ষা</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            আপনিও হয়ে উঠুন এই পরিবর্তনের অংশ
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            আজই যোগ দিন কৃষি সহায় পরিবারে এবং করুন আপনার কৃষিকাজে বিপ্লব
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              আজই শুরু করুন
            </button>
            <button className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300">
              আরও জানুন
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
