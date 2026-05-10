import { useState, useEffect } from "react";
import { X, User, PawPrint, Stethoscope, ClipboardList, CalendarIcon, Paperclip, Plus, Trash2, ArrowRight, ArrowLeft, Check } from "lucide-react";
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

interface EditModalProps {
  recordId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PetFormData {
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
  existing_diagnostics_url: string;
  what_was_done_today: string;
  diagnosis: string;
  treatment: string;
  today_visit_file: File | null;
  today_visit_filename: string;
  existing_today_visit_url: string;
  follow_up_date: Date | undefined;
}

interface EditFormData {
  owner_name: string;
  mobile_number: string;
  address: string;
  pets: PetFormData[];
}

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

const defaultPet = (id: number): PetFormData => ({
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
  existing_diagnostics_url: "",
  what_was_done_today: "",
  diagnosis: "",
  treatment: "",
  today_visit_file: null,
  today_visit_filename: "",
  existing_today_visit_url: "",
  follow_up_date: undefined,
});

const steps = ["Owner", "Basic Details", "Medical History", "Today's Visit", "Review"];

const EditModal = ({ recordId, isOpen, onClose, onSuccess }: EditModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EditFormData>({
    owner_name: "",
    mobile_number: "",
    address: "",
    pets: [defaultPet(1)],
  });
  
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [nextPetId, setNextPetId] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingPets, setExistingPets] = useState<PetFormData[]>([]);

  const currentPet = formData.pets[currentPetIndex];

  // Fetch record on open
  useEffect(() => {
    if (isOpen && recordId) {
      fetchRecord();
    }
  }, [isOpen, recordId]);

