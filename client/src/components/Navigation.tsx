import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface NavigationProps {
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  toggleCart: () => void;
}

export default function Navigation({ currentSlide, setCurrentSlide, toggleCart }: NavigationProps) {
  const { state } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", slide: 0 },
    { name: "Products", slide: 1 },
    { name: "About", slide: 2 },
    { name: "Contact", slide: 3 },
    { name: "Admin", slide: 4 },
  ];

  const handleNavClick = (slide: number) => {
    setCurrentSlide(slide);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-arduino-blue-950/90 backdrop-blur-md border-b border-arduino-blue-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-arduino-blue-400 to-arduino-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z"/>
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2z" clipRule="evenodd"/>
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">ArduinoMart</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setCurrentSlide(item.slide)}
                className={`transition-colors ${
                  currentSlide === item.slide
                    ? "text-white"
                    : "text-arduino-blue-200 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-arduino-blue-200 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-arduino-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {state.itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-arduino-blue-200 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-arduino-blue-900/95 backdrop-blur-md rounded-lg mt-2 mb-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.slide)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentSlide === item.slide
                      ? "text-white bg-arduino-blue-700"
                      : "text-arduino-blue-200 hover:text-white hover:bg-arduino-blue-800"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
