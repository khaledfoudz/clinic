import { useState } from "react";
import { Plus, PawPrint, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const samplePets = [
  { name: "Buddy", birthdate: "2020-03-15", owner: "Ahmed K.", condition: "Healthy" },
  { name: "Luna", birthdate: "2019-08-22", owner: "Sara M.", condition: "Recovering from surgery" },
  { name: "Max", birthdate: "2021-01-10", owner: "Omar H.", condition: "Vaccination due" },
  { name: "Milo", birthdate: "2022-06-05", owner: "Lina R.", condition: "Skin allergy" },
  { name: "Bella", birthdate: "2018-11-30", owner: "Nadia K.", condition: "Dental checkup needed" },
];

const PetsManagement = () => {
  const [date, setDate] = useState<Date>();

  return (
    <div>
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-bold text-primary-foreground mb-3">Pets Management</h1>
          <p className="text-primary-foreground/80">Admin dashboard for managing pet records.</p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">All Pets</h2>
              <p className="text-sm text-muted-foreground">{samplePets.length} pets registered</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus size={18} className="mr-2" /> Add Pet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Add New Pet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Pet Name</Label>
                    <Input placeholder="e.g. Buddy" />
                  </div>
                  <div className="space-y-2">
                    <Label>Birthdate</Label>
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
                    <Label>Owner Name</Label>
                    <Input placeholder="Owner's full name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Medical Condition / Diagnosis</Label>
                    <Textarea placeholder="Describe the pet's condition..." rows={3} />
                  </div>
                  <Button className="w-full rounded-full" size="lg">Add Pet</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Desktop Table */}
          <Card className="border-border hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet Name</TableHead>
                  <TableHead>Birthdate</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Condition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samplePets.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <PawPrint size={16} className="text-primary" /> {p.name}
                    </TableCell>
                    <TableCell>{p.birthdate}</TableCell>
                    <TableCell>{p.owner}</TableCell>
                    <TableCell>
                      <Badge variant={p.condition === "Healthy" ? "default" : "secondary"} className="font-normal">
                        {p.condition}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {samplePets.map((p) => (
              <Card key={p.name} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PawPrint size={18} className="text-primary" />
                    <span className="font-semibold text-foreground">{p.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Born: {p.birthdate}</p>
                    <p>Owner: {p.owner}</p>
                    <Badge variant={p.condition === "Healthy" ? "default" : "secondary"} className="font-normal mt-1">
                      {p.condition}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetsManagement;
