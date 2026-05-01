import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Mail, Lock, User, ArrowRight, Tractor, ShoppingBag, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context-definition";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type AppRole = "farmer" | "buyer";

import Header from "@/components/Header";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole | null>((searchParams.get("role") as AppRole) || null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (userRole) {
      const redirectPath = userRole === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast({
        variant: "destructive",
        title: "Role required",
        description: "Please select whether you're a farmer or buyer.",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password, fullName, role);

    if (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Account created successfully!",
        description: "Please check your email for a confirmation link.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans pt-16">
      <Header />
      <div className="flex-1 grid lg:grid-cols-2">
        {/* Left Side - Image/Decoration (Swapped for variety) */}
        <div className="hidden lg:block relative bg-muted overflow-hidden order-2">
          <div className="absolute inset-0 bg-gradient-to-bl from-secondary/90 to-secondary/40 mix-blend-multiply z-10" />
          <img 
            src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2071&auto=format&fit=crop" 
            alt="Farming" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 text-white">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-glow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Join the Community</span>
              </div>
              <blockquote className="text-xl font-medium leading-relaxed mb-4">
                "Finding fresh, organic produce has never been easier. AgriLink gives me confidence in every purchase."
              </blockquote>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20" />
                <div>
                  <p className="text-sm font-bold">David M.</p>
                  <p className="text-xs text-white/70">Restaurant Owner, Nairobi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center p-8 lg:p-16 order-1">
          <div className="w-full max-w-md space-y-8 animate-fade-in">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
                Create Account
              </h1>
              <p className="text-muted-foreground text-lg">
                Join AgriLink to start trading today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base">I am a...</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("farmer")}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]",
                      role === "farmer"
                        ? "border-primary bg-primary/5 shadow-soft ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                      role === "farmer" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Tractor className="w-6 h-6" />
                    </div>
                    <span className={cn(
                      "font-semibold",
                      role === "farmer" ? "text-primary" : "text-foreground"
                    )}>
                      Farmer
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]",
                      role === "buyer"
                        ? "border-secondary bg-secondary/5 shadow-soft ring-2 ring-secondary/20"
                        : "border-border hover:border-secondary/50 hover:bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                      role === "buyer" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <span className={cn(
                      "font-semibold",
                      role === "buyer" ? "text-secondary" : "text-foreground"
                    )}>
                      Buyer
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12 bg-muted/30 border-border/50 focus:bg-background transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-muted/30 border-border/50 focus:bg-background transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-muted/30 border-border/50 focus:bg-background transition-all"
                    minLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold shadow-soft hover:shadow-glow transition-all" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Create Account <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;