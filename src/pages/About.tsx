import { Heart, Shield, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import vet1 from "@/assets/vet-1.jpg";

const values = [
  { icon: Heart, title: "Compassion", desc: "We treat every pet as our own, with love and care." },
  { icon: Shield, title: "Trust", desc: "Transparent, honest, and reliable veterinary services." },
  { icon: Award, title: "Excellence", desc: "Modern equipment and continuous professional development." },
];

const team = [
  { name: "Dr. Mohamed Fouda", role: "Founder & Lead Veterinarian", img: vet1 },
];

const About = () => (
  <div>
    <section className="bg-primary py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-serif font-bold text-primary-foreground mb-3">About Pet Medic</h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">Dedicated to providing the best veterinary care since 2015.</p>
      </div>
    </section>

    <section className="py-20 bg-card">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-6 text-center">Our Story</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Pet Medic was founded by Dr. Mohamed Fouda with a simple mission: to make quality veterinary care accessible and compassionate. What started as a small clinic has grown into a trusted healthcare center for pets across the region.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          We believe every pet deserves the best medical attention, and we work tirelessly to ensure our facilities, staff, and practices meet the highest standards of veterinary medicine.
        </p>
      </div>
    </section>

    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-12 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v) => (
            <Card key={v.title} className="border-border bg-card text-center">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-clinic-red-light flex items-center justify-center mx-auto mb-4">
                  <v.icon size={28} className="text-clinic-red" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2 font-sans">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-12 text-center">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {team.map((t) => (
            <div key={t.name} className="text-center">
              <img src={t.img} alt={t.name} loading="lazy" width={512} height={512} className="w-40 h-40 rounded-full object-cover mx-auto mb-4 shadow-md" />
              <h3 className="font-semibold text-foreground font-sans">{t.name}</h3>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default About;
