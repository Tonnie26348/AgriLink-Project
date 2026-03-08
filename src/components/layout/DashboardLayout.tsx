import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context-definition";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { 
  Menu, 
  LogOut, 
  UserCircle, 
  ChevronRight, 
  Leaf, 
  Home,
  Bell
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  role: "farmer" | "buyer";
}

const DashboardLayout = ({ children, navItems, role }: DashboardLayoutProps) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/AgriLink/";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r border-border/40">
      <div className="p-6 border-b border-border/10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300",
            role === "farmer" ? "bg-gradient-to-br from-primary to-primary/80" : "bg-gradient-to-br from-secondary to-secondary/80"
          )}>
            <Leaf className={cn(
              "w-6 h-6 fill-current",
              role === "farmer" ? "text-primary-foreground" : "text-secondary-foreground"
            )} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-display font-bold text-foreground leading-none">
              Agri<span className={role === "farmer" ? "text-primary" : "text-secondary"}>Link</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
              {role} Portal
            </span>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? (role === "farmer" 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                        : "bg-secondary text-secondary-foreground shadow-md shadow-secondary/20")
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "" : (role === "farmer" ? "group-hover:text-primary" : "group-hover:text-secondary")
                )} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-border/10 space-y-2">
        <Link to="/profile" onClick={() => setIsMobileOpen(false)}>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12 text-muted-foreground hover:text-foreground">
            <UserCircle className="w-5 h-5" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-bold">Profile</span>
              <span className="text-[10px] opacity-60">Manage account</span>
            </div>
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start gap-3 rounded-xl h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-bold">Log Out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-background/80 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-4 sticky top-0 z-50 transition-all duration-300">
          <Link to="/" className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shadow-soft",
              role === "farmer" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}>
              <Leaf className="w-5 h-5 fill-current" />
            </div>
            <span className="font-display font-bold text-lg">AgriLink</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-6 h-6 text-muted-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Desktop Top Nav */}
        <header className="hidden lg:flex h-16 bg-background/40 backdrop-blur-md border-b border-border/10 items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-muted-foreground" />
            <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {location.pathname.split('/').pop()?.replace('-', ' ')}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="rounded-xl h-9 border-border/50 gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Active Session</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-background">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          <div className="container mx-auto px-4 md:px-8 py-8 animate-fade-in">
            {children}
          </div>
          
          {/* Simple Dashboard Footer */}
          <footer className="py-8 border-t border-border/10 mt-auto bg-background/40">
            <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                © {new Date().getFullYear()} AgriLink {role} Portal
              </p>
              <div className="flex gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary transition-colors">Security</a>
                <a href="#" className="hover:text-primary transition-colors">Support</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
