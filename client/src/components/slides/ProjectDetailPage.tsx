import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Clock, Zap, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProjectDetailPageProps {
  setCurrentSlide: (slide: number) => void;
  projectId?: number;
}

const arduinoProjects = [
  {
    id: 1,
    title: "Smart Home System",
    icon: "🏠",
    description: "Control lights, fans, and appliances remotely with your smartphone",
    longDescription: "Transform your home into a smart home with this comprehensive automation system. Control your lights, fans, and appliances from anywhere using your smartphone. Monitor temperature and humidity in real-time, and set up automated schedules for energy efficiency.",
    components: ["Arduino Uno", "ESP8266 WiFi Module", "Relay Module", "DHT22 Sensor", "LED Strip", "Breadboard", "Jumper Wires"],
    difficulty: "Intermediate",
    timeRequired: "4-6 hours",
    price: "₹2,500",
    features: ["WiFi Control", "Temperature Monitoring", "Automated Lighting", "Mobile App Integration"],
    estimatedCost: 2500,
    category: "Home Automation",
    skillLevel: "Intermediate",
    tools: ["Soldering Iron", "Wire Stripper", "Multimeter"],
    instructions: "Step-by-step guide with circuit diagrams and code examples"
  },
  {
    id: 2,
    title: "Robotic Car",
    icon: "🤖",
    description: "Build an autonomous driving robot car with obstacle avoidance",
    longDescription: "Create your own autonomous robot car that can navigate around obstacles, follow lines, and be controlled remotely. This project teaches advanced robotics concepts including sensor integration, motor control, and autonomous navigation algorithms.",
    components: ["Arduino Uno", "L293D Motor Driver", "Ultrasonic Sensor", "DC Motors (4x)", "Wheels", "Chassis", "Battery Pack", "Breadboard"],
    difficulty: "Advanced",
    timeRequired: "6-8 hours",
    price: "₹3,200",
    features: ["Obstacle Avoidance", "Line Following", "Remote Control", "Autonomous Mode"],
    estimatedCost: 3200,
    category: "Robotics",
    skillLevel: "Advanced",
    tools: ["Screwdriver Set", "Wire Cutter", "Battery Charger"],
    instructions: "Complete assembly guide with programming tutorials"
  },
  {
    id: 3,
    title: "Weather Station",
    icon: "🌤️",
    description: "Monitor temperature, humidity, and atmospheric pressure",
    longDescription: "Build your own weather monitoring station that tracks temperature, humidity, and atmospheric pressure. Display real-time data on an LCD screen and log environmental conditions for analysis. Perfect for learning about sensors and data logging.",
    components: ["Arduino Nano", "LCD1602 Display", "DHT22 Sensor", "BMP180 Sensor", "Breadboard", "Jumper Wires", "9V Battery"],
    difficulty: "Beginner",
    timeRequired: "2-3 hours",
    price: "₹1,800",
    features: ["Real-time Monitoring", "Data Logging", "LCD Display", "Battery Powered"],
    estimatedCost: 1800,
    category: "Environmental Monitoring",
    skillLevel: "Beginner",
    tools: ["Breadboard", "Jumper Wires", "9V Battery Connector"],
    instructions: "Easy-to-follow tutorial with code explanations"
  },
  {
    id: 4,
    title: "LED Music Visualizer",
    icon: "🎵",
    description: "Create stunning light patterns that respond to music and sound",
    longDescription: "Turn your room into a disco with this music-responsive LED visualizer! The system analyzes audio input and creates beautiful light patterns that sync with the beat. Perfect for parties or as a cool room decoration.",
    components: ["Arduino Uno", "RGB LED Strip", "Microphone Module", "Amplifier Circuit", "Breadboard", "Jumper Wires", "Power Supply"],
    difficulty: "Intermediate",
    timeRequired: "3-4 hours",
    price: "₹2,100",
    features: ["Music Responsive", "Color Changing", "Pattern Modes", "Adjustable Sensitivity"],
    estimatedCost: 2100,
    category: "Audio & Lighting",
    skillLevel: "Intermediate",
    tools: ["Wire Stripper", "Heat Shrink Tubing", "Audio Cable"],
    instructions: "Audio circuit design and LED programming guide"
  },
  {
    id: 5,
    title: "Smart Plant Monitor",
    icon: "🌱",
    description: "Automated plant care system with soil moisture and light monitoring",
    longDescription: "Never let your plants die again! This smart monitoring system automatically waters your plants when needed, monitors light levels, and alerts you about plant health. Perfect for busy people or plant enthusiasts.",
    components: ["Arduino Nano", "Soil Moisture Sensor", "Light Sensor", "Water Pump", "Relay Module", "LCD Display", "Breadboard", "Tubing"],
    difficulty: "Beginner",
    timeRequired: "2-3 hours",
    price: "₹1,900",
    features: ["Auto Watering", "Light Monitoring", "Soil Analysis", "Plant Health Alerts"],
    estimatedCost: 1900,
    category: "Agriculture & IoT",
    skillLevel: "Beginner",
    tools: ["Water Container", "Plant Pot", "Tubing Cutter"],
    instructions: "Complete setup guide with plant care tips"
  },
  {
    id: 6,
    title: "Digital Clock with Alarm",
    icon: "⏰",
    description: "Build a precise digital clock with multiple alarms and time features",
    longDescription: "Create your own precise digital clock with multiple alarm functions! This project features a real-time clock module for accurate timekeeping, multiple alarm settings, temperature display, and battery backup. Perfect for learning about time management and LCD interfacing.",
    components: ["Arduino Uno", "DS3231 RTC Module", "16x2 LCD Display", "Buzzer", "Push Buttons (4x)", "Breadboard", "Jumper Wires", "9V Battery"],
    difficulty: "Intermediate",
    timeRequired: "3-4 hours",
    price: "₹2,300",
    features: ["Real-time Clock", "Multiple Alarms", "Temperature Display", "Battery Backup", "12/24 Hour Format"],
    estimatedCost: 2300,
    category: "Time & Display",
    skillLevel: "Intermediate",
    tools: ["Soldering Iron", "Wire Stripper", "Enclosure Box"],
    instructions: "Step-by-step clock assembly and programming guide"
  }
];

