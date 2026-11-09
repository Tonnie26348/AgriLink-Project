import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProduceCard } from "@/components/marketplace/ProduceCard";
import React from "react";

const mockListing = {
  id: "1",
  farmer_id: "f1",
  name: "Fresh Tomatoes",
  description: "Organic farm fresh produce item",
  category: "Vegetables",
  price_per_unit: 150,
  unit: "kg",
  quantity_available: 50,
  image_url: null,
  harvest_date: "2026-03-01",
  created_at: "2026-03-01T00:00:00Z",
  is_bulk_available: false,
  bulk_min_quantity: 0,
  bulk_discount_percentage: 0,
  farmer_name: "John Farmer",
  farmer_location: "Nyeri",
  rating: 4.8,
  review_count: 12,
};

describe("ProduceCard Component", () => {
  it("should render produce card details correctly", () => {
    const handleOrder = vi.fn();
    const handleAddToCart = vi.fn();
    const handleMessage = vi.fn();
    const handleCardClick = vi.fn();
    const handleToggleFavorite = vi.fn();

    render(
      <ProduceCard
        listing={mockListing}
        onOrder={handleOrder}
        onAddToCart={handleAddToCart}
        onMessage={handleMessage}
        onCardClick={handleCardClick}
        isFavorite={false}
        onToggleFavorite={handleToggleFavorite}
      />
    );

    expect(screen.getByRole("heading", { name: /fresh tomatoes/i })).toBeInTheDocument();
    expect(screen.getByText(/john farmer/i)).toBeInTheDocument();
    expect(screen.getByText(/150/)).toBeInTheDocument();
    expect(screen.getByText(/nyeri/i)).toBeInTheDocument();
  });

  it("should trigger card click handler", () => {
    const handleOrder = vi.fn();
    const handleAddToCart = vi.fn();
    const handleMessage = vi.fn();
    const handleCardClick = vi.fn();
    const handleToggleFavorite = vi.fn();

    render(
      <ProduceCard
        listing={mockListing}
        onOrder={handleOrder}
        onAddToCart={handleAddToCart}
        onMessage={handleMessage}
        onCardClick={handleCardClick}
        isFavorite={false}
        onToggleFavorite={handleToggleFavorite}
      />
    );

    fireEvent.click(screen.getByRole("heading", { name: /fresh tomatoes/i }));
    expect(handleCardClick).toHaveBeenCalledTimes(1);
  });
});
