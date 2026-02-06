interface FooterProps {
  setCurrentSlide?: (slide: number) => void;
  isHomePage?: boolean;
}

export default function Footer({ setCurrentSlide, isHomePage = false }: FooterProps) {
  return (
    <footer className="bg-arduino-blue-950 border-t border-arduino-blue-800/30 mt-auto mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">ArduinoMart</h3>
            <p className="text-sm text-arduino-blue-400 leading-relaxed">
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
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(0);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(1);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm"
                >
                  Products
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(2);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(3);
                  }}
                  className="text-arduino-blue-300 hover:text-white transition-colors text-sm"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Policies</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide?.(4);
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
                    setCurrentSlide?.(5);
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
                    setCurrentSlide?.(6);
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
        {!isHomePage && (
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
        )}
      </div>
    </footer>
  );
}
