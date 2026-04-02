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

  // Enhanced scroll to top functionality
  React.useEffect(() => {
    // Scroll to top immediately when slide changes
    window.scrollTo(0, 0);
    
    // Also try smooth scroll after a small delay to ensure it works on all browsers
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
    
    // Force scroll to top for mobile browsers
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    return () => clearTimeout(timeoutId);
  }, [currentSlide]);
  
  // Enhanced slide change function with scroll to top
  const handleSlideChange = React.useCallback((slideIndex: number) => {
    // Immediate scroll to top
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
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
    <div className="font-sans bg-arduino-blue-950 text-white overflow-x-hidden flex flex-col min-h-screen">
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
      
      <main className="flex-1 min-h-0">
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
