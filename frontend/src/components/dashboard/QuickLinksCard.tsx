'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

interface QuickLink {
  title: string;
  href: string;
  icon: string;
  description: string;
  color: string;
}

export default function QuickLinksCard() {
  const links: QuickLink[] = [
    {
      title: 'বাজার',
      href: '/market',
      icon: '🏪',
      description: 'ফসল কিনুন-বিক্রি করুন',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'আমার খামার',
      href: '/my-farm',
      icon: '🚜',
      description: 'খামার ব্যবস্থাপনা',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'আবহাওয়া',
      href: '/weather',
      icon: '🌤️',
      description: 'বিস্তারিত পূর্বাভাস',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      title: 'সহায়তা',
      href: '/support',
      icon: '💬',
      description: 'সাহায্য পান',
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          ⚡ দ্রুত অ্যাক্সেস
        </h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {links.map((link, index) => (
            <Link key={index} href={link.href}>
              <div className={`relative p-4 rounded-xl bg-gradient-to-br ${link.color} text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="text-2xl mb-2">{link.icon}</div>
                  <h3 className="font-bold text-sm mb-1">{link.title}</h3>
                  <p className="text-xs text-white/80 leading-tight">
                    {link.description}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-2">
            <button className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <span className="text-lg">📊</span>
                <span className="font-medium text-gray-700">ড্যাশবোর্ড রিপোর্ট</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <span className="text-lg">⚙️</span>
                <span className="font-medium text-gray-700">সেটিংস</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
