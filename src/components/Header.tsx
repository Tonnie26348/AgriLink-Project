import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf, LogOut, Tractor, ShoppingBag, UserCircle, ClipboardList, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/auth-context-definition";
import CartSheet from "@/components/cart/CartSheet";
import { useScrollToSection } from "@/hooks/use-scroll-to-section";
import MessagesDialog from "@/components/marketplace/MessagesDialog";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const scrollToSection = useScrollToSection();

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Features", to: "/features" },
    { label: "How It Works", to: "/how-it-works" },
    { label: "AI Insights", to: "/ai-insights" },
    { label: "Impact", to: "/impact" },
    { label: "Marketplace", to: "/marketplace" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow duration-300">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              Agri<span className="text-primary">Link</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.to.startsWith("/#")) {
                const sectionId = link.to.substring(2);
                return (
                  <a
                    key={link.label}
                    href={link.to}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(sectionId);
                    }}
                    className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <CartSheet />
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                  {userRole === "farmer" ? (
                    <Tractor className="w-4 h-4 text-primary" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 text-secondary" />
                  )}
                  <span className="text-sm font-medium text-foreground capitalize">
                    {userRole || "User"}
                  </span>
                </div>
                <Link to={userRole === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard"}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Messages"
                  onClick={() => setIsMessagesOpen(true)}
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
                <Link to="/orders">
                  <Button variant="ghost" size="icon" title="Orders">
                    <ClipboardList className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" title="Profile">
                    <UserCircle className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                if (link.to.startsWith("/#")) {
                  const sectionId = link.to.substring(2);
                  return (
                    <a
                      key={link.label}
                      href={link.to}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(sectionId);
                        setIsOpen(false);
                      }}
                      className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg font-medium transition-all duration-200"
                    >
                      {link.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg font-medium transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 px-4 border-t border-border mt-2">
                <CartSheet />
              </div>
              <div className="flex flex-col gap-2 pt-4 px-4 border-t border-border mt-2">
                {user ? (
                  <>
                    <div className="flex items-center justify-center gap-2 py-2">
                      {userRole === "farmer" ? (
                        <Tractor className="w-4 h-4 text-primary" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-secondary" />
                      )}
                      <span className="text-sm font-medium text-foreground capitalize">
                        {userRole || "User"}
                      </span>
                    </div>
                    <Link to={userRole === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard"}>
                      <Button variant="ghost" className="w-full justify-center">Dashboard</Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center"
                      onClick={() => {
                        setIsMessagesOpen(true);
                        setIsOpen(false);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </Button>
                    <Link to="/orders">
                      <Button variant="ghost" className="w-full justify-center">Orders</Button>
                    </Link>
                    <Link to="/profile">
                      <Button variant="ghost" className="w-full justify-center">Profile</Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-center" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-center" asChild>
                      <Link to="/login">Log In</Link>
                    </Button>
                    <Button variant="default" className="w-full justify-center" asChild>
                      <Link to="/signup">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <MessagesDialog open={isMessagesOpen} onOpenChange={setIsMessagesOpen} />
    </nav>
  );
};

export default Header;
