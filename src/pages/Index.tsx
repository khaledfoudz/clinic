import { useState } from "react";
import { Plus, Trash2, User, PawPrint, Stethoscope, ClipboardList, CalendarIcon, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarWithDropdowns as Calendar } from "@/components/ui/calendar-with-dropdowns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PetForm {
  id: number;
  pet_name: string;
  birth_date: Date | undefined;
  age: string;
  type: string;
  gender: string;
  spayed_neutered: string;
  weight_kg: string;
  disease_history: string;
  vaccination_history: string;
  diagnostics_file: File | null;
  diagnostics_filename: string;
  what_was_done_today: string;
  diagnosis: string;
  treatment: string;
  today_visit_file: File | null;
  today_visit_filename: string;
  follow_up_date: Date | undefined;
}

interface OwnerForm {
  owner_name: string;
  mobile_number: string;
  address: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const calculateAge = (birthDate: Date | undefined): string => {
  if (!birthDate) return "";
  const today = new Date();
  const birth = new Date(birthDate);
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else if (months === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
  }
};

const defaultPet = (id: number): PetForm => ({
  id,
  pet_name: "",
  birth_date: undefined,
  age: "",
  type: "",
  gender: "",
  spayed_neutered: "",
  weight_kg: "",
  disease_history: "",
  vaccination_history: "",
  diagnostics_file: null,
  diagnostics_filename: "",
  what_was_done_today: "",
  diagnosis: "",
  treatment: "",
  today_visit_file: null,
  today_visit_filename: "",
  follow_up_date: undefined,
});

// ─── Component ────────────────────────────────────────────────────────────────

const Index = () => {
  const [owner, setOwner] = useState<OwnerForm>({
    owner_name: "",
    mobile_number: "",
    address: "",
  });

  const [pets, setPets] = useState<PetForm[]>([defaultPet(1)]);
  const [nextId, setNextId] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Owner helpers ──────────────────────────────────────────────────────────

  const handleOwnerChange = (field: keyof OwnerForm, value: string) => {
    setOwner((prev) => ({ ...prev, [field]: value }));
  };

  // ── Pet helpers ────────────────────────────────────────────────────────────

  const handlePetChange = (id: number, field: keyof PetForm, value: string | Date | undefined | File | null) => {
    setPets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addPet = () => {
    setPets((prev) => [...prev, defaultPet(nextId)]);
    setNextId((n) => n + 1);
  };

  const removePet = (id: number) => {
    if (pets.length > 1) setPets((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!owner.owner_name.trim() || !owner.mobile_number.trim()) {
      toast.error("Please fill in the owner name and mobile number.");
      return;
    }

    for (const pet of pets) {
      if (!pet.pet_name.trim()) {
        toast.error("Please fill in all pet names.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const requests = pets.map(async (pet) => {
        const formData = new FormData();
        
        formData.append("owner_name", owner.owner_name);
        formData.append("mobile_number", owner.mobile_number);
        formData.append("address", owner.address);
        
        formData.append("pet_name", pet.pet_name);
        if (pet.birth_date) formData.append("birth_date", format(pet.birth_date, "yyyy-MM-dd"));
        if (pet.type) formData.append("type", pet.type.charAt(0).toUpperCase() + pet.type.slice(1));
        if (pet.gender) formData.append("gender", pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1));
        if (pet.spayed_neutered) formData.append("spayed_neutered", pet.spayed_neutered === "yes" ? "Yes" : "No");
        if (pet.weight_kg) formData.append("weight_kg", pet.weight_kg);
        if (pet.disease_history) formData.append("disease_history", pet.disease_history);
        if (pet.vaccination_history) formData.append("vaccination_history", pet.vaccination_history);
        if (pet.what_was_done_today) formData.append("what_was_done_today", pet.what_was_done_today);
        if (pet.diagnosis) formData.append("diagnosis", pet.diagnosis);
        if (pet.treatment) formData.append("treatment", pet.treatment);
        if (pet.follow_up_date) formData.append("follow_up_date", format(pet.follow_up_date, "yyyy-MM-dd"));
        
        if (pet.diagnostics_file) {
          formData.append("diagnostics", pet.diagnostics_file);
        }
        if (pet.today_visit_file) {
          formData.append("today_visit", pet.today_visit_file);
        }

        return fetch(`${API_BASE}/api/clinic-records`, {
          method: "POST",
          body: formData,
        });
      });

      const responses = await Promise.all(requests);

      const failed = responses.filter((r) => !r.ok);
      if (failed.length > 0) {
        const errorData = await failed[0].json().catch(() => ({}));
        throw new Error(errorData.error ?? "One or more records failed to save.");
      }

      toast.success(
        pets.length > 1
          ? `${pets.length} patient records saved successfully!`
          : "Patient record saved successfully!"
      );

      setOwner({ owner_name: "", mobile_number: "", address: "" });
      setPets([defaultPet(1)]);
      setNextId(2);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-primary-foreground" size={28} />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground">
                Patient Registration
              </h1>
              <p className="text-primary-foreground/70 text-sm mt-0.5">
                Enter pet and owner details for the visit
              </p>
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
                <Input
                  placeholder="e.g. Ahmed Mohamed"
                  value={owner.owner_name}
                  onChange={(e) => handleOwnerChange("owner_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input
                  placeholder="e.g. +20 100 123 4567"
                  type="tel"
                  value={owner.mobile_number}
                  onChange={(e) => handleOwnerChange("mobile_number", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input
                  placeholder="e.g. 15 El-Tahrir St, Cairo"
                  value={owner.address}
                  onChange={(e) => handleOwnerChange("address", e.target.value)}
                />
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removePet(pet.id)}
                  >
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Pet Name</Label>
                    <Input
                      placeholder="e.g. Buddy"
                      value={pet.pet_name}
                      onChange={(e) => handlePetChange(pet.id, "pet_name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Birthdate</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !pet.birth_date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pet.birth_date ? format(pet.birth_date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={pet.birth_date}
                          onSelect={(date) => {
                            handlePetChange(pet.id, "birth_date", date);
                            handlePetChange(pet.id, "age", calculateAge(date));
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      value={pet.age}
                      readOnly
                      className="bg-muted/50 cursor-default"
                      placeholder="Auto-calculated"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={pet.type} onValueChange={(v) => handlePetChange(pet.id, "type", v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cat">🐱 Cat</SelectItem>
                        <SelectItem value="dog">🐶 Dog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={pet.gender} onValueChange={(v) => handlePetChange(pet.id, "gender", v)}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Spayed / Neutered</Label>
                    <Select value={pet.spayed_neutered} onValueChange={(v) => handlePetChange(pet.id, "spayed_neutered", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      placeholder="e.g. 4.5"
                      type="number"
                      min="0"
                      step="0.1"
                      value={pet.weight_kg}
                      onChange={(e) => handlePetChange(pet.id, "weight_kg", e.target.value)}
                    />
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
                    <Textarea
                      placeholder="Previous diseases, chronic conditions..."
                      rows={3}
                      value={pet.disease_history}
                      onChange={(e) => handlePetChange(pet.id, "disease_history", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vaccination History</Label>
                    <Textarea
                      placeholder="Vaccines administered, dates..."
                      rows={3}
                      value={pet.vaccination_history}
                      onChange={(e) => handlePetChange(pet.id, "vaccination_history", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-1">
                      <Paperclip size={14} /> Diagnostics (PDF)
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handlePetChange(pet.id, "diagnostics_file", file as any);
                        handlePetChange(pet.id, "diagnostics_filename", file?.name || "");
                      }}
                    />
                    {pet.diagnostics_filename && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {pet.diagnostics_filename}
                      </p>
                    )}
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
                    <Textarea
                      placeholder="Examination, procedures performed..."
                      rows={3}
                      value={pet.what_was_done_today}
                      onChange={(e) => handlePetChange(pet.id, "what_was_done_today", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Diagnosis</Label>
                    <Textarea
                      placeholder="Diagnosis details..."
                      rows={3}
                      value={pet.diagnosis}
                      onChange={(e) => handlePetChange(pet.id, "diagnosis", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Treatment</Label>
                    <Textarea
                      placeholder="Prescribed treatment, medications..."
                      rows={3}
                      value={pet.treatment}
                      onChange={(e) => handlePetChange(pet.id, "treatment", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Follow-up Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !pet.follow_up_date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pet.follow_up_date ? format(pet.follow_up_date, "PPP") : "Pick follow-up date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={pet.follow_up_date}
                          onSelect={(date) => handlePetChange(pet.id, "follow_up_date", date)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-1">
                      <Paperclip size={14} /> Today's Visit Attachment (PDF)
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handlePetChange(pet.id, "today_visit_file", file as any);
                        handlePetChange(pet.id, "today_visit_filename", file?.name || "");
                      }}
                    />
                    {pet.today_visit_filename && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {pet.today_visit_filename}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Pet */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={addPet}
            className="w-full border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 py-6 text-base"
          >
            <Plus size={20} className="mr-2" /> Add Another Pet for Same Owner
          </Button>
        </div>

        {/* Submit */}
        <div className="flex justify-end mb-12">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="rounded-full px-10 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
          >
            {isSubmitting ? "Saving..." : "Save Patient Record"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;