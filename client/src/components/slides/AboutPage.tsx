import { products } from "../../lib/products";
import Footer from "../Footer";

interface AboutPageProps {
  setCurrentSlide: (slide: number) => void;
}

export default function AboutPage({ setCurrentSlide }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-arduino-blue-950 pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Arduino & ArduinoMart</h1>
          <p className="text-xl text-arduino-blue-200 max-w-3xl mx-auto">
            Arduino is an open-source electronics platform that makes it easy to create interactive projects. 
            Our VIT-based startup is passionate about making Arduino accessible to everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-6">What is Arduino?</h2>
            <div className="space-y-4 text-arduino-blue-200">
              <p>Arduino is a microcontroller platform that allows you to build interactive electronic projects easily. It's perfect for beginners and professionals alike.</p>
              <p>With Arduino, you can:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Control LEDs, motors, and sensors</li>
                <li>Build robots and automation systems</li>
                <li>Create IoT (Internet of Things) devices</li>
                <li>Learn programming and electronics</li>
              </ul>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-arduino-blue-200">
              <p>ArduinoMart started as a passion project by VIT students who wanted to make Arduino components more accessible and affordable.</p>
              <p>We focus on:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Beginner-friendly products and guides</li>
                <li>Affordable pricing without compromising quality</li>
                <li>Personal support for your projects</li>
                <li>Building a community of makers</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-center mb-12">Components in Our Starter Kit (43 components)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-arduino-blue-800/30 backdrop-blur-sm rounded-lg p-4 border border-arduino-blue-700/30 text-center">
                <div className="text-2xl mb-2">{product.icon}</div>
                <h4 className="font-medium text-xs text-white mb-1">{product.name}</h4>
                <p className="text-xs text-arduino-blue-300">₹{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer setCurrentSlide={setCurrentSlide} />
    </div>
  );
}
