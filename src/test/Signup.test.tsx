import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Signup from "@/pages/Signup";
import React from "react";

// Mock the useAuth hook
const mockSignUp = vi.fn().mockResolvedValue({ error: null });
vi.mock("@/contexts/auth-context-definition", () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    userRole: null,
    loading: false,
  }),
}));

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MockCartProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: MockAuthProvider,
}));

vi.mock("@/contexts/CartContext", () => ({
  CartProvider: MockCartProvider,
}));

vi.mock("@/contexts/cart-context-definition", () => ({
  useCart: () => ({
    items: [],
    getItemCount: () => 0,
    getTotal: () => 0,
    getItemsByFarmer: () => new Map(),
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-language", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: "en",
    setLanguage: vi.fn(),
  }),
}));

describe("Signup Page", () => {
  it("should render signup form with role selection", () => {
    render(
      <MemoryRouter>
        <MockAuthProvider>
          <MockCartProvider>
            <Signup />
          </MockCartProvider>
        </MockAuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /farmer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buyer/i })).toBeInTheDocument();
  });

  it("should require role selection on submit", async () => {
    render(
      <MemoryRouter>
        <MockAuthProvider>
          <MockCartProvider>
            <Signup />
          </MockCartProvider>
        </MockAuthProvider>
      </MemoryRouter>
    );

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    // Signup should not be called if role is not selected
    expect(mockSignUp).not.toHaveBeenCalled();
  });
});
