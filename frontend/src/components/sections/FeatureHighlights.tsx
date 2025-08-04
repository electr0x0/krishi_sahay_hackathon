import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFeatures } from "@/lib/getData";

export default async function FeatureHighlights() {
  const features = await getFeatures();

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            আমাদের বিশেষ সুবিধাসমূহ
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            আধুনিক প্রযুক্তির সাহায্যে কৃষিকাজকে করুন আরও সহজ ও লাভজনক
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature) => (
            <Card 
              key={feature.id} 
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50"
            >
              <CardHeader className="text-center pb-4">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            আরও জানতে চান? আমাদের সাথে যোগাযোগ করুন
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
            বিস্তারিত জানুন
          </button>
        </div>
      </div>
    </section>
  );
}
