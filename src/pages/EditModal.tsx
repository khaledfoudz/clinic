import { useState, useEffect } from "react";
import { X, User, PawPrint, Stethoscope, ClipboardList, CalendarIcon, Paperclip, Plus, Trash2 } from "lucide-react";
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

const EditModal = ({ recordId, isOpen, onClose, onSuccess }: EditModalProps) => {
  const [formData, setFormData] = useState<EditFormData>({
    owner_name: "",
    mobile_number: "",
    address: "",
    pets: [defaultPet(1)],
  });
  
  const [nextPetId, setNextPetId] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingPets, setExistingPets] = useState<PetFormData[]>([]);

  useEffect(() => {
    if (isOpen && recordId) {
      fetchRecord();
    }
  }, [isOpen, recordId]);

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

  const handlePetChange = (petId: number, field: keyof PetFormData, value: string | Date | undefined | File | null) => {
    setFormData((prev) => ({
      ...prev,
      pets: prev.pets.map((p) => (p.id === petId ? { ...p, [field]: value } : p)),
    }));
  };

  const addPet = () => {
    setFormData((prev) => ({
      ...prev,
      pets: [...prev.pets, defaultPet(nextPetId)],
    }));
    setNextPetId((n) => n + 1);
  };

  const removePet = (petId: number) => {
    if (formData.pets.length > 1) {
      setFormData((prev) => ({
        ...prev,
        pets: prev.pets.filter((p) => p.id !== petId),
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.owner_name.trim() || !formData.mobile_number.trim()) {
      toast.error("Owner name and mobile number are required");
      return;
    }

    for (const pet of formData.pets) {
      if (!pet.pet_name.trim()) {
        toast.error("Please fill in all pet names");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const requests = formData.pets.map(async (pet) => {
        const formDataToSend = new FormData();
        
        formDataToSend.append("owner_name", formData.owner_name);
        formDataToSend.append("mobile_number", formData.mobile_number);
        formDataToSend.append("address", formData.address);
        
        formDataToSend.append("pet_name", pet.pet_name);
        if (pet.birth_date) formDataToSend.append("birth_date", format(pet.birth_date, "yyyy-MM-dd"));
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
            {/* Owner Section */}
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
                      value={formData.owner_name}
                      onChange={(e) => handleOwnerChange("owner_name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Number</Label>
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

            {/* Pet Sections */}
            {formData.pets.map((pet, index) => (
              <Card key={pet.id} className="mb-6 border-border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-serif">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <PawPrint size={16} className="text-accent" />
                      </div>
                      Pet {formData.pets.length > 1 ? `#${index + 1}` : "Information"}
                    </CardTitle>
                    {formData.pets.length > 1 && (
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
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Basic Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Pet Name</Label>
                        <Input
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
                          type="number"
                          step="0.1"
                          value={pet.weight_kg}
                          onChange={(e) => handlePetChange(pet.id, "weight_kg", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Stethoscope size={14} /> Medical History
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Disease History</Label>
                        <Textarea
                          rows={3}
                          value={pet.disease_history}
                          onChange={(e) => handlePetChange(pet.id, "disease_history", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Vaccination History</Label>
                        <Textarea
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
                            New file: {pet.diagnostics_filename}
                          </p>
                        )}
                        {pet.existing_diagnostics_url && !pet.diagnostics_filename && (
                          <p className="text-xs text-muted-foreground">
                            Existing file available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ClipboardList size={14} /> Today's Visit
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>What was done today</Label>
                        <Textarea
                          rows={3}
                          value={pet.what_was_done_today}
                          onChange={(e) => handlePetChange(pet.id, "what_was_done_today", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Diagnosis</Label>
                        <Textarea
                          rows={3}
                          value={pet.diagnosis}
                          onChange={(e) => handlePetChange(pet.id, "diagnosis", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Treatment</Label>
                        <Textarea
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
                            New file: {pet.today_visit_filename}
                          </p>
                        )}
                        {pet.existing_today_visit_url && !pet.today_visit_filename && (
                          <p className="text-xs text-muted-foreground">
                            Existing file available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Pet Button */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={addPet}
                className="w-full border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 py-6 text-base"
              >
                <Plus size={20} className="mr-2" /> Add Another Pet for Same Owner
              </Button>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditModal;