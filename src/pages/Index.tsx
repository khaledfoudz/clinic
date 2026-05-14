import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, User, PawPrint, Stethoscope, ClipboardList, CalendarIcon, Paperclip, ArrowRight, ArrowLeft, Check } from "lucide-react";
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

interface PetForm {
  id: number;
  pet_name: string;
  birth_date: Date | undefined;
  type: string;
  gender: string;
  disease_history: string;
  vaccination_history: string;
  // visit fields
  visit_date: Date | undefined;
  spayed_neutered: string;
  weight_kg: string;
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

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const calculateAge = (birthDate: Date | undefined): string => {
  if (!birthDate) return "—";
  const today = new Date();
  let years  = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth()    - birthDate.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years  === 0) return `${months} month${months !== 1 ? "s" : ""}`;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""}`;
};

const defaultPet = (id: number): PetForm => ({
  id, pet_name: "", birth_date: undefined, type: "", gender: "",
  disease_history: "", vaccination_history: "",
  visit_date: new Date(), spayed_neutered: "", weight_kg: "",
  diagnostics_file: null, diagnostics_filename: "",
  what_was_done_today: "", diagnosis: "", treatment: "",
  today_visit_file: null, today_visit_filename: "", follow_up_date: undefined,
});

const Index = () => {
  const [step, setStep] = useState(1);
  const [owner, setOwner] = useState<OwnerForm>({ owner_name: "", mobile_number: "", address: "" });
  const [pets, setPets] = useState<PetForm[]>([defaultPet(1)]);
  const [nextId, setNextId] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const currentPet = pets[currentPetIndex];

  const ownerNameRef   = useRef<HTMLInputElement>(null);
  const mobileRef      = useRef<HTMLInputElement>(null);
  const addressRef     = useRef<HTMLInputElement>(null);
  const petNameRef     = useRef<HTMLInputElement>(null);
  const birthDateRef   = useRef<HTMLButtonElement>(null);
  const typeRef        = useRef<HTMLButtonElement>(null);
  const genderRef      = useRef<HTMLButtonElement>(null);
  const diseaseRef     = useRef<HTMLTextAreaElement>(null);
  const vaccinationRef = useRef<HTMLTextAreaElement>(null);
  const spayedRef      = useRef<HTMLButtonElement>(null);
  const weightRef      = useRef<HTMLInputElement>(null);
  const diagnosticsRef = useRef<HTMLInputElement>(null);
  const whatDoneRef    = useRef<HTMLTextAreaElement>(null);
  const diagnosisRef   = useRef<HTMLTextAreaElement>(null);
  const treatmentRef   = useRef<HTMLTextAreaElement>(null);
  const followUpRef    = useRef<HTMLButtonElement>(null);
  const todayVisitRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 1) ownerNameRef.current?.focus();
    if (step === 2) petNameRef.current?.focus();
    if (step === 3) diseaseRef.current?.focus();
    if (step === 4) spayedRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey || isSubmitting) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA") return;
      e.preventDefault();
      if (step === 5) { handleSubmit(); return; }
      const focusOrders: { [key: number]: (HTMLElement | null)[] } = {
        1: [ownerNameRef.current, mobileRef.current, addressRef.current],
        2: [petNameRef.current, birthDateRef.current, typeRef.current, genderRef.current],
        3: [diseaseRef.current, vaccinationRef.current],
        4: [spayedRef.current, weightRef.current, diagnosticsRef.current, whatDoneRef.current, diagnosisRef.current, treatmentRef.current, followUpRef.current, todayVisitRef.current],
      };
      const fields = focusOrders[step] || [];
      const idx = fields.findIndex((f) => f === target);
      if (idx !== -1 && idx < fields.length - 1) {
        fields[idx + 1]?.focus();
      } else {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, owner, currentPet, isSubmitting]);

  const handleOwnerChange = (field: keyof OwnerForm, value: string) =>
    setOwner((prev) => ({ ...prev, [field]: value }));

  const handlePetChange = (field: keyof PetForm, value: any) =>
    setPets((prev) => prev.map((p) => p.id === currentPet.id ? { ...p, [field]: value } : p));

  const addPet = () => {
    const newPet = defaultPet(nextId);
    setPets((prev) => [...prev, newPet]);
    setNextId((n) => n + 1);
    setCurrentPetIndex(pets.length);
    setTimeout(() => petNameRef.current?.focus(), 100);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!owner.owner_name.trim())    { toast.error("Owner name is required");   ownerNameRef.current?.focus(); return; }
      if (!owner.mobile_number.trim()) { toast.error("Mobile number is required"); mobileRef.current?.focus();   return; }
      setStep(2);
    } else if (step === 2) {
      if (!currentPet.pet_name.trim()) { toast.error("Pet name is required"); petNameRef.current?.focus(); return; }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Build first pet + first visit FormData
      const firstFd = new FormData();
      firstFd.append("owner_name",    owner.owner_name);
      firstFd.append("mobile_number", owner.mobile_number);
      firstFd.append("address",       owner.address);

      const p = pets[0];
      firstFd.append("pet_name", p.pet_name);
      if (p.birth_date) firstFd.append("birth_date", format(p.birth_date, "yyyy-MM-dd"));
      if (p.type)   firstFd.append("type",   p.type.charAt(0).toUpperCase()   + p.type.slice(1));
      if (p.gender) firstFd.append("gender", p.gender.charAt(0).toUpperCase() + p.gender.slice(1));
      if (p.disease_history)     firstFd.append("disease_history",     p.disease_history);
      if (p.vaccination_history) firstFd.append("vaccination_history", p.vaccination_history);
      // visit fields
      if (p.visit_date)          firstFd.append("visit_date",          format(p.visit_date, "yyyy-MM-dd"));
      if (p.spayed_neutered)     firstFd.append("spayed_neutered",     p.spayed_neutered === "yes" ? "Yes" : "No");
      if (p.weight_kg)           firstFd.append("weight_kg",           p.weight_kg);
      if (p.what_was_done_today) firstFd.append("what_was_done_today", p.what_was_done_today);
      if (p.diagnosis)           firstFd.append("diagnosis",           p.diagnosis);
      if (p.treatment)           firstFd.append("treatment",           p.treatment);
      if (p.follow_up_date)      firstFd.append("follow_up_date",      format(p.follow_up_date, "yyyy-MM-dd"));
      if (p.diagnostics_file)    firstFd.append("diagnostics",         p.diagnostics_file);
      if (p.today_visit_file)    firstFd.append("today_visit",         p.today_visit_file);

      const firstRes = await fetch(`${API_BASE}/api/owners`, { method: "POST", body: firstFd });
      if (!firstRes.ok) {
        const err = await firstRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create record");
      }
      const firstData = await firstRes.json();
      const ownerId: number = firstData.data.id;

      // Additional pets
      if (pets.length > 1) {
        for (const pet of pets.slice(1)) {
          // add pet profile
          const petFd = new FormData();
          petFd.append("pet_name", pet.pet_name);
          if (pet.birth_date) petFd.append("birth_date", format(pet.birth_date, "yyyy-MM-dd"));
          if (pet.type)   petFd.append("type",   pet.type.charAt(0).toUpperCase()   + pet.type.slice(1));
          if (pet.gender) petFd.append("gender", pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1));
          if (pet.disease_history)     petFd.append("disease_history",     pet.disease_history);
          if (pet.vaccination_history) petFd.append("vaccination_history", pet.vaccination_history);

          const petRes = await fetch(`${API_BASE}/api/owners/${ownerId}/pets`, { method: "POST", body: petFd });
          if (!petRes.ok) throw new Error("Failed to save pet");
          const petData = await petRes.json();
          const petId = petData.data.id;

          // add first visit for this pet
          const visitFd = new FormData();
          if (pet.visit_date)          visitFd.append("visit_date",          format(pet.visit_date, "yyyy-MM-dd"));
          if (pet.spayed_neutered)     visitFd.append("spayed_neutered",     pet.spayed_neutered === "yes" ? "Yes" : "No");
          if (pet.weight_kg)           visitFd.append("weight_kg",           pet.weight_kg);
          if (pet.what_was_done_today) visitFd.append("what_was_done_today", pet.what_was_done_today);
          if (pet.diagnosis)           visitFd.append("diagnosis",           pet.diagnosis);
          if (pet.treatment)           visitFd.append("treatment",           pet.treatment);
          if (pet.follow_up_date)      visitFd.append("follow_up_date",      format(pet.follow_up_date, "yyyy-MM-dd"));
          if (pet.diagnostics_file)    visitFd.append("diagnostics",         pet.diagnostics_file);
          if (pet.today_visit_file)    visitFd.append("today_visit",         pet.today_visit_file);

          await fetch(`${API_BASE}/api/pets/${petId}/visits`, { method: "POST", body: visitFd });
        }
      }

      toast.success(`${pets.length} patient record${pets.length > 1 ? "s" : ""} saved successfully!`);
      setOwner({ owner_name: "", mobile_number: "", address: "" });
      setPets([defaultPet(1)]);
      setNextId(2);
      setStep(1);
      setCurrentPetIndex(0);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ["Owner", "Basic Details", "Medical History", "Today's Visit", "Review"];

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-primary-foreground" size={28} />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground">Patient Registration</h1>
              <p className="text-primary-foreground/70 text-sm mt-0.5">Step {step} of 5: {steps[step - 1]}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Step Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                i + 1 === step ? "bg-primary text-primary-foreground" :
                i + 1 < step   ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {i + 1 < step ? <Check size={14} /> : i + 1}
              </div>
              <span className="hidden sm:block text-xs text-muted-foreground">{s}</span>
              {i < steps.length - 1 && <div className="w-8 h-0.5 bg-muted" />}
            </div>
          ))}
        </div>

        {/* Step 1: Owner */}
        {step === 1 && (
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
                  <Label>Owner Name *</Label>
                  <Input ref={ownerNameRef} placeholder="e.g. Ahmed Mohamed" value={owner.owner_name} onChange={(e) => handleOwnerChange("owner_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number *</Label>
                  <Input ref={mobileRef} placeholder="e.g. +20 100 123 4567" type="tel" value={owner.mobile_number} onChange={(e) => handleOwnerChange("mobile_number", e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input ref={addressRef} placeholder="e.g. 15 El-Tahrir St, Cairo" value={owner.address} onChange={(e) => handleOwnerChange("address", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Basic Details */}
        {step === 2 && (
          <Card className="mb-6 border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-serif">
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <PawPrint size={16} className="text-accent" />
                  </div>
                  Basic Details
                </CardTitle>
                {pets.length > 1 && (
                  <div className="flex items-center gap-2">
                    {pets.map((pet, idx) => (
                      <Button key={pet.id} variant={idx === currentPetIndex ? "default" : "outline"} size="sm" onClick={() => setCurrentPetIndex(idx)}>
                        Pet {idx + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Pet Name *</Label>
                  <Input ref={petNameRef} placeholder="e.g. Buddy" value={currentPet.pet_name} onChange={(e) => handlePetChange("pet_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Birthdate</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button ref={birthDateRef} variant="outline" className={cn("w-full justify-start text-left font-normal", !currentPet.birth_date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentPet.birth_date ? format(currentPet.birth_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={currentPet.birth_date} onSelect={(date) => handlePetChange("birth_date", date)} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input value={calculateAge(currentPet.birth_date)} readOnly className="bg-muted/50 cursor-default" placeholder="Auto-calculated" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={currentPet.type} onValueChange={(v) => handlePetChange("type", v)}>
                    <SelectTrigger ref={typeRef}><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cat">🐱 Cat</SelectItem>
                      <SelectItem value="dog">🐶 Dog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={currentPet.gender} onValueChange={(v) => handlePetChange("gender", v)}>
                    <SelectTrigger ref={genderRef}><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6">
                <Button variant="outline" onClick={addPet} className="w-full border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 py-6 text-base">
                  <Plus size={20} className="mr-2" /> Add Another Pet for Same Owner
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Medical History */}
        {step === 3 && (
          <Card className="mb-6 border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-serif">
                <Stethoscope size={16} className="text-primary" /> Medical History
                {pets.length > 1 && <span className="text-sm font-normal text-muted-foreground ml-2">— {currentPet.pet_name || `Pet ${currentPetIndex + 1}`}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pets.length > 1 && (
                <div className="flex items-center gap-2 mb-4">
                  {pets.map((pet, idx) => (
                    <Button key={pet.id} variant={idx === currentPetIndex ? "default" : "outline"} size="sm" onClick={() => setCurrentPetIndex(idx)}>
                      {pet.pet_name || `Pet ${idx + 1}`}
                    </Button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Disease History</Label>
                  <Textarea ref={diseaseRef} placeholder="Previous diseases, chronic conditions..." rows={3} value={currentPet.disease_history} onChange={(e) => handlePetChange("disease_history", e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); vaccinationRef.current?.focus(); } }} />
                </div>
                <div className="space-y-2">
                  <Label>Vaccination History</Label>
                  <Textarea ref={vaccinationRef} placeholder="Vaccines administered, dates..." rows={3} value={currentPet.vaccination_history} onChange={(e) => handlePetChange("vaccination_history", e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleNext(); } }} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Today's Visit */}
        {step === 4 && (
          <Card className="mb-6 border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-serif">
                <ClipboardList size={16} className="text-primary" /> Today's Visit
                {pets.length > 1 && <span className="text-sm font-normal text-muted-foreground ml-2">— {currentPet.pet_name || `Pet ${currentPetIndex + 1}`}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pets.length > 1 && (
                <div className="flex items-center gap-2 mb-4">
                  {pets.map((pet, idx) => (
                    <Button key={pet.id} variant={idx === currentPetIndex ? "default" : "outline"} size="sm" onClick={() => setCurrentPetIndex(idx)}>
                      {pet.pet_name || `Pet ${idx + 1}`}
                    </Button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Visit Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !currentPet.visit_date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentPet.visit_date ? format(currentPet.visit_date, "PPP") : "Pick visit date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={currentPet.visit_date} onSelect={(date) => handlePetChange("visit_date", date)} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Spayed / Neutered</Label>
                  <Select value={currentPet.spayed_neutered} onValueChange={(v) => handlePetChange("spayed_neutered", v)}>
                    <SelectTrigger ref={spayedRef}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input ref={weightRef} placeholder="e.g. 4.5" type="number" min="0" step="0.1" value={currentPet.weight_kg} onChange={(e) => handlePetChange("weight_kg", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Paperclip size={14} /> Diagnostics (PDF / Image)</Label>
                  <Input ref={diagnosticsRef} type="file" accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handlePetChange("diagnostics_file", file);
                      handlePetChange("diagnostics_filename", file?.name || "");
                    }} />
                  {currentPet.diagnostics_filename && <p className="text-xs text-muted-foreground">Selected: {currentPet.diagnostics_filename}</p>}
                </div>
                <div className="space-y-2">
                  <Label>What was done today</Label>
                  <Textarea ref={whatDoneRef} placeholder="Examination, procedures performed..." rows={3} value={currentPet.what_was_done_today} onChange={(e) => handlePetChange("what_was_done_today", e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); diagnosisRef.current?.focus(); } }} />
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis</Label>
                  <Textarea ref={diagnosisRef} placeholder="Diagnosis details..." rows={3} value={currentPet.diagnosis} onChange={(e) => handlePetChange("diagnosis", e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); treatmentRef.current?.focus(); } }} />
                </div>
                <div className="space-y-2">
                  <Label>Treatment</Label>
                  <Textarea ref={treatmentRef} placeholder="Prescribed treatment, medications..." rows={3} value={currentPet.treatment} onChange={(e) => handlePetChange("treatment", e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); followUpRef.current?.focus(); } }} />
                </div>
                <div className="space-y-2">
                  <Label>Follow-up Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button ref={followUpRef} variant="outline" className={cn("w-full justify-start text-left font-normal", !currentPet.follow_up_date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentPet.follow_up_date ? format(currentPet.follow_up_date, "PPP") : "Pick follow-up date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={currentPet.follow_up_date} onSelect={(date) => handlePetChange("follow_up_date", date)} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-1"><Paperclip size={14} /> Today's Visit Attachment (PDF / Image)</Label>
                  <Input ref={todayVisitRef} type="file" accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handlePetChange("today_visit_file", file);
                      handlePetChange("today_visit_filename", file?.name || "");
                    }} />
                  {currentPet.today_visit_filename && <p className="text-xs text-muted-foreground">Selected: {currentPet.today_visit_filename}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <Card className="mb-6 border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-serif">
                <Check size={16} className="text-primary" /> Review & Submit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Owner</h3>
                  <p className="text-sm text-muted-foreground">{owner.owner_name} | {owner.mobile_number} | {owner.address || "—"}</p>
                </div>
                <Separator />
                {pets.map((pet, idx) => (
                  <div key={pet.id}>
                    <h3 className="font-semibold">Pet {pets.length > 1 ? `#${idx + 1}` : ""}: {pet.pet_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pet.type} | {pet.gender} | {calculateAge(pet.birth_date)} | {pet.weight_kg ? `${pet.weight_kg}kg` : "—"} | Spayed: {pet.spayed_neutered || "—"}
                    </p>
                    {pet.disease_history && <p className="text-sm text-muted-foreground"><strong>Diseases:</strong> {pet.disease_history}</p>}
                    {pet.diagnosis && <p className="text-sm text-muted-foreground"><strong>Diagnosis:</strong> {pet.diagnosis}</p>}
                    {pet.treatment && <p className="text-sm text-muted-foreground"><strong>Treatment:</strong> {pet.treatment}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mb-12">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          {step < 5 ? (
            <Button onClick={handleNext}>Next <ArrowRight size={16} className="ml-2" /></Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-accent text-accent-foreground">
              {isSubmitting ? "Saving..." : "Submit"} <Check size={16} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;