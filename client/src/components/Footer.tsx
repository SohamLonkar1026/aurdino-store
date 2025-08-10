interface FooterProps {
  setCurrentSlide?: (slide: number) => void;
}

export default function Footer({ setCurrentSlide }: FooterProps) {
  return (
    <footer className="bg-arduino-blue-950 border-t border-arduino-blue-800/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-arduino-blue-400 to-arduino-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z"/>
                  <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">ArduinoMart</h3>
            </div>
            <p className="text-arduino-blue-300 mb-4">
              A VIT-based startup providing affordable Arduino components and kits for students and makers. 
              Building the future, one project at a time.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-arduino-blue-400">📱 Add a valid phone number so the delivery person can contact you</p>
              <p className="text-sm text-arduino-blue-400">📱 WhatsApp: +91 9049235983</p>
              <p className="text-sm text-arduino-blue-400">✉️ Email: arduinomartseller@gmail.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(0);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm block text-left w-full cursor-pointer"
                >
                  Arduino Starter Kit
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(1);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm block text-left w-full cursor-pointer"
                >
                  All Components
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(0);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm block text-left w-full cursor-pointer"
                >
                  Project Ideas
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(2);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm block text-left w-full cursor-pointer"
                >
                  Getting Started
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(3);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm block text-left w-full cursor-pointer"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Policies</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(7);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm text-left w-full cursor-pointer"
                >
                  Shipping Policy
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(7);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm text-left w-full cursor-pointer"
                >
                  Return Policy
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(7);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm text-left w-full cursor-pointer"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(7);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm text-left w-full cursor-pointer"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-arduino-blue-800/30 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-arduino-blue-400 mb-4 sm:mb-0">
              © 2024 ArduinoMart. All rights reserved. Made with ❤️ by VIT students.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <span className="text-sm text-arduino-blue-400">🚚 Orders handed over in college campus by our team</span>
              <span className="text-sm text-arduino-blue-400">💳 Cash on delivery available</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}