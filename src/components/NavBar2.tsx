'use client'
import { useState } from "react";
import { X } from "lucide-react";

const NavBar2 = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMenuOpen(false); // Close the menu after scrolling
    }
  };

  return (
    <div className="top-0  h-16 pt-6 w-full rounded-full" style={{ position: "fixed",zIndex:"99" }}>
      <div className="sm:px-8 w-full">
        <div className="mx-auto w-full max-w-7xl lg:px-8">
          <div className="relative px-4 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-2xl lg:max-w-5xl">
              <div className="relative flex gap-4">
                <div className="flex"></div>

                <div className="flex flex-1 justify-end md:justify-center">
                  <div className="pointer-events-auto md:hidden">
                    <button
                      className={`group flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur backdrop:rounded-full dark:bg-transparent dark:text-zinc-200 dark:ring-white/10 dark:hover:ring-white/20 ${
                        isMenuOpen ? "hidden" : ""
                      }`}
                      type="button"
                      aria-expanded={isMenuOpen}
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                      Menu
                      <svg
                        viewBox="0 0 8 6"
                        aria-hidden="true"
                        className="ml-3 h-auto w-2 stroke-zinc-500 group-hover:stroke-zinc-700 dark:group-hover:stroke-zinc-400"
                      >
                        <path
                          d="M1.75 1.75 4 4.25l2.25-2.5"
                          fill="none"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <nav
                    className={`resp transform duration-300 ease-in-out pointer-events-auto ${
                      isMenuOpen
                        ? "scale-100 opacity-100 backdrop-blur-lg "
                        : "scale-95 opacity-0"
                    } md:scale-100 md:opacity-100 md:block`}
                  >
                    <ul
                      className="bord flex flex-col md:flex-row md:rounded-full bg-white/90 px-3 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-transparent dark:text-zinc-200 dark:ring-white/10"
                    >
                      <X
                        className="relative left-[95%] top-2 md:hidden cursor-pointer"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                      />
                      <li>
                        <span
                          className="relative block px-3 py-2 transition hover-txt cursor-pointer"
                          onClick={() => handleScroll("services")}
                        >
                          What I Offer
                        </span>
                      </li>
                      <li>
                        <span
                          className="relative block px-3 py-2 transition hover-txt cursor-pointer"
                          onClick={() => handleScroll("about")}
                        >
                          Behind the Code
                        </span>
                      </li>
                      <li>
                        <span
                          className="relative block px-3 py-2 transition hover-txt cursor-pointer"
                          onClick={() => handleScroll("contact-form")}
                        >
                          Say Hello
                        </span>
                      </li>
                      <li>
                        <span
                          className="relative block px-3 py-2 transition hover-txt cursor-pointer"
                          onClick={() => handleScroll("contact-bar")}
                        >
                          Stay Connected
                        </span>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar2;