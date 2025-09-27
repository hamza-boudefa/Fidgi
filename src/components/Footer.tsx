"use client"

import { Instagram, Heart } from "lucide-react"
import { RiTiktokLine } from "react-icons/ri"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white shadow-3xl border-t border-border mt-20 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="font-bold text-2xl text-foreground">Fidgi™</div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Create your perfect fidget companion with our fully customizable mechanical clickers. 
            Every detail matters - make it uniquely yours.
          </p>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mb-8">
          <a 
            href="https://www.instagram.com/fidgi.world" target="_blank" 
            className="p-3 bg-muted rounded-full hover:bg-pink-600 hover:text-white transition-all duration-200 transform hover:scale-110"
            aria-label="Instagram"
          >
            <Instagram className="h-6 w-6" />
          </a>
          {/* tiktok*/}
          <a 
            href="https://www.tiktok.com/@fidgi.world" target="_blank" 
            className="p-3 bg-muted rounded-full hover:bg-black hover:text-white transition-all duration-200 transform hover:scale-110"
            aria-label="TikTok"
          >
            <RiTiktokLine className="h-6 w-6" />
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-muted-foreground">
            <span>© {currentYear} Fidgi™. All rights reserved.</span>
            <div className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>in Tunisia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}