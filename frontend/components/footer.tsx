import Link from "next/link"
import { Instagram, Linkedin } from "lucide-react"
import { memo } from "react"

function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">CampusBites</h3>
            <p className="text-slate-500 dark:text-gray-400 mb-4">Delicious food delivered to your doorstep on campus.</p>
            <div className="flex space-x-4">
              <Link href="https://www.linkedin.com/company/campusbites-in/" className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="https://www.instagram.com/campusbites_in/" className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/quickbite" className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  QuickBite
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Information</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/termsconditions" className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacypolicy" className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Contact Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@campusbites.in" className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  support@campusbites.in
                </a>
              </li>
              <li>
                <a href="tel:+917529052525" className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  +91 75290 52525
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-300 dark:border-gray-700 mt-8 pt-6 text-center text-sm text-slate-500 dark:text-gray-400">
          <p className="mb-4">
            By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners.
          </p>
          <p>
            © {new Date().getFullYear()} Campus Bites. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default memo(Footer)
