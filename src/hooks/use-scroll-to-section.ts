import { useNavigate } from "react-router-dom";
import { useLayoutEffect } from "react";

export const useScrollToSection = () => {
  const navigate = useNavigate();
  // Ensure this matches the basename in BrowserRouter in App.tsx
  const basename = ""; 

  const scrollToSection = (sectionId: string) => {
    console.log("scrollToSection called for:", sectionId);
    console.log("Current pathname:", window.location.pathname);

    // Check if current path is not the home path (considering basename)
    // or if the current path is the home path itself (e.g., /)
    if (!window.location.pathname.startsWith(basename) || window.location.pathname === "/") {
      console.log("Navigating to home page to scroll.");
      navigate("/");
      sessionStorage.setItem("scrollToSectionId", sectionId);
    } else {
      console.log("Already on home page, attempting to scroll.");
      const element = document.getElementById(sectionId);
      if (element) {
        console.log("Element found, scrolling to:", sectionId);
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        console.log("Element not found:", sectionId);
      }
    }
  };

  useLayoutEffect(() => {
    const sectionId = sessionStorage.getItem("scrollToSectionId");
    if (sectionId) {
      sessionStorage.removeItem("scrollToSectionId");
      console.log("useLayoutEffect: Found sectionId in sessionStorage:", sectionId);
      const element = document.getElementById(sectionId);
      if (element) {
        console.log("useLayoutEffect: Element found, scrolling to:", sectionId);
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        console.log("useLayoutEffect: Element not found:", sectionId);
      }
    }
  }, [navigate]);

  return scrollToSection;
};
