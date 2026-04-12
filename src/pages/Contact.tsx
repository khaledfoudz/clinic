import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Contact = () => (
  <div>
    <section className="bg-primary py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-serif font-bold text-primary-foreground mb-3">Contact Us</h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">We'd love to hear from you. Reach out anytime.</p>
      </div>
    </section>

    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-lg">
        <h3 className="text-2xl font-serif font-bold text-foreground mb-8 text-center">Get in Touch</h3>
        <div className="space-y-6">
          {[
            { icon: Phone, label: "Phone", value: "+20 123 456 789" },
            { icon: Mail, label: "Email", value: "info@petmedic.com" },
            { icon: MapPin, label: "Address", value: "123 Veterinary St, Cairo, Egypt" },
            { icon: Clock, label: "Working Hours", value: "Sat–Thu: 9AM – 6PM" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <item.icon size={22} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-muted-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Contact;
