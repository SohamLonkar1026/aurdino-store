import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, RotateCcw, Shield, FileText } from "lucide-react";

interface PoliciesPageProps {
  setCurrentSlide: (slide: number) => void;
  activePolicy?: string;
}

const policies = {
  shipping: {
    title: "Shipping Policy",
    icon: "🚚",
    content: [
      {
        heading: "College Campus Delivery",
        text: "All orders are delivered directly to the VIT college campus. Our team will hand over your order at a designated location within the campus premises."
      },
      {
        heading: "Delivery Time",
        text: "Orders are typically processed within 24-48 hours and delivered to campus within 3-5 business days. You'll receive a notification when your order is ready for pickup."
      },
      {
        heading: "Delivery Process",
        text: "Once your order is ready, our delivery team will contact you via the phone number provided during checkout. Please ensure you're available at the designated pickup location."
      },
      {
        heading: "Order Tracking",
        text: "You can track your order status through your account or by contacting our support team. We'll keep you updated at every step of the delivery process."
      }
    ]
  },
  return: {
    title: "Return Policy",
    icon: "🔄",
    content: [
      {
        heading: "Return Window",
        text: "We accept returns within 7 days of delivery for unused items in their original packaging. Damaged or defective items can be returned within 30 days."
      },
      {
        heading: "Return Process",
        text: "To initiate a return, contact our support team with your order number and reason for return. We'll provide you with return instructions and arrange pickup from campus."
      },
      {
        heading: "Refund Policy",
        text: "Refunds are processed within 5-7 business days after we receive and inspect the returned items. Refunds will be issued to the original payment method."
      },
      {
        heading: "Non-Returnable Items",
        text: "Custom kits, opened software packages, and items marked as non-returnable cannot be returned. Please check product descriptions for specific return policies."
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    icon: "🔒",
    content: [
      {
        heading: "Information We Collect",
        text: "We collect information you provide during checkout including name, phone number, class/branch, and order details. We do not store payment information."
      },
      {
        heading: "How We Use Your Information",
        text: "Your information is used solely for order processing, delivery coordination, and customer support. We do not share your personal information with third parties."
      },
      {
        heading: "Data Security",
        text: "We implement appropriate security measures to protect your personal information. All data is stored securely and accessed only by authorized personnel."
      },
      {
        heading: "Your Rights",
        text: "You have the right to access, update, or delete your personal information. Contact us if you have any questions about your data or privacy rights."
      }
    ]
  },
  terms: {
    title: "Terms of Service",
    icon: "📋",
    content: [
      {
        heading: "Order Acceptance",
        text: "All orders are subject to acceptance and availability. We reserve the right to refuse service to anyone for any reason at any time."
      },
      {
        heading: "Pricing and Payment",
        text: "Prices are subject to change without notice. Payment is due at the time of order placement. We accept cash on delivery for campus orders."
      },
      {
        heading: "Limitation of Liability",
        text: "ArduinoMart is not liable for any damages arising from the use of our products. Users are responsible for proper handling and usage of electronic components."
      },
      {
        heading: "Governing Law",
        text: "These terms are governed by the laws of India. Any disputes will be resolved through arbitration in accordance with Indian law."
      }
    ]
  }
};

export default function PoliciesPage({ setCurrentSlide, activePolicy = "shipping" }: PoliciesPageProps) {
  const policy = policies[activePolicy as keyof typeof policies] || policies.shipping;

  const handleBackToHome = () => {
    setCurrentSlide(0);
  };

  const handlePolicyChange = (policyKey: string) => {
    // In a real app, you'd update the URL or state to change the policy
    // For now, we'll just scroll to the top
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-arduino-gradient">
      <section className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

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
              <div className="text-4xl">{policy.icon}</div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{policy.title}</h1>
                <p className="text-arduino-blue-300 text-lg">Important information about our services</p>
              </div>
            </div>
          </div>

          {/* Policy Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-arduino-blue-800/30 backdrop-blur-sm rounded-xl p-4 mb-8 border border-arduino-blue-700/30"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(policies).map(([key, policyData]) => (
                <button
                  key={key}
                  onClick={() => handlePolicyChange(key)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    key === activePolicy
                      ? 'bg-arduino-blue-600 text-white'
                      : 'bg-arduino-blue-700/30 text-arduino-blue-300 hover:bg-arduino-blue-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <span className="text-lg">{policyData.icon}</span>
                    <span className="block text-xs mt-1 sm:text-sm sm:mt-0">{policyData.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Policy Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {policy.content.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-arduino-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-arduino-blue-700/30"
              >
                <h3 className="text-xl font-bold text-white mb-3">{section.heading}</h3>
                <p className="text-arduino-blue-200 leading-relaxed">{section.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-arduino-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-arduino-blue-700/30"
          >
            <h3 className="text-xl font-bold text-white mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-arduino-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">📱</span>
                </div>
                <div>
                  <p className="text-arduino-blue-400 text-sm">WhatsApp Support</p>
                  <p className="text-white font-medium">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-arduino-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">✉️</span>
                </div>
                <div>
                  <p className="text-arduino-blue-400 text-sm">Email Support</p>
                  <p className="text-white font-medium">support@arduinomart.com</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}