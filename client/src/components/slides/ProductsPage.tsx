import ProductCard from "../ProductCard";
import { products } from "../../lib/products";
import { useCart } from "../../context/CartContext";


interface ProductsPageProps {
  setCurrentSlide: (slide: number) => void;
}

export default function ProductsPage({ setCurrentSlide }: ProductsPageProps) {
  const { addItem } = useCart();

  const handleAddStarterKit = () => {
    addItem({
      id: "arduino-starter-kit",
      name: "Arduino Starter Kit",
      price: 1200,
    }, 1);
  };

  return (
    <div className="bg-arduino-blue-950">
      <section className="pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4">Arduino Components Store</h1>
          <p className="text-base sm:text-xl text-arduino-blue-200 px-4">Choose from our carefully curated selection of Arduino parts</p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {/* Starter Kit - Featured */}
          <div className="bg-gradient-to-br from-arduino-blue-800 to-arduino-blue-700 rounded-xl p-6 border-2 border-arduino-blue-500 relative overflow-hidden transform hover:scale-105 transition-all shadow-xl">
            <div className="absolute top-2 right-2 bg-arduino-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">BUNDLE</div>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-arduino-blue-400 to-arduino-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Arduino Starter Kit</h3>
              <p className="text-sm text-arduino-blue-200 mb-3">Complete kit with all 42 components</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl font-bold text-arduino-blue-300">₹1,200</span>
                <span className="text-sm text-arduino-blue-400 line-through">₹2,000</span>
              </div>
            </div>
            <button 
              onClick={handleAddStarterKit}
              className="w-full bg-arduino-blue-500 text-white py-2 rounded-lg font-medium hover:bg-arduino-blue-600 transition-colors"
            >
              🛒 Add to Cart
            </button>
          </div>

          {/* Individual Products */}
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      </section>
      
      
    </div>
  );
}
