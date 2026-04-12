import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <img src={logo} alt="" className="absolute opacity-[0.03] w-[600px] h-[600px] object-contain pointer-events-none -right-40 -bottom-40" />
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center space-y-4">
          <img src={logo} alt="Pet Medic" className="h-20 w-auto mx-auto" />
          <CardTitle className="text-2xl font-serif text-foreground">Create Account</CardTitle>
          <p className="text-sm text-muted-foreground">Join Pet Medic today</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
            Sign Up
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