export default function ProjectDetailPage({ setCurrentSlide, projectId }: ProjectDetailPageProps) {
  const { addItem } = useCart();
  
  // Find the project by ID, default to first project if no ID provided
  const project = arduinoProjects.find(p => p.id === projectId) || arduinoProjects[0];

  // Scroll to top when component mounts
  React.useEffect(() => {
    // Immediate scroll to top
    window.scrollTo(0, 0);
    
    // Also try smooth scroll after a small delay to ensure it works
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, [projectId]);

  const handleAddAllComponents = () => {
    // Add all components to cart (simplified - in real app you'd add each component individually)
    addItem({
      id: `project-${project.id}-kit`,
      name: `${project.title} - Complete Kit`,
      price: project.estimatedCost,
    }, 1);
  };

  const handleBackToHome = () => {
    setCurrentSlide(0);
  };

  const handleGoToProducts = () => {
    setCurrentSlide(1);
  };

  return (
    <div className="bg-arduino-gradient h-full flex flex-col">
      <section className="pt-20 flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-arduino-blue-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl sm:text-5xl lg:text-6xl">{project.icon}</div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{project.title}</h1>
              <p className="text-arduino-blue-300 text-lg">{project.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-arduino-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-arduino-blue-700/30"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Project Overview</h2>
              <p className="text-arduino-blue-200 leading-relaxed">{project.longDescription}</p>
            </motion.div>

            {/* Components List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-arduino-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-arduino-blue-700/30"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Package className="w-6 h-6" />
                Required Components
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.components.map((component, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-arduino-blue-700/30 rounded-lg p-3 border border-arduino-blue-600/30 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-arduino-blue-400 rounded-full"></div>
                    <span className="text-arduino-blue-200">{component}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-arduino-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-arduino-blue-700/30"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-arduino-blue-700/30 rounded-lg p-3 text-center"
                  >
                    <span className="text-arduino-blue-200 font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-arduino-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-arduino-blue-700/30 lg:sticky lg:top-24"
            >
              <h3 className="text-xl font-bold text-white mb-4">Project Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-arduino-blue-400" />
                  <div>
                    <div className="text-arduino-blue-400 text-sm">Time Required</div>
                    <div className="text-white font-medium">{project.timeRequired}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-arduino-blue-400" />
                  <div>
                    <div className="text-arduino-blue-400 text-sm">Difficulty</div>
                    <div className={`font-medium ${
                      project.difficulty === 'Beginner' ? 'text-green-400' :
                      project.difficulty === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{project.difficulty}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-arduino-blue-400" />
                  <div>
                    <div className="text-arduino-blue-400 text-sm">Category</div>
                    <div className="text-white font-medium">{project.category}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-arduino-blue-700/30">
                  <div className="text-arduino-blue-400 text-sm mb-2">Estimated Cost</div>
                  <div className="text-3xl font-bold text-arduino-blue-300">{project.price}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-6">
                <button
                  onClick={handleAddAllComponents}
                  className="w-full bg-gradient-to-r from-arduino-blue-500 to-arduino-blue-600 text-white py-3 rounded-lg font-medium hover:from-arduino-blue-600 hover:to-arduino-blue-700 transition-all flex items-center justify-center gap-2 border border-white"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add Complete Kit
                </button>
                
                <button
                  onClick={handleGoToProducts}
                  className="w-full bg-arduino-blue-700/50 text-arduino-blue-300 py-3 rounded-lg font-medium hover:bg-arduino-blue-700/70 transition-all border border-white flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Shop Individual Components
                </button>
              </div>
            </motion.div>

            {/* Tools Required */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-arduino-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-arduino-blue-700/30"
            >
              <h3 className="text-lg font-bold text-white mb-4">Tools Required</h3>
              <div className="space-y-2">
                {project.tools.map((tool, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-arduino-blue-400 rounded-full"></div>
                    <span className="text-arduino-blue-200 text-sm">{tool}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      </section>
    </div>
  );
} 