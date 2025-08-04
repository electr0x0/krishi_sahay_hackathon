import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-16 pt-16">
      {/* Background Image - Same as header */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://i.postimg.cc/Ss4ZcqjS/jochen-van-wylick-m-5-TPI3d-Hc-Y-unsplash.jpg')",
          }}
        ></div>
        {/* Subtle overlay for text readability - much lighter */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          
          {/* Logo/Brand */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              <span className="text-green-500 drop-shadow-lg">কৃষি</span> 
              <span className="text-gray-800 drop-shadow-lg ml-2">BETA</span>
            </h2>
          </div>

          {/* Main Headline - Matching the reference */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-green-500 drop-shadow-lg">কৃষি সহায়</span>{' '}
            <span className="text-gray-800 drop-shadow-lg">: The Solution</span>
            <br />
            <span className="text-gray-700 drop-shadow text-3xl sm:text-4xl lg:text-5xl font-normal">
              For Your Tomorrow&apos;s Agriculture
            </span>
          </h1>
          
          {/* Sub-headline */}
          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-lg sm:text-xl text-gray-200 drop-shadow leading-relaxed">
              Welcome to <span className="text-green-600 font-semibold">কৃষি সহায়</span> where we cultivate innovation and grow sustainable futures. 
              Discover the latest in agriculture, from expert insights to cutting-edge practices. 
              Join us in nurturing a greener world.
            </p>
          </div>
          
          {/* CTA Button - Matching the reference style */}
          <div className="mb-16">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0"
              >
                Get Started Now →
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-orange-300">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium drop-shadow">১০,০০০+ কৃষক</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium drop-shadow">৬৤ জেলায় সেবা</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium drop-shadow">২৪/৭ সহায়তা</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium drop-shadow">AUTOMECH 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Design Attribution */}
      <div className="absolute bottom-4 left-4 text-gray-600 drop-shadow text-xs">
        Design For Agriculture Website
      </div>
    </section>
  );
}
