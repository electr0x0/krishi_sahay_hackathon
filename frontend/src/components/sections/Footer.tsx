export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-green-400">
              কৃষি সহায়
            </h3>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              AI প্রযুক্তির সাহায্যে বাংলাদেশের কৃষকদের জীবনযাত্রার মান উন্নয়নে কাজ করছি। 
              আমাদের লক্ষ্য একটি স্মার্ট ও টেকসই কৃষি ব্যবস্থা গড়ে তোলা।
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <span className="sr-only">YouTube</span>
                📺
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">
              দ্রুত লিংক
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  আমাদের সেবা
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  কৃষক নিবন্ধন
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  বাজার দর
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  সহায়তা কেন্দ্র
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">
              যোগাযোগ
            </h4>
            <ul className="space-y-3">
              <li className="text-gray-300">
                📞 ১৬২৬৩ (২৪/৭)
              </li>
              <li className="text-gray-300">
                📧 support@krishisahay.bd
              </li>
              <li className="text-gray-300">
                📍 ঢাকা, বাংলাদেশ
              </li>
            </ul>
          </div>
        </div>

        {/* Team & Competition Info */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-green-400">
                Team GitGud
              </h4>
              <p className="text-gray-300 text-sm">
                AUTOMECH 2025 প্রতিযোগিতার জন্য তৈরি একটি উদ্ভাবনী প্রকল্প। 
                আমরা প্রযুক্তির মাধ্যমে কৃষি ক্ষেত্রে বৈপ্লবিক পরিবর্তন আনতে প্রতিশ্রুতিবদ্ধ।
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3 text-green-400">
                দায়িত্বশীল AI
              </h4>
              <p className="text-gray-300 text-sm">
                আমরা AI প্রযুক্তি ব্যবহারে নৈতিকতা ও স্বচ্ছতা বজায় রাখি। 
                কৃষকদের গোপনীয়তা সুরক্ষা এবং ন্যায্য প্রযুক্তি প্রয়োগে আমরা অঙ্গীকারবদ্ধ।
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © ২০২৫ কৃষি সহায়। সকল অধিকার সংরক্ষিত।
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              গোপনীয়তা নীতি
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              ব্যবহারের শর্তাবলী
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              কুকি নীতি
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
