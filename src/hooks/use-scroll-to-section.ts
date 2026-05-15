import { useNavigate } from "react-router-dom";
import { useLayoutEffect } from "react";

export const useScrollToSection = () => {
  const navigate = useNavigate();
  // Ensure this matches the basename in BrowserRouter in App.tsx
  const basename = ""; 

  const scrollToSection = (sectionId: string) => {
    // Check if current path is not the home path (considering basename)
    // or if the current path is the home path itself (e.g., /)
    if (!window.location.pathname.startsWith(basename) || window.location.pathname === "/") {
      navigate("/");
      sessionStorage.setItem("scrollToSectionId", sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useLayoutEffect(() => {
    const sectionId = sessionStorage.getItem("scrollToSectionId");
    if (sectionId) {
      sessionStorage.removeItem("scrollToSectionId");
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [navigate]);

  return scrollToSection;
};
