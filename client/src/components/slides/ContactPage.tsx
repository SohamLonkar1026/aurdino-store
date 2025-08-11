import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


interface ContactPageProps {
  setCurrentSlide: (slide: number) => void;
}

export default function ContactPage({ setCurrentSlide }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  
  const { toast } = useToast();

  const contactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/contacts", data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thank you for your message! We will get back to you soon.",
      });
      setFormData({ name: "", email: "", message: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-arduino-blue-950">
      <section className="pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-arduino-blue-200">Have questions about our products or need help with your Arduino project?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-arduino-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📱</span>
                </div>
                <div>
                  <p className="font-semibold">WhatsApp</p>
                  <p className="text-arduino-blue-300">+91 9049235983</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-arduino-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✉️</span>
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-arduino-blue-300">arduinomartseller@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-arduino-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📍</span>
                </div>
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-arduino-blue-300">VIT Campus, Pune</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-arduino-blue-800 border-arduino-blue-700 text-white placeholder-arduino-blue-300"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-arduino-blue-800 border-arduino-blue-700 text-white placeholder-arduino-blue-300"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="bg-arduino-blue-800 border-arduino-blue-700 text-white placeholder-arduino-blue-300 resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <Button
                type="submit"
                disabled={contactMutation.isPending}
                className="w-full bg-gradient-to-r from-arduino-blue-500 to-arduino-blue-600 hover:from-arduino-blue-600 hover:to-arduino-blue-700"
              >
                {contactMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      </section>
      
      
    </div>
  );
}
