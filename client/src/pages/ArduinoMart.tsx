import React, { useState } from "react";
import Navigation from "../components/Navigation";
import Cart from "../components/Cart";
import HomePage from "../components/slides/HomePage";
import ProductsPage from "../components/slides/ProductsPage";
import AboutPage from "../components/slides/AboutPage";
import ContactPage from "../components/slides/ContactPage";
import AdminPage from "../components/slides/AdminPage";
import CheckoutPage from "../components/slides/CheckoutPage";
import ProjectDetailPage from "../components/slides/ProjectDetailPage";
import PoliciesPage from "../components/slides/PoliciesPage";
import Footer from "../components/Footer";

export default function ArduinoMart() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Enhanced scroll to top functionality - works for all slide changes
  React.useEffect(() => {
    // Multiple approaches to ensure scroll to top works everywhere
    const scrollToTop = () => {
      // Method 1: Window scroll
      window.scrollTo(0, 0);
      
      // Method 2: Document element scroll
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Method 3: Find active slide and scroll it
      const activeSlide = document.querySelector('.slide.active');
      if (activeSlide) {
        activeSlide.scrollTop = 0;
      }
      
      // Method 4: Force scroll on main container
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTop = 0;
      }
    };
    
    // Execute immediately
    scrollToTop();
    
    // Execute again after a short delay to handle any async rendering
    const timeoutId = setTimeout(scrollToTop, 100);
    
    // Execute one more time to be absolutely sure
    const timeoutId2 = setTimeout(scrollToTop, 300);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, [currentSlide]);
  
  // Enhanced slide change function
  const handleSlideChange = React.useCallback((slideIndex: number) => {
    // Update slide
    setCurrentSlide(slideIndex);
  }, []);

  const slides = [
    { component: HomePage, name: "Home" },
    { component: ProductsPage, name: "Products" },
    { component: AboutPage, name: "About" },
    { component: ContactPage, name: "Contact" },
    { component: AdminPage, name: "Admin" },
    { component: CheckoutPage, name: "Checkout" },
    { component: ProjectDetailPage, name: "Project Detail" },
    { component: PoliciesPage, name: "Policies" },
  ];

  return (
    <div className="font-sans bg-arduino-blue-950 text-white overflow-hidden h-screen flex flex-col">
      <Navigation 
        currentSlide={currentSlide} 
        setCurrentSlide={handleSlideChange}
        toggleCart={() => setIsCartOpen(!isCartOpen)}
      />
      
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => handleSlideChange(5)}
      />
      
      <main className="flex-1 overflow-hidden">
        <div className="slide-container flex">
          {slides.map((slide, index) => {
            const SlideComponent = slide.component;
            return (
              <div
                key={index}
                className={`slide ${index === currentSlide ? 'active' : 'inactive'} flex flex-col`}
              >
                {index === 0 ? (
                  <SlideComponent setCurrentSlide={handleSlideChange} setSelectedProjectId={setSelectedProjectId} />
                ) : index === 6 ? (
                  <SlideComponent setCurrentSlide={handleSlideChange} projectId={selectedProjectId || undefined} />
                ) : index === 7 ? (
                  <SlideComponent setCurrentSlide={handleSlideChange} activePolicy="shipping" />
                ) : (
                  <SlideComponent setCurrentSlide={handleSlideChange} />
                )}
              </div>
            );
          })}
        </div>
      </main>
      <Footer setCurrentSlide={handleSlideChange} isHomePage={currentSlide === 0} />
    </div>
  );
}
