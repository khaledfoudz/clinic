import { useState } from "react";
import { Plus, Trash2, User, PawPrint, Stethoscope, ClipboardList, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PetForm {
  id: number;
  birthdate: Date | undefined;
  followUpDate: Date | undefined;
}

const Index = () => {
  const [pets, setPets] = useState<PetForm[]>([{ id: 1, birthdate: undefined, followUpDate: undefined }]);
  const [nextId, setNextId] = useState(2);

  const addPet = () => {
    setPets([...pets, { id: nextId, birthdate: undefined, followUpDate: undefined }]);
    setNextId(nextId + 1);
  };

  const removePet = (id: number) => {
    if (pets.length > 1) setPets(pets.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-primary-foreground" size={28} />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground">Patient Registration</h1>
              <p className="text-primary-foreground/70 text-sm mt-0.5">Enter pet and owner details for the visit</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Owner Information */}
        <Card className="mb-6 border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              Owner Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Owner Name</Label>
                <Input placeholder="e.g. Ahmed Mohamed" />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input placeholder="e.g. +20 100 123 4567" type="tel" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input placeholder="e.g. 15 El-Tahrir St, Cairo" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pet Sections */}
        {pets.map((pet, index) => (
          <Card key={pet.id} className="mb-6 border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-serif">
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <PawPrint size={16} className="text-accent" />
                  </div>
                  Pet {pets.length > 1 ? `#${index + 1}` : "Information"}
                </CardTitle>
                {pets.length > 1 && (
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removePet(pet.id)}>
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Details */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <PawPrint size={14} /> Basic Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Pet Name</Label>
                    <Input placeholder="e.g. Buddy" />
                  </div>
                  <div className="space-y-2">
                    <Label>Birthdate</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !pet.birthdate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pet.birthdate ? format(pet.birthdate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={pet.birthdate} onSelect={() => {}} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cat">🐱 Cat</SelectItem>
                        <SelectItem value="dog">🐶 Dog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Spayed / Neutered</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Medical History */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Stethoscope size={14} /> Medical History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Disease History</Label>
                    <Textarea placeholder="Previous diseases, chronic conditions..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vaccination History</Label>
                    <Textarea placeholder="Vaccines administered, dates..." rows={3} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Visit Details */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ClipboardList size={14} /> Today's Visit
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>What was done today</Label>
                    <Textarea placeholder="Examination, procedures performed..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Diagnosis</Label>
                    <Textarea placeholder="Diagnosis details..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Treatment</Label>
                    <Textarea placeholder="Prescribed treatment, medications..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Follow-up Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !pet.followUpDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pet.followUpDate ? format(pet.followUpDate, "PPP") : "Pick follow-up date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={pet.followUpDate} onSelect={() => {}} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Pet */}
        <div className="mb-6">
          <Button variant="outline" onClick={addPet} className="w-full border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 py-6 text-base">
            <Plus size={20} className="mr-2" /> Add Another Pet for Same Owner
          </Button>
        </div>

        {/* Submit */}
        <div className="flex justify-end mb-12">
          <Button onClick={() => toast.success("Patient record saved successfully!")} size="lg" className="rounded-full px-10 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
            Save Patient Record
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
