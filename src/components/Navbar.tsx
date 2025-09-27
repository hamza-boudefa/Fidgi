"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import SplitText from "@/components/SplitText"
import Shuffle from "./ui/shadcn-io/shuffle"
import Image from "next/image"
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const navLinks = [
    { href: "/", label: "World" },
    { href: "/about", label: "Discover" },
    { href: "/Store", label: "Treasure Box" },
    // { href: "/blog", label: "Blog" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 ">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="logo" width={72} height={72} />
            <span className="text-xl font-bold text-foreground transition-all duration-300">
              {/* FIDGI™ */}
              FIDGI™
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center bg-[#00000080] backdrop-blur-xs rounded-full px-2 py-2 border border-white/10 shadow-lg">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-white text-sm font-medium rounded-full transition-all duration-300 group overflow-hidden"
              >
                <span className="relative z-10 transition-all duration-300">
    <Shuffle
      text={link.label}
      shuffleDirection="right"
      duration={0.5}
      animationMode="evenodd"
      shuffleTimes={2}
      ease="power3.out"
      stagger={0.05}
      threshold={0.1}
      triggerOnce={false}
      triggerOnHover={true}
      respectReducedMotion={true}
      className="text-white"
      style={{
        fontSize: 'clamp(1rem, 8vw, 1rem)',
        fontFamily: 'Poppins',
        fontWeight: 'semibold',
        paddingTop: '8px',
      }}
    />
                </span>
              </Link>
            ))}
          </div>
          <Button
            asChild
            className="ml-2 bg-white/90 text-black rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 border border-white/20"
          >
            <Link href="/contact">Reach Out</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-foreground transition-all duration-300 rounded-full"
          aria-label="Toggle menu"
        >
          <div className={`transition-transform duration-300 ${isMenuOpen ? "rotate-180" : "rotate-0"}`}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden transition-all duration-500 ease-out ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
      >
        <div className="mt-4 mx-4">
          <div className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
            <div className="flex flex-col items-center gap-6">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-black group ${isMenuOpen ? "animate-in slide-in-from-top-2" : ""}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <SplitText
  text={link.label}
  className="text-2xl font-semibold text-center text-black"
  delay={100}
  duration={0.6}
  ease="power3.out"
  splitType="chars"
  from={{ opacity: 0, y: 40 }}
  to={{ opacity: 1, y: 0 }}
  threshold={0.1}
  rootMargin="-100px"
  textAlign="center"
  onLetterAnimationComplete={() => {}}
/>
                    
                </Link>
              ))}
              <Button
                asChild
                className={`bg-white/90 text-black rounded-full px-8 py-3 text-lg font-medium mt-2 transition-all duration-300 border border-white/20 ${isMenuOpen ? "animate-in slide-in-from-bottom-2" : ""}`}
                style={{ animationDelay: "400ms" }}
              >
                <Link href="/contact" onClick={() => setIsMenuOpen(false)}>
                Reach Out
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
