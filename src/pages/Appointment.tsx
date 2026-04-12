import { useState } from "react";
import { CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

const Appointment = () => {
  const [submitted, setSubmitted] = useState(false);
  const [date, setDate] = useState<Date>();

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full text-center border-border">
          <CardContent className="p-10">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={36} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Appointment Booked!</h2>
            <p className="text-muted-foreground mb-6">Thank you! We'll confirm your appointment shortly via phone.</p>
            <Button onClick={() => setSubmitted(false)} className="rounded-full">Book Another</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-bold text-primary-foreground mb-3">Book an Appointment</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Schedule a visit for your pet quickly and easily.</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-foreground">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Pet Name</Label>
                <Input placeholder="e.g. Buddy" />
              </div>
              <div className="space-y-2">
                <Label>Owner Name</Label>
                <Input placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="+20 1xx xxx xxxx" type="tel" />
              </div>
              <div className="space-y-2">
                <Label>Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea placeholder="Any additional information about your pet's condition..." rows={3} />
              </div>
              <Button onClick={() => setSubmitted(true)} className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Appointment;
