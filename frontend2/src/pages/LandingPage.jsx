import React from "react";
import {
  Star,
  Truck,
  Heart,
  GraduationCap,
  ArrowRight,
  Utensils,
  Users,
  Smile,
} from "lucide-react";
import { Button } from "../component/ui/button";
import { Input } from "../component/ui/input";
import { addToCart } from "../slices/CartSlice";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";

// Counter removed (no hooks/animation)

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-[#0a192f] dark:via-[#1e3a5f] dark:to-[#0f172a] text-gray-900 dark:text-white overflow-hidden transition-all duration-500 pl-2 sm:pl-4 lg:pl-6">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ perspective: "1000px" }}
      >
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/50 to-purple-50/30 dark:opacity-0 opacity-100"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f]/50 via-[#1e3a5f]/30 to-[#0f172a]/50 opacity-0 dark:opacity-100"></div>

          <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left pl-2 sm:pl-4 lg:pl-6">
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 mb-6">
                <Star className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">
                  #1 Campus Food Ordering
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8">
                <span className="block text-gray-900 dark:text-white">
                  One Tap
                </span>
                <span className="block bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Endless Bites
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0">
                Don't let hunger slow you down. Get your favorite meals
                delivered fast,
                <span className="text-red-500 font-semibold"> 24/7</span>, right
                on your fingertips.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-16">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link to="/student/dashboard" className="flex items-center">
                    Order Now <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                {/* <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-6 text-lg rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  <Link to="#demo" className="flex items-center">
                    <span className="mr-2">▶</span>Watch Demo
                  </Link>
                </Button> */}

                <Button
                  size="lg"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
                  onClick={() => {
                        const apkUrl = `${window.location.origin}/campus-bites.apk`;

                        const link = document.createElement("a");
                        link.href = apkUrl;
                        link.download = "campus-bites.apk"; // triggers actual download
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                >
                  <Download className="w-6 h-6" />
                  <div className="flex flex-col items-center leading-none">
                    <span>Download APK</span>
                  </div>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 lg:gap-12">
                <div className="flex flex-col items-center group">
                  <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 p-5 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Utensils className="w-7 h-7 text-red-500" />
                  </div>
                  <span className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-1">
                    100+
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">
                    Restaurants
                  </p>
                </div>
                <div className="flex flex-col items-center group">
                  <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 p-5 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="w-7 h-7 text-red-500" />
                  </div>
                  <span className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-1">
                    1k+
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">
                    Customers
                  </p>
                </div>
                <div className="flex flex-col items-center group">
                  <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 p-5 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Smile className="w-7 h-7 text-red-500" />
                  </div>
                  <span className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-1">
                    98%
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">
                    Satisfaction
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Logo Placeholder */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative w-96 h-96">
                <div
                  className="absolute top-1/2 left-1/2 w-44 h-44 bg-gradient-to-br from-red-600 via-rose-600 to-red-700 rounded-full shadow-2xl"
                  style={{ transform: "translate(-50%, -50%)" }}
                >
                  <div
                    className="absolute top-1/2 left-1/2 text-7xl font-black text-white"
                    style={{ transform: "translate(-50%, -50%)" }}
                  >
                    CB
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 bg-gray-100/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Why <span className="text-red-500">Campus Bites</span>?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We're not just another food app. We're built by students, for
              students, with features that matter to you.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/60 dark:bg-gray-800/40 p-8 rounded-2xl shadow-lg">
              <div className="flex items-center justify-center bg-red-500/10 rounded-full w-20 h-20 mb-6">
                <Heart className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Curated for You</h3>
              <p>
                Discover exclusive deals and combos from your favorite campus
                canteens.
              </p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/40 p-8 rounded-2xl shadow-lg">
              <div className="flex items-center justify-center bg-red-500/10 rounded-full w-20 h-20 mb-6">
                <Truck className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Real-Time Tracking</h3>
              <p>
                Know exactly where your order is, from the kitchen to your
                doorstep.
              </p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/40 p-8 rounded-2xl shadow-lg">
              <div className="flex items-center justify-center bg-red-500/10 rounded-full w-20 h-20 mb-6">
                <GraduationCap className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Student-Friendly Prices
              </h3>
              <p>Enjoy delicious meals that won't break the bank.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Get Started in <span className="text-red-500">3 Easy Steps</span>
          </h2>

          {/* Steps container */}
          <div className="flex flex-col space-y-6">
            {/* Step 1 */}
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-2xl shadow-lg p-8 text-left">
              <h3 className="text-3xl font-bold mb-3 text-red-500">
                1. Browse & Select
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Explore menus from all campus canteens in one place. Find your
                favorite dish or try something new!
              </p>
            </div>
            {/* Step 2 */}
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-2xl shadow-lg p-8 text-left">
              <h3 className="text-3xl font-bold mb-3 text-red-500">
                2. Place Your Order
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add items to your cart, choose your payment method, and confirm
                your order in a few taps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-2xl shadow-lg p-8 text-left">
              <h3 className="text-3xl font-bold mb-3 text-red-500">
                3. Track & Enjoy
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Follow your order in real-time and get notified when it's
                arriving. Hot and fresh, right at your door!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
