import { useState, useEffect, useCallback } from "react";
import { Order, OrderStatus } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import OrderReviewDialog from "./OrderReviewDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronDown,
  MapPin,
} from "lucide-react";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  processing: {
    label: "Processing",
    icon: Package,
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
};

interface OrderCardProps {
  order: Order;
  viewAs: "buyer" | "farmer";
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
}

const OrderCard = ({ order, viewAs, onUpdateStatus }: OrderCardProps) => {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;
  const availableStatuses = NEXT_STATUS[order.status] || [];

  const checkReviewStatus = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_id", order.id)
      .maybeSingle();
    
    if (data) setHasReviewed(true);
  }, [order.id]);

  useEffect(() => {
    if (order.status === "delivered" && viewAs === "buyer") {
      checkReviewStatus();
    }
  }, [order.id, order.status, viewAs, checkReviewStatus]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={statusConfig.className}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
            {order.status === "delivered" && viewAs === "buyer" && !hasReviewed && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-7 text-[10px] bg-yellow-400/10 text-yellow-600 hover:bg-yellow-400/20 border-yellow-400/20"
                onClick={() => setReviewDialogOpen(true)}
              >
                Rate Order
              </Button>
            )}
            {hasReviewed && (
              <Badge variant="outline" className="h-7 text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                Reviewed
              </Badge>
            )}
          </div>
        </div>

        {/* Buyer/Farmer Info */}
        <div className="mb-3 text-sm">
          {viewAs === "farmer" ? (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Buyer:</span> {order.buyer_name}
            </p>
          ) : (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Seller:</span> {order.farmer_name}
            </p>
          )}
        </div>

        {/* Items */}
        <div className="space-y-2 mb-3">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
            >
              {item.listing_image_url ? (
                <img
                  src={item.listing_image_url}
                  alt={item.listing_name}
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.listing_name || "Unknown Item"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} {item.listing_unit} × Ksh{item.price_per_unit}
                </p>
              </div>
              <p className="text-sm font-medium text-foreground">
                Ksh{item.total_price}
              </p>
            </div>
          ))}
        </div>

        {/* Delivery Address */}
        {order.delivery_address && (
          <div className="mb-3 text-xs text-muted-foreground flex items-start gap-1">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{order.delivery_address}</span>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="mb-3 text-xs text-muted-foreground italic">
            Note: {order.notes}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-lg font-bold text-primary">Ksh{order.total_amount}</p>
          </div>

          {viewAs === "farmer" && availableStatuses.length > 0 && onUpdateStatus && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Update order status">
                  Update Status
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onUpdateStatus(order.id, status)}
                    className="cursor-pointer"
                  >
                    {STATUS_CONFIG[status].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
      
      <OrderReviewDialog
        orderId={order.id}
        farmerId={order.farmer_id}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onSuccess={() => setHasReviewed(true)}
      />
    </Card>
  );
};

export default OrderCard;
