import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context-definition";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Loader2, 
  ArrowLeft,
  Settings,
  ShieldCheck,
  Camera,
  X,
  Bell
} from "lucide-react";

const ProfilePage = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: "",
    email_notifications: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        location: profile.location || "",
        email_notifications: profile.email_notifications ?? true,
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleNotifications = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, email_notifications: checked }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await uploadAvatar(file);
    if (url) {
      await updateProfile({ avatar_url: url });
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile(formData);
    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/AgriLink/profile`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Please check your inbox for instructions to reset your password.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error resetting password",
        description: error.message,
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const dashboardPath = userRole === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard";

  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
            <Link to={dashboardPath}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Overview Sidebar */}
            <div className="md:col-span-1 space-y-6">
              <Card className="border-border/50 shadow-soft overflow-hidden">
                <div className={`h-24 ${userRole === 'farmer' ? 'bg-primary/10' : 'bg-secondary/10'}`} />
                <CardContent className="relative pt-12 pb-6 px-6 text-center">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-background border-4 border-background shadow-md overflow-hidden flex items-center justify-center">
                        {profile?.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt={profile.full_name || "Profile"} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${userRole === 'farmer' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                            <User className="w-10 h-10" />
                          </div>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`absolute bottom-0 right-0 p-1.5 rounded-full shadow-md border-2 border-background transition-transform hover:scale-110 ${userRole === 'farmer' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                      />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-1 mt-2">
                    {profile?.full_name || "User Name"}
                  </h2>
                  <p className="text-sm text-muted-foreground capitalize mb-4">
                    {userRole} Member
                  </p>
                  <div className="flex justify-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      userRole === "farmer" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                    }`}>
                      Verified {userRole}
                    </span>
                  </div>
                </CardContent>
                <div className="border-t border-border/50 divide-y divide-border/50">
                  <div className="px-6 py-4 flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground truncate">{user?.email}</span>
                  </div>
                  <div className="px-6 py-4 flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {profile ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </Card>

              <Card className="border-border/50 shadow-soft">
                <CardHeader className="pb-3 border-b border-border/10">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Account Security</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="font-medium">Password Protected</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={handleChangePassword}
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    ) : null}
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Profile Edit Form */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-border/50 shadow-soft">
                <CardHeader className="border-b border-border/10">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    <CardTitle className="text-xl">Profile Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Update your personal information for better communication with others.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="full_name"
                            name="full_name"
                            placeholder="Your Name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="+254 700 000 000"
                            value={formData.phone}
                            onChange={handleChange}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Farm Location / Primary Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="location"
                          name="location"
                          placeholder="City, State"
                          value={formData.location}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        This location will be shown on your listings or used for deliveries.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/10">
                      <h4 className="text-sm font-bold text-foreground mb-4">Notification Preferences</h4>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Email Notifications</p>
                            <p className="text-xs text-muted-foreground">Updates about your orders and market trends.</p>
                          </div>
                        </div>
                        <Switch 
                          checked={formData.email_notifications}
                          onCheckedChange={handleToggleNotifications}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/20 border-t border-border/10 py-4 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="min-w-[120px] shadow-soft"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