  // Enter key to go forward
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && isOpen) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, formData, isOpen]);

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/clinic-records/${recordId}`);
      if (!response.ok) throw new Error("Failed to fetch record");
      
      const result = await response.json();
      const data = result.data;
      
      const birthDate = data.birth_date ? new Date(data.birth_date) : undefined;
      
      const petData: PetFormData = {
        id: 1,
        pet_name: data.pet_name || "",
        birth_date: birthDate,
        age: calculateAge(birthDate),
        type: data.type ? data.type.toLowerCase() : "",
        gender: data.gender ? data.gender.toLowerCase() : "",
        spayed_neutered: data.spayed_neutered === "Yes" ? "yes" : "no",
        weight_kg: data.weight_kg?.toString() || "",
        disease_history: data.disease_history || "",
        vaccination_history: data.vaccination_history || "",
        diagnostics_file: null,
        diagnostics_filename: "",
        existing_diagnostics_url: data.diagnostics_url || "",
        what_was_done_today: data.what_was_done_today || "",
        diagnosis: data.diagnosis || "",
        treatment: data.treatment || "",
        today_visit_file: null,
        today_visit_filename: "",
        existing_today_visit_url: data.today_visit_url || "",
        follow_up_date: data.follow_up_date ? new Date(data.follow_up_date) : undefined,
      };
      
      setFormData({
        owner_name: data.owner_name || "",
        mobile_number: data.mobile_number || "",
        address: data.address || "",
        pets: [petData],
      });
      setExistingPets([petData]);
      setNextPetId(2);
      setStep(1);
      setCurrentPetIndex(0);
    } catch (error) {
      toast.error("Failed to load record");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerChange = (field: keyof EditFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePetChange = (field: keyof PetFormData, value: string | Date | undefined | File | null) => {
    setFormData((prev) => ({
      ...prev,
      pets: prev.pets.map((p) => (p.id === currentPet.id ? { ...p, [field]: value } : p)),
    }));
  };

  const addPet = () => {
    setFormData((prev) => ({
      ...prev,
      pets: [...prev.pets, defaultPet(nextPetId)],
    }));
    setNextPetId((n) => n + 1);
    setCurrentPetIndex(formData.pets.length);
  };

  const removePet = (petId: number) => {
    if (formData.pets.length > 1) {
      setFormData((prev) => ({
        ...prev,
        pets: prev.pets.filter((p) => p.id !== petId),
      }));
      if (currentPetIndex >= formData.pets.length - 1) {
        setCurrentPetIndex(formData.pets.length - 2);
      }
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 1) {
      if (!formData.owner_name.trim()) { toast.error("Owner name is required"); return; }
      if (!formData.mobile_number.trim()) { toast.error("Mobile number is required"); return; }
      setStep(2);
    } else if (step === 2) {
      if (!currentPet.pet_name.trim()) { toast.error("Pet name is required"); return; }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const requests = formData.pets.map(async (pet) => {
        const formDataToSend = new FormData();
        
        formDataToSend.append("owner_name", formData.owner_name);
        formDataToSend.append("mobile_number", formData.mobile_number);
        formDataToSend.append("address", formData.address);
        
        formDataToSend.append("pet_name", pet.pet_name);
        if (pet.birth_date) formDataToSend.append("birth_date", format(pet.birth_date, "yyyy-MM-dd"));
        formDataToSend.append("age", pet.age);
        if (pet.type) formDataToSend.append("type", pet.type.charAt(0).toUpperCase() + pet.type.slice(1));
        if (pet.gender) formDataToSend.append("gender", pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1));
        formDataToSend.append("spayed_neutered", pet.spayed_neutered === "yes" ? "Yes" : "No");
        if (pet.weight_kg) formDataToSend.append("weight_kg", pet.weight_kg);
        if (pet.disease_history) formDataToSend.append("disease_history", pet.disease_history);
        if (pet.vaccination_history) formDataToSend.append("vaccination_history", pet.vaccination_history);
        if (pet.what_was_done_today) formDataToSend.append("what_was_done_today", pet.what_was_done_today);
        if (pet.diagnosis) formDataToSend.append("diagnosis", pet.diagnosis);
        if (pet.treatment) formDataToSend.append("treatment", pet.treatment);
        if (pet.follow_up_date) formDataToSend.append("follow_up_date", format(pet.follow_up_date, "yyyy-MM-dd"));
        
        if (pet.diagnostics_file) {
          formDataToSend.append("diagnostics", pet.diagnostics_file);
        }
        if (pet.today_visit_file) {
          formDataToSend.append("today_visit", pet.today_visit_file);
        }
        
        const isExistingPet = existingPets.some((ep) => ep.id === pet.id);
        const url = isExistingPet 
          ? `${API_BASE}/api/clinic-records/${recordId}`
          : `${API_BASE}/api/clinic-records`;
        
        return fetch(url, {
          method: isExistingPet ? "PUT" : "POST",
          body: formDataToSend,
        });
      });

      const responses = await Promise.all(requests);
      const failed = responses.filter((r) => !r.ok);
      
      if (failed.length > 0) {
        const errorData = await failed[0].json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save records");
      }

      toast.success("Records saved successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold">Edit Patient Record</h2>
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
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                    i + 1 === step ? "bg-primary text-primary-foreground" :
                    i + 1 < step ? "bg-primary/20 text-primary" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i + 1 < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className="hidden sm:block text-xs text-muted-foreground">{s}</span>
                  {i < steps.length - 1 && <div className="w-8 h-0.5 bg-muted" />}
                </div>
              ))}
            </div>

            {/* Step 1: Owner Information */}
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
                      <Input
                        value={formData.owner_name}
                        onChange={(e) => handleOwnerChange("owner_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile Number *</Label>
                      <Input
                        value={formData.mobile_number}
                        onChange={(e) => handleOwnerChange("mobile_number", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleOwnerChange("address", e.target.value)}
                      />
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
                    {formData.pets.length > 1 && (
                      <div className="flex items-center gap-2">
                        {formData.pets.map((pet, idx) => (
                          <Button
                            key={pet.id}
                            variant={idx === currentPetIndex ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPetIndex(idx)}
                          >
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
                      <Input
                        value={currentPet.pet_name}
                        onChange={(e) => handlePetChange("pet_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Birthdate</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-start text-left font-normal", !currentPet.birth_date && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {currentPet.birth_date ? format(currentPet.birth_date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={currentPet.birth_date}
                            onSelect={(date) => {
                              handlePetChange("birth_date", date);
                              handlePetChange("age", calculateAge(date));
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input
                        value={currentPet.age}
                        readOnly
                        className="bg-muted/50 cursor-default"
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={currentPet.type} onValueChange={(v) => handlePetChange("type", v)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cat">🐱 Cat</SelectItem>
                          <SelectItem value="dog">🐶 Dog</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={currentPet.gender} onValueChange={(v) => handlePetChange("gender", v)}>
                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Spayed / Neutered</Label>
                      <Select value={currentPet.spayed_neutered} onValueChange={(v) => handlePetChange("spayed_neutered", v)}>
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
                        type="number"
                        step="0.1"
                        value={currentPet.weight_kg}
                        onChange={(e) => handlePetChange("weight_kg", e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Add Pet Button */}
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={addPet}
                      className="w-full border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 py-6 text-base"
                    >
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
                      <Textarea
                        rows={3}
                        value={currentPet.disease_history}
                        onChange={(e) => handlePetChange("disease_history", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vaccination History</Label>
                      <Textarea
                        rows={3}
                        value={currentPet.vaccination_history}
                        onChange={(e) => handlePetChange("vaccination_history", e.target.value)}
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
                          handlePetChange("diagnostics_file", file as any);
                          handlePetChange("diagnostics_filename", file?.name || "");
                        }}
                      />
                      {currentPet.diagnostics_filename && (
                        <p className="text-xs text-muted-foreground">
                          New file: {currentPet.diagnostics_filename}
                        </p>
                      )}
                      {currentPet.existing_diagnostics_url && !currentPet.diagnostics_filename && (
                        <p className="text-xs text-muted-foreground">
                          Existing file available
                        </p>
                      )}
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
                      <Textarea
                        rows={3}
                        value={currentPet.what_was_done_today}
                        onChange={(e) => handlePetChange("what_was_done_today", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Diagnosis</Label>
                      <Textarea
                        rows={3}
                        value={currentPet.diagnosis}
                        onChange={(e) => handlePetChange("diagnosis", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Treatment</Label>
                      <Textarea
                        rows={3}
                        value={currentPet.treatment}
                        onChange={(e) => handlePetChange("treatment", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Follow-up Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-start text-left font-normal", !currentPet.follow_up_date && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {currentPet.follow_up_date ? format(currentPet.follow_up_date, "PPP") : "Pick follow-up date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={currentPet.follow_up_date}
                            onSelect={(date) => handlePetChange("follow_up_date", date)}
                            initialFocus
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
                          handlePetChange("today_visit_file", file as any);
                          handlePetChange("today_visit_filename", file?.name || "");
                        }}
                      />
                      {currentPet.today_visit_filename && (
                        <p className="text-xs text-muted-foreground">
                          New file: {currentPet.today_visit_filename}
                        </p>
                      )}
                      {currentPet.existing_today_visit_url && !currentPet.today_visit_filename && (
                        <p className="text-xs text-muted-foreground">
                          Existing file available
                        </p>
                      )}
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
                    <Check size={16} className="text-primary" />
                    Review & Submit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">Owner</h3>
                      <p className="text-sm text-muted-foreground">
                        {formData.owner_name} | {formData.mobile_number} | {formData.address || "—"}
                      </p>
                    </div>
                    <Separator />
                    {formData.pets.map((pet, idx) => (
                      <div key={pet.id}>
                        <h3 className="font-semibold">
                          Pet {formData.pets.length > 1 ? `#${idx + 1}` : ""}: {pet.pet_name}
                        </h3>
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
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mb-12">
              <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                <ArrowLeft size={16} className="mr-2" /> Back
              </Button>
              {step < 5 ? (
                <Button onClick={handleNext}>
                  Next <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-accent text-accent-foreground">
                  {isSubmitting ? "Saving..." : "Save Changes"} <Check size={16} className="ml-2" />
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