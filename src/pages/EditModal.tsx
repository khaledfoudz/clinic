// EditModal.tsx
// Props:
//   ownerId  — always required (which owner we're working on)
//   petId    — number → edit that pet | null → add a brand-new pet to this owner

import { useState, useEffect } from "react";
import {
  X, User, PawPrint, Stethoscope, ClipboardList,
  CalendarIcon, Paperclip, ArrowRight, ArrowLeft, Check,
} from "lucide-react";
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

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditModalProps {
  ownerId:   number | null;
  petId:     number | null;   // null = "Add new pet" mode
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

interface OwnerFields {
  owner_name:    string;
  mobile_number: string;
  address:       string;
}

interface PetFields {
  pet_name:                 string;
  birth_date:               Date | undefined;
  age:                      string;
  type:                     string;
  gender:                   string;
  spayed_neutered:          string;
  weight_kg:                string;
  disease_history:          string;
  vaccination_history:      string;
  diagnostics_file:         File | null;
  diagnostics_filename:     string;
  existing_diagnostics_url: string;
  what_was_done_today:      string;
  diagnosis:                string;
  treatment:                string;
  today_visit_file:         File | null;
  today_visit_filename:     string;
  existing_today_visit_url: string;
  follow_up_date:           Date | undefined;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const calculateAge = (birthDate: Date | undefined): string => {
  if (!birthDate) return "";
  const today = new Date();
  const birth = new Date(birthDate);
  let years  = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth()    - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years  === 0) return `${months} month${months !== 1 ? "s" : ""}`;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""}`;
};

const emptyPet = (): PetFields => ({
  pet_name: "", birth_date: undefined, age: "", type: "", gender: "",
  spayed_neutered: "", weight_kg: "", disease_history: "",
  vaccination_history: "", diagnostics_file: null, diagnostics_filename: "",
  existing_diagnostics_url: "", what_was_done_today: "", diagnosis: "",
  treatment: "", today_visit_file: null, today_visit_filename: "",
  existing_today_visit_url: "", follow_up_date: undefined,
});

const steps = ["Owner", "Basic Details", "Medical History", "Today's Visit", "Review"];

// ── Component ─────────────────────────────────────────────────────────────────

const EditModal = ({ ownerId, petId, isOpen, onClose, onSuccess }: EditModalProps) => {
  const isAddPetMode = petId === null;  // true → adding; false → editing

  const [step, setStep]             = useState(1);
  const [isLoading, setIsLoading]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [ownerFields, setOwnerFields] = useState<OwnerFields>({
    owner_name: "", mobile_number: "", address: "",
  });
  const [pet, setPet] = useState<PetFields>(emptyPet());

  // ── Fetch on open ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !ownerId) return;
    // In "add pet" mode start at step 2 (skip owner step — owner already exists)
    setStep(isAddPetMode ? 2 : 1);
    fetchData();
  }, [isOpen, ownerId, petId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Always fetch owner info so the owner fields are pre-filled
      const ownerRes = await fetch(`${API_BASE}/api/owners/${ownerId}`);
      if (!ownerRes.ok) throw new Error("Failed to fetch owner");
      const ownerData = (await ownerRes.json()).data;

      setOwnerFields({
        owner_name:    ownerData.owner_name    || "",
        mobile_number: ownerData.mobile_number || "",
        address:       ownerData.address       || "",
      });

      if (!isAddPetMode && petId) {
        // Edit mode: fetch the specific pet
        const petRes = await fetch(`${API_BASE}/api/owners/${ownerId}/pets/${petId}`);
        if (!petRes.ok) throw new Error("Failed to fetch pet");
        const petData = (await petRes.json()).data;

        const birthDate = petData.birth_date ? new Date(petData.birth_date) : undefined;
        setPet({
          pet_name:            petData.pet_name            || "",
          birth_date:          birthDate,
          age:                 calculateAge(birthDate),
          type:                petData.type   ? petData.type.toLowerCase()   : "",
          gender:              petData.gender ? petData.gender.toLowerCase() : "",
          spayed_neutered:
            petData.spayed_neutered === true || petData.spayed_neutered === "Yes"
              ? "yes" : "no",
          weight_kg:           petData.weight_kg?.toString() || "",
          disease_history:     petData.disease_history     || "",
          vaccination_history: petData.vaccination_history || "",
          diagnostics_file:    null,
          diagnostics_filename: "",
          existing_diagnostics_url: petData.diagnostics_url || "",
          what_was_done_today: petData.what_was_done_today || "",
          diagnosis:           petData.diagnosis           || "",
          treatment:           petData.treatment           || "",
          today_visit_file:    null,
          today_visit_filename: "",
          existing_today_visit_url: petData.today_visit_url || "",
          follow_up_date:      petData.follow_up_date ? new Date(petData.follow_up_date) : undefined,
        });
      } else {
        // Add mode: fresh empty pet
        setPet(emptyPet());
      }
    } catch {
      toast.error("Failed to load record");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // ── Enter key ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && isOpen) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, ownerFields, pet, isOpen]);

  // ── Field helpers ──────────────────────────────────────────────────────────

  const handleOwnerChange = (field: keyof OwnerFields, value: string) =>
    setOwnerFields((prev) => ({ ...prev, [field]: value }));

  const handlePetChange = (
    field: keyof PetFields,
    value: string | Date | undefined | File | null
  ) => setPet((prev) => ({ ...prev, [field]: value }));

  // ── Navigation ─────────────────────────────────────────────────────────────

  const minStep = isAddPetMode ? 2 : 1;

  const handleNext = () => {
    if (step === 1) {
      if (!ownerFields.owner_name.trim())    { toast.error("Owner name is required"); return; }
      if (!ownerFields.mobile_number.trim()) { toast.error("Mobile number is required"); return; }
      setStep(2);
    } else if (step === 2) {
      if (!pet.pet_name.trim()) { toast.error("Pet name is required"); return; }
      setStep(3);
    } else if (step === 3) { setStep(4);
    } else if (step === 4) { setStep(5); }
  };

  const handleBack = () => {
    if (step > minStep) setStep(step - 1);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Build pet FormData
      const petFd = new FormData();
      petFd.append("pet_name", pet.pet_name);
      if (pet.birth_date)          petFd.append("birth_date",          format(pet.birth_date, "yyyy-MM-dd"));
      petFd.append("age", pet.age);
      if (pet.type)                petFd.append("type",   pet.type.charAt(0).toUpperCase()   + pet.type.slice(1));
      if (pet.gender)              petFd.append("gender", pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1));
      petFd.append("spayed_neutered", pet.spayed_neutered === "yes" ? "Yes" : "No");
      if (pet.weight_kg)           petFd.append("weight_kg",           pet.weight_kg);
      if (pet.disease_history)     petFd.append("disease_history",     pet.disease_history);
      if (pet.vaccination_history) petFd.append("vaccination_history", pet.vaccination_history);
      if (pet.what_was_done_today) petFd.append("what_was_done_today", pet.what_was_done_today);
      if (pet.diagnosis)           petFd.append("diagnosis",           pet.diagnosis);
      if (pet.treatment)           petFd.append("treatment",           pet.treatment);
      if (pet.follow_up_date)      petFd.append("follow_up_date",      format(pet.follow_up_date, "yyyy-MM-dd"));
      if (pet.diagnostics_file)    petFd.append("diagnostics",         pet.diagnostics_file);
      if (pet.today_visit_file)    petFd.append("today_visit",         pet.today_visit_file);

      // Always update owner info (name / mobile / address may have changed)
      await fetch(`${API_BASE}/api/owners/${ownerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ownerFields),
      });

      // Add new pet  OR  update existing pet
      const petUrl    = isAddPetMode
        ? `${API_BASE}/api/owners/${ownerId}/pets`
        : `${API_BASE}/api/pets/${petId}`;
      const petMethod = isAddPetMode ? "POST" : "PUT";

      const petRes = await fetch(petUrl, { method: petMethod, body: petFd });
      if (!petRes.ok) {
        const err = await petRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save");
      }

      toast.success(isAddPetMode ? "Pet added successfully" : "Record updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold">
            {isAddPetMode ? "Add New Pet" : "Edit Patient Record"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="p-6">
            {/* Step Progress */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {steps.map((s, i) => {
                if (isAddPetMode && i === 0) return null; // hide "Owner" step pill in add-pet mode
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                      i + 1 === step ? "bg-primary text-primary-foreground" :
                      i + 1 < step  ? "bg-primary/20 text-primary" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {i + 1 < step ? <Check size={14} /> : i + 1}
                    </div>
                    <span className="hidden sm:block text-xs text-muted-foreground">{s}</span>
                    {i < steps.length - 1 && <div className="w-8 h-0.5 bg-muted" />}
                  </div>
                );
              })}
            </div>

            {/* Context banner in add-pet mode */}
            {isAddPetMode && (
              <div className="mb-4 rounded-md bg-muted/30 border border-border px-4 py-2 text-sm text-muted-foreground">
                Adding a new pet for <strong className="text-foreground">{ownerFields.owner_name}</strong>
              </div>
            )}

            {/* ── Step 1: Owner (edit mode only) ───────────────────────── */}
            {step === 1 && !isAddPetMode && (
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
                      <Input value={ownerFields.owner_name}
                        onChange={(e) => handleOwnerChange("owner_name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile Number *</Label>
                      <Input value={ownerFields.mobile_number}
                        onChange={(e) => handleOwnerChange("mobile_number", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      <Input value={ownerFields.address}
                        onChange={(e) => handleOwnerChange("address", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Step 2: Basic Details ─────────────────────────────────── */}
            {step === 2 && (
              <Card className="mb-6 border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-serif">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <PawPrint size={16} className="text-accent" />
                    </div>
                    Basic Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Pet Name *</Label>
                      <Input value={pet.pet_name}
                        onChange={(e) => handlePetChange("pet_name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Birthdate</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !pet.birth_date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {pet.birth_date ? format(pet.birth_date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={pet.birth_date}
                            onSelect={(date) => {
                              handlePetChange("birth_date", date);
                              handlePetChange("age", calculateAge(date));
                            }}
                            initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input value={pet.age} readOnly className="bg-muted/50 cursor-default" placeholder="Auto-calculated" />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={pet.type} onValueChange={(v) => handlePetChange("type", v)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cat">🐱 Cat</SelectItem>
                          <SelectItem value="dog">🐶 Dog</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={pet.gender} onValueChange={(v) => handlePetChange("gender", v)}>
                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Spayed / Neutered</Label>
                      <Select value={pet.spayed_neutered} onValueChange={(v) => handlePetChange("spayed_neutered", v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Weight (kg)</Label>
                      <Input type="number" step="0.1" value={pet.weight_kg}
                        onChange={(e) => handlePetChange("weight_kg", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Step 3: Medical History ───────────────────────────────── */}
            {step === 3 && (
              <Card className="mb-6 border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-serif">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Stethoscope size={16} className="text-primary" />
                    </div>
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Disease History</Label>
                      <Textarea rows={3} value={pet.disease_history}
                        onChange={(e) => handlePetChange("disease_history", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Vaccination History</Label>
                      <Textarea rows={3} value={pet.vaccination_history}
                        onChange={(e) => handlePetChange("vaccination_history", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="flex items-center gap-1"><Paperclip size={14} /> Diagnostics (PDF)</Label>
                      <Input type="file" accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handlePetChange("diagnostics_file", file as any);
                          handlePetChange("diagnostics_filename", file?.name || "");
                        }}
                      />
                      {pet.diagnostics_filename && (
                        <p className="text-xs text-muted-foreground">New file: {pet.diagnostics_filename}</p>
                      )}
                      {pet.existing_diagnostics_url && !pet.diagnostics_filename && (
                        <p className="text-xs text-muted-foreground">Existing file available (upload to replace)</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Step 4: Today's Visit ─────────────────────────────────── */}
            {step === 4 && (
              <Card className="mb-6 border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-serif">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <ClipboardList size={16} className="text-primary" />
                    </div>
                    Today's Visit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>What was done today</Label>
                      <Textarea rows={3} value={pet.what_was_done_today}
                        onChange={(e) => handlePetChange("what_was_done_today", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Diagnosis</Label>
                      <Textarea rows={3} value={pet.diagnosis}
                        onChange={(e) => handlePetChange("diagnosis", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Treatment</Label>
                      <Textarea rows={3} value={pet.treatment}
                        onChange={(e) => handlePetChange("treatment", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Follow-up Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !pet.follow_up_date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {pet.follow_up_date ? format(pet.follow_up_date, "PPP") : "Pick follow-up date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={pet.follow_up_date}
                            onSelect={(date) => handlePetChange("follow_up_date", date)}
                            initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="flex items-center gap-1"><Paperclip size={14} /> Today's Visit Attachment (PDF)</Label>
                      <Input type="file" accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handlePetChange("today_visit_file", file as any);
                          handlePetChange("today_visit_filename", file?.name || "");
                        }}
                      />
                      {pet.today_visit_filename && (
                        <p className="text-xs text-muted-foreground">New file: {pet.today_visit_filename}</p>
                      )}
                      {pet.existing_today_visit_url && !pet.today_visit_filename && (
                        <p className="text-xs text-muted-foreground">Existing file available (upload to replace)</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Step 5: Review ────────────────────────────────────────── */}
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
                      <p className="text-sm text-muted-foreground">
                        {ownerFields.owner_name} | {ownerFields.mobile_number} | {ownerFields.address || "—"}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-semibold">Pet: {pet.pet_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pet.type} | {pet.gender} | {pet.age || "—"} | {pet.weight_kg ? `${pet.weight_kg}kg` : "—"} | Spayed: {pet.spayed_neutered || "—"}
                      </p>
                      {pet.disease_history && (
                        <p className="text-sm text-muted-foreground"><strong>Diseases:</strong> {pet.disease_history}</p>
                      )}
                      {pet.diagnosis && (
                        <p className="text-sm text-muted-foreground"><strong>Diagnosis:</strong> {pet.diagnosis}</p>
                      )}
                      {pet.treatment && (
                        <p className="text-sm text-muted-foreground"><strong>Treatment:</strong> {pet.treatment}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mb-12">
              <Button variant="outline" onClick={handleBack} disabled={step === minStep}>
                <ArrowLeft size={16} className="mr-2" /> Back
              </Button>
              {step < 5 ? (
                <Button onClick={handleNext}>
                  Next <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-accent text-accent-foreground">
                  {isSubmitting ? "Saving..." : isAddPetMode ? "Add Pet" : "Save Changes"}
                  <Check size={16} className="ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditModal;