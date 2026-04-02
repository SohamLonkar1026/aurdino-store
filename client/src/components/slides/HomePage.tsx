import React, { useState } from "react";
import { useCart } from "@/context/CartContext";

import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Clock, Zap } from "lucide-react";

interface HomePageProps {
  setCurrentSlide: (slide: number) => void;
  setSelectedProjectId?: (id: number) => void;
}

export default function HomePage({ setCurrentSlide, setSelectedProjectId }: HomePageProps) {
  const { addItem } = useCart();

  const handleAddStarterKit = () => {
    addItem({
      id: "arduino-starter-kit",
      name: "Arduino Starter Kit",
      price: 1200,
    }, 1);
  };



  const whyChooseUsFeatures = [
    {
      icon: "🌱",
      title: "Small Startup",
      description: "We're just a small startup with big dreams and personal touch."
    },
    {
      icon: "🏭",
      title: "No Warehouse Costs",
      description: "No warehouse means lower overhead and better prices for you."
    },
    {
      icon: "💔",
      title: "Single Admin",
      description: "Admin has no girlfriend - even less money required! 😄"
    },
    {
      icon: "🍻",
      title: "Friday Nights",
      description: "Admin only needs money for Friday night fun!"
    }
  ];

  const arduinoProjects = [
    {
      id: 1,
      title: "Smart Home System",
      icon: "🏠",
      description: "Control lights, fans, and appliances remotely with your smartphone",
      components: ["Arduino Uno", "ESP8266 WiFi Module", "Relay Module", "DHT22 Sensor", "LED Strip", "Breadboard", "Jumper Wires"],
      difficulty: "Intermediate",
      timeRequired: "4-6 hours",
      price: "₹2,500",
      features: ["WiFi Control", "Temperature Monitoring", "Automated Lighting", "Mobile App Integration"]
    },
    {
      id: 2,
      title: "Robotic Car",
      icon: "🤖",
      description: "Build an autonomous driving robot car with obstacle avoidance",
      components: ["Arduino Uno", "L293D Motor Driver", "Ultrasonic Sensor", "DC Motors (4x)", "Wheels", "Chassis", "Battery Pack", "Breadboard"],
      difficulty: "Advanced",
      timeRequired: "6-8 hours",
      price: "₹3,200",
      features: ["Obstacle Avoidance", "Line Following", "Remote Control", "Autonomous Mode"]
    },
    {
      id: 3,
      title: "Weather Station",
      icon: "🌤",
      description: "Monitor temperature, humidity, and atmospheric pressure",
      components: ["Arduino Nano", "LCD1602 Display", "DHT22 Sensor", "BMP180 Sensor", "Breadboard", "Jumper Wires", "9V Battery"],
      difficulty: "Beginner",
      timeRequired: "2-3 hours",
      price: "₹1,800",
      features: ["Real-time Monitoring", "Data Logging", "LCD Display", "Battery Powered"]
    },
    {
      id: 4,
      title: "LED Music Visualizer",
      icon: "🎵",
      description: "Create stunning light patterns that respond to music and sound",
      components: ["Arduino Uno", "RGB LED Strip", "Microphone Module", "Amplifier Circuit", "Breadboard", "Jumper Wires", "Power Supply"],
      difficulty: "Intermediate",
      timeRequired: "3-4 hours",
      price: "₹2,100",
      features: ["Music Responsive", "Color Changing", "Pattern Modes", "Adjustable Sensitivity"]
    },
    {
      id: 5,
      title: "Smart Plant Monitor",
      icon: "🌱",
      description: "Automated plant care system with soil moisture and light monitoring",
      components: ["Arduino Nano", "Soil Moisture Sensor", "Light Sensor", "Water Pump", "Relay Module", "LCD Display", "Breadboard", "Tubing"],
      difficulty: "Beginner",
      timeRequired: "2-3 hours",
      price: "₹1,900",
      features: ["Auto Watering", "Light Monitoring", "Soil Analysis", "Plant Health Alerts"]
    },
    {
      id: 6,
      title: "Digital Clock with Alarm",
      icon: "⏰",
      description: "Build a precise digital clock with multiple alarms and time features",
      components: ["Arduino Uno", "DS3231 RTC Module", "16x2 LCD Display", "Buzzer", "Push Buttons (4x)", "Breadboard", "Jumper Wires", "9V Battery"],
      difficulty: "Intermediate",
      timeRequired: "3-4 hours",
      price: "₹2,300",
      features: ["Real-time Clock", "Multiple Alarms", "Temperature Display", "Battery Backup", "12/24 Hour Format"]
    }
  ];

  return (
    <div className="bg-arduino-gradient relative overflow-hidden">
      <section className="pt-16 sm:pt-20 pb-0">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,.2) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(255,255,255,.1) 2px, transparent 0)`,
            backgroundSize: "100px 100px"
          } as React.CSSProperties}
        />
      </div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
          <div className="text-center mb-8 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-arduino-blue-200 bg-clip-text text-transparent">
              Build Amazing Projects
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              with Arduino
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl mb-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent font-semibold">
              By Soham Lonkar
            </p>
            <p className="text-base sm:text-lg text-arduino-blue-300 max-w-2xl mx-auto px-4">
              Your one-stop shop for Arduino components, kits, and everything you need to bring your electronic projects to life.
            </p>
          </div>

          {/* Featured Product */}
          <div className="max-w-4xl mx-auto mb-12 sm:mb-20">
            <div className="bg-arduino-gradient-card rounded-3xl p-4 sm:p-8 border border-arduino-blue-600/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-arduino-blue-500/10 to-transparent"></div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-gradient-to-br from-arduino-blue-600 to-arduino-blue-800 rounded-xl shadow-lg w-full h-48 sm:h-64 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">📦</div>
                      <h4 className="text-base sm:text-lg font-semibold">Arduino Starter Kit</h4>
                      <p className="text-xs sm:text-sm text-arduino-blue-200">42 Essential Components</p>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">Arduino Starter Kit</h3>
                  <p className="text-arduino-blue-200 mb-4 sm:mb-6 text-base sm:text-lg">Everything you need to get started with Arduino - 42 essential components in one complete package.</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <span className="text-2xl sm:text-4xl font-bold text-arduino-blue-400">₹1,200</span>
                    <span className="text-sm sm:text-lg text-arduino-blue-300 line-through">₹2,000</span>
                    <span className="bg-arduino-blue-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">Save 40%</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={handleAddStarterKit}
                      className="w-full sm:w-auto bg-gradient-to-r from-arduino-blue-500 to-arduino-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg font-medium hover:from-arduino-blue-600 hover:to-arduino-blue-700 transition-all transform hover:scale-105 shadow-lg border-2 border-white/30 hover:border-white/50"
                    >
                      <span className="mr-2">🛒</span>
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => setCurrentSlide(2)}
                      className="w-full sm:w-auto bg-arduino-blue-700/50 hover:bg-arduino-blue-700/70 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg border border-arduino-blue-600/50"
                    >
                      <span className="mr-2">📦</span>
                      See Products in the Kit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="max-w-6xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 px-4">Why Buy From Us Instead of Big Dealers?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {whyChooseUsFeatures.map((feature, index) => (
                <div key={index} className="bg-arduino-blue-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-arduino-blue-700/30 text-center hover:bg-arduino-blue-800/50 transition-all">
                  <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{feature.icon}</div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-arduino-blue-300 text-xs sm:text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Project Showcase */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 px-4">Amazing Arduino Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {arduinoProjects.map((project) => (
                <div key={project.id} className="bg-arduino-blue-800/30 backdrop-blur-sm rounded-xl border border-arduino-blue-700/30 hover:scale-105 transition-transform overflow-hidden">
                  <div className="bg-gradient-to-br from-arduino-blue-700 to-arduino-blue-800 h-48 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">{project.icon}</div>
                      <h4 className="font-semibold">{project.title}</h4>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{project.title}</h3>
                    <p className="text-arduino-blue-300 text-sm mb-3">{project.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-arduino-blue-400">Difficulty:</span>
                        <span className={`font-medium ${
                          project.difficulty === 'Beginner' ? 'text-green-400' :
                          project.difficulty === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'
                        }`}>{project.difficulty}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-arduino-blue-400">Time:</span>
                        <span className="text-arduino-blue-300">{project.timeRequired}</span>
                      </div>
                      <div className="w-full flex flex-col flex-grow p-2 border border-white/20 rounded-md">
                        <span className="font-medium">Components needed:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {project.components.slice(0, 2).map((component, index) => (
                            <span key={index} className="border border-white px-2 py-1 rounded text-xs">
                              {component}
                            </span>
                          ))}
                          {project.components.length > 2 && (
                            <span className="text-arduino-blue-300">+{project.components.length - 2} more</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (setSelectedProjectId) {
                            setSelectedProjectId(project.id);
                            setCurrentSlide(6);
                          }
                        }}
                        className="w-full mt-3 bg-arduino-blue-600 hover:bg-arduino-blue-700 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Package className="w-3 h-3" />
                        View Project Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setCurrentSlide(1)}
              className="mt-6 sm:mt-8 w-full sm:w-auto bg-gradient-to-r from-arduino-blue-500 to-arduino-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg font-medium hover:from-arduino-blue-600 hover:to-arduino-blue-700 transition-all"
            >
              Shop Components Now
            </button>
          </div>
        </div>
      </div>
      </section>
      
      
 </div>
);
}
