import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Loader2, Sparkles, Scale, Percent } from "lucide-react";
import { ProduceListing, CreateListingInput } from "@/hooks/useProduceListings";

const listingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1, "Please select a category"),
  price_per_unit: z.coerce.number().positive("Price must be positive"),
  unit: z.string().min(1, "Please select a unit"),
  quantity_available: z.coerce.number().min(0, "Quantity cannot be negative"),
  harvest_date: z.string().optional(),
  is_bulk_available: z.boolean().default(false),
  bulk_min_quantity: z.coerce.number().min(1, "Minimum quantity must be at least 1").optional(),
  bulk_discount_percentage: z.coerce.number().min(0).max(100, "Discount cannot exceed 100%").optional(),
});

type ListingFormValues = z.infer<typeof listingSchema>;

const CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Grains",
  "Pulses",
  "Dairy & Poultry",
  "Tubers",
  "Spices & Herbs",
  "Other",
];

const UNITS = ["kg", "90kg bag", "50kg bag", "crate", "piece", "bunch", "liter"];

interface ProduceListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: ProduceListing | null;
  onSubmit: (data: CreateListingInput) => Promise<{ error: Error | null; data?: ProduceListing | null }>;
  onUploadImage: (file: File) => Promise<string | null>;
  onSuccess?: () => void;
}

const ProduceListingDialog = ({
  open,
  onOpenChange,
  listing,
  onSubmit,
  onUploadImage,
  onSuccess,
}: ProduceListingDialogProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(listing?.image_url || null);
  const [uploading, setUploading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      name: listing?.name || "",
      description: listing?.description || "",
      category: listing?.category || "",
      price_per_unit: listing?.price_per_unit || 0,
      unit: listing?.unit || "kg",
      quantity_available: listing?.quantity_available || 0,
      harvest_date: listing?.harvest_date || "",
      is_bulk_available: listing?.is_bulk_available || false,
      bulk_min_quantity: listing?.bulk_min_quantity || 100,
      bulk_discount_percentage: listing?.bulk_discount_percentage || 10,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsResizing(true);
    setUploading(true);
    const url = await onUploadImage(file);
    if (url) {
      setImageUrl(url);
    }
    setUploading(false);
    setIsResizing(false);
  };

  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);

  const suggestPrice = async () => {
    const produceName = form.getValues("name");
    const unit = form.getValues("unit");
    if (!produceName) return;

    setIsSuggestingPrice(true);
    try {
      const { data, error } = await supabase.functions.invoke("price-insights", {
        body: { produceType: produceName, unit: unit, mode: "specific" },
      });

      if (error) throw error;
      if (data && data.suggestedPriceMin) {
        const avg = Math.round((data.suggestedPriceMin + data.suggestedPriceMax) / 2);
        form.setValue("price_per_unit", avg);
      }
    } catch (err) {
      console.error("Error suggesting price:", err);
    } finally {
      setIsSuggestingPrice(false);
    }
  };

  const handleSubmit = async (values: ListingFormValues) => {
    setSubmitting(true);
    try {
      const result = await onSubmit({
        name: values.name,
        category: values.category,
        price_per_unit: values.price_per_unit,
        unit: values.unit,
        quantity_available: values.quantity_available,
        description: values.description,
        harvest_date: values.harvest_date,
        image_url: imageUrl || undefined,
        is_bulk_available: values.is_bulk_available,
        bulk_min_quantity: values.bulk_min_quantity,
        bulk_discount_percentage: values.bulk_discount_percentage,
      });
      setSubmitting(false);

      if (!result.error) {
        form.reset();
        setImageUrl(null);
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (err) {
      setSubmitting(false);
      console.error("ProduceListingDialog: Error in handleSubmit:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{listing ? "Edit Listing" : "Add New Listing"}</DialogTitle>
          <DialogDescription>
            {listing
              ? "Update your produce listing details"
              : "Add a new produce item to your listings"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Image</label>
              <div
                className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Product"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrl(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : uploading ? (
                  <div className="py-4">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {isResizing ? "Optimizing Image..." : "Uploading..."}
                    </p>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Click to upload an image
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Organic Tomatoes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your produce..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price_per_unit"
                render={({ field }) => (
                  <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Price per Unit (Ksh)</FormLabel>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={suggestPrice}
                      disabled={isSuggestingPrice || !form.getValues("name")}
                    >
                      {isSuggestingPrice ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      AI Suggest
                    </Button>
                  </div>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity_available"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity Available</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="harvest_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harvest Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bulk Pricing Section */}
            <div className="pt-4 border-t border-border/50">
              <FormField
                control={form.control}
                name="is_bulk_available"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-border/50 p-4 bg-muted/20">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-bold flex items-center gap-2">
                        <Scale className="w-4 h-4 text-primary" />
                        Bulk Pricing
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Offer discounts for institutional buyers
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("is_bulk_available") && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <FormField
                    control={form.control}
                    name="bulk_min_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold flex items-center gap-1.5">
                          Min. Bulk Qty
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="number" {...field} className="pr-12" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">
                              {form.watch("unit")}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bulk_discount_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold flex items-center gap-1.5">
                          Discount %
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="number" {...field} className="pr-8" />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {listing ? "Save Changes" : "Add Listing"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProduceListingDialog;
