import Link from 'next/link';
import { Briefcase, Code, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">CoFounder</h1>
            <p className="ml-4 text-sm text-gray-500 hidden sm:block">
              Find Your Perfect Technical Co-Founder
            </p>
          </div>
          <nav>
            <Link 
              href="/auth/founder/signin"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium mr-4"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              Bridge the Gap Between Ideas and Execution
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              CoFounder connects visionary founders with skilled technical 
              co-founders who can transform innovative ideas into reality.
            </p>
            
            {/* Signup Options */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/auth/founder/signin"
                className="flex items-center justify-between bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition"
              >
                <div className="flex items-center">
                  <Briefcase className="h-6 w-6 mr-3" />
                  <span>I'm a Founder</span>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <Link 
                href="/auth/developer/signin"
                className="flex items-center justify-between bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition"
              >
                <div className="flex items-center">
                  <Code className="h-6 w-6 mr-3" />
                  <span>I'm a Developer</span>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="hidden md:block">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 rounded-lg p-4 transform hover:scale-105 transition">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                    For Founders
                  </h3>
                  <p className="text-sm text-indigo-600">
                    Find technical co-founders who share your vision and can 
                    build your product from ground up.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 transform hover:scale-105 transition">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    For Developers
                  </h3>
                  <p className="text-sm text-green-600">
                    Discover exciting startup opportunities and join 
                    innovative projects as a co-founder.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} CoFounder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}