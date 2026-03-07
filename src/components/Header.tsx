import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Menu, Leaf, LogOut, Tractor, ShoppingBag, UserCircle, ClipboardList, MessageSquare, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context-definition";
import CartSheet from "@/components/cart/CartSheet";
import NotificationsCenter from "@/components/NotificationsCenter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useScrollToSection } from "@/hooks/use-scroll-to-section";
import MessagesDialog from "@/components/marketplace/MessagesDialog";

const Header = () => {
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollToSection = useScrollToSection();

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Features", to: "/#features" },
    { label: "How It Works", to: "/#how-it-works" },
    { label: "AI Insights", to: "/#ai-insights" },
    { label: "Impact", to: "/#impact" },
    { label: "Marketplace", to: "/marketplace" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleNavClick = (to: string) => {
    if (to.startsWith("/#")) {
      const sectionId = to.substring(2);
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => scrollToSection(sectionId), 100);
      } else {
        scrollToSection(sectionId);
      }
    } else {
      navigate(to);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-105">
              <Leaf className="w-6 h-6 text-primary-foreground fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-display font-bold text-foreground leading-none">
                Agri<span className="text-primary">Link</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase hidden sm:block">
                Farm to Market
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-secondary/5 px-2 py-1.5 rounded-full border border-secondary/10">
            {navLinks.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-full px-4 font-medium transition-all"
                onClick={() => handleNavClick(link.to)}
              >
                {link.label}
              </Button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <CartSheet />
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-border/50">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                  {userRole === "farmer" ? (
                    <Tractor className="w-4 h-4 text-primary" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 text-secondary" />
                  )}
                  <span className="text-sm font-semibold text-foreground capitalize">
                    {userRole}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(userRole === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard")} title="Dashboard">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      {userRole === "farmer" ? <Tractor className="w-4 h-4 text-secondary" /> : <ShoppingBag className="w-4 h-4 text-secondary" />}
                    </div>
                  </Button>
                  <NotificationsCenter />
                  <ThemeToggle />
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsMessagesOpen(true)} title="Messages">
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/profile")} title="Profile">
                    <UserCircle className="w-5 h-5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={handleSignOut} title="Log Out">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-3 border-l border-border/50">
                <Button variant="ghost" className="font-semibold" onClick={() => navigate("/login")}>
                  Log In
                </Button>
                <Button className="font-semibold shadow-soft hover:shadow-glow transition-all" onClick={() => navigate("/signup")}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <NotificationsCenter />
            <CartSheet />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[380px] border-l border-border/50 backdrop-blur-xl bg-background/95">
                <SheetHeader className="text-left pb-6 border-b border-border/50">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-display font-bold text-xl">AgriLink</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col gap-1 py-6">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.label}>
                      <Button
                        variant="ghost"
                        className="justify-between w-full text-base font-medium h-12 hover:bg-secondary/5 hover:text-secondary group"
                        onClick={() => handleNavClick(link.to)}
                      >
                        {link.label}
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                      </Button>
                    </SheetClose>
                  ))}
                </div>

                {user ? (
                  <div className="mt-auto pt-6 border-t border-border/50">
                    <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Signed in as</p>
                        <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <SheetClose asChild>
                        <Button 
                          className="w-full justify-center" 
                          onClick={() => navigate(userRole === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard")}
                        >
                          Dashboard
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button 
                          variant="outline"
                          className="w-full justify-center" 
                          onClick={() => setIsMessagesOpen(true)}
                        >
                          Messages
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 col-span-2" 
                          onClick={handleSignOut}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Log Out
                        </Button>
                      </SheetClose>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto pt-6 border-t border-border/50 grid gap-3">
                    <SheetClose asChild>
                      <Button className="w-full h-12 text-base shadow-soft" onClick={() => navigate("/signup")}>
                        Get Started
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="outline" className="w-full h-12 text-base" onClick={() => navigate("/login")}>
                        Log In
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <MessagesDialog open={isMessagesOpen} onOpenChange={setIsMessagesOpen} />
    </nav>
  );
};

export default Header;
