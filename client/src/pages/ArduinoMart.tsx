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

export default function ArduinoMart() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Scroll to top whenever the slide changes
  React.useEffect(() => {
    // Immediate scroll to top for all page changes
    window.scrollTo(0, 0);
  }, [currentSlide]);

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
    <div className="font-sans bg-arduino-blue-950 text-white overflow-x-hidden min-h-screen flex flex-col">
      <Navigation 
        currentSlide={currentSlide} 
        setCurrentSlide={setCurrentSlide}
        toggleCart={() => setIsCartOpen(!isCartOpen)}
      />
      
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => setCurrentSlide(5)}
      />
      
      <div className="slide-container flex-grow">
        {slides.map((slide, index) => {
          const SlideComponent = slide.component;
          return (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : 'inactive'}`}
            >
              {index === 0 ? (
                <SlideComponent setCurrentSlide={setCurrentSlide} setSelectedProjectId={setSelectedProjectId} />
              ) : index === 6 ? (
                <SlideComponent setCurrentSlide={setCurrentSlide} projectId={selectedProjectId || undefined} />
              ) : index === 7 ? (
                <SlideComponent setCurrentSlide={setCurrentSlide} activePolicy="shipping" />
              ) : (
                <SlideComponent setCurrentSlide={setCurrentSlide} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
