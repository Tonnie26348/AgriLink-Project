import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MarketplaceListing } from "@/hooks/useMarketplace";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/auth-context-definition";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Package, MapPin, Minus, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MPesaPaymentDialog from "./MPesaPaymentDialog";

const orderSchema = z.object({
  quantity: z.coerce.number().min(0.1, "Quantity must be at least 0.1"),
  delivery_address: z.string().min(5, "Please enter a valid delivery address"),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderDialogProps {
  listing: MarketplaceListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const OrderDialog = ({ listing, open, onOpenChange, onSuccess }: OrderDialogProps) => {
  const { user, userRole } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      quantity: 1,
      delivery_address: "",
      notes: "",
    },
  });

  const quantity = form.watch("quantity");
  const totalPrice = listing ? quantity * listing.price_per_unit : 0;

  const handleQuantityChange = (delta: number) => {
    const current = form.getValues("quantity");
    const newValue = Math.max(0.1, Math.min(listing?.quantity_available || 1, current + delta));
    form.setValue("quantity", Number(newValue.toFixed(1)));
  };

  const onSubmit = async (data: OrderFormData) => {
    if (!listing) return;

    setIsSubmitting(true);
    const orderId = await createOrder({
      farmer_id: listing.farmer_id,
      items: [
        {
          listing_id: listing.id,
          quantity: data.quantity,
          price_per_unit: listing.price_per_unit,
        },
      ],
      delivery_address: data.delivery_address,
      notes: data.notes,
    });

    setIsSubmitting(false);

    if (orderId) {
      setLastOrderId(orderId);
      form.reset();
      onOpenChange(false);
      setPaymentOpen(true);
      onSuccess?.();
    }
  };

  if (!listing) return null;

  // Show login prompt for non-authenticated users
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to Order</DialogTitle>
            <DialogDescription>
              Please sign in as a buyer to place orders
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Link to="/login" className="w-full">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link to="/signup" className="w-full">
              <Button variant="outline" className="w-full">Create Account</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show message for farmers
  if (userRole === "farmer") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buyer Account Required</DialogTitle>
            <DialogDescription>
              Only buyer accounts can place orders. Switch to a buyer account to purchase produce.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Place Order</DialogTitle>
            <DialogDescription>
              Order fresh produce from {listing.farmer_name}
            </DialogDescription>
          </DialogHeader>

          {/* Product Summary */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
            {listing.image_url ? (
              <img
                src={listing.image_url}
                alt={listing.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{listing.name}</h4>
              <p className="text-sm text-muted-foreground">{listing.category}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />
                {listing.farmer_location}
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">Ksh{listing.price_per_unit}</p>
              <p className="text-xs text-muted-foreground">per {listing.unit}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Quantity Selector */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Quantity ({listing.unit}) - {listing.quantity_available} available
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 0.1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          min="0.1"
                          max={listing.quantity_available}
                          className="w-24 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= listing.quantity_available}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Address */}
              <FormField
                control={form.control}
                name="delivery_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Address</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter your full delivery address..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Any special requests or instructions..."
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Order Total */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                <span className="font-medium text-foreground">Order Total</span>
                <span className="text-2xl font-bold text-primary">Ksh{totalPrice.toFixed(2)}</span>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>Place Order - Ksh{totalPrice.toFixed(2)}</>
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {lastOrderId && (
        <MPesaPaymentDialog
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          orderId={lastOrderId}
          amount={totalPrice}
          onSuccess={() => navigate("/buyer/dashboard")}
        />
      )}
    </>
  );
};

export default OrderDialog;
