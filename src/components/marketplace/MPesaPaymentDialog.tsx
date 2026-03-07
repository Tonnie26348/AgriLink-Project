import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, CheckCircle2, AlertCircle } from "lucide-react";

interface MPesaPaymentDialogProps {
  orderId: string;
  amount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const MPesaPaymentDialog = ({
  orderId,
  amount,
  open,
  onOpenChange,
  onSuccess,
}: MPesaPaymentDialogProps) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"input" | "processing" | "confirming" | "success">("input");
  const [transactionId, setTransactionId] = useState("");

  const handleInitiatePayment = async () => {
    if (!phoneNumber.match(/^(?:254|\+254|0)?(7|1)\d{8}$/)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid Kenyan phone number.",
        variant: "destructive",
      });
      return;
    }

    setStep("processing");
    
    try {
      const { data, error } = await supabase.functions.invoke("mpesa-stkpush", {
        body: {
          amount: amount,
          phoneNumber: phoneNumber,
          orderId: orderId,
        },
      });

      if (error) throw error;

      if (data.ResponseCode === "0") {
        setStep("confirming");
        setTransactionId(data.MerchantRequestID);
        toast({
          title: "STK Push Sent",
          description: "Please check your phone for the M-Pesa prompt.",
        });
      } else {
        throw new Error(data.ResponseDescription || "Failed to initiate M-Pesa payment");
      }
    } catch (error: any) {
      console.error("M-Pesa error:", error);
      toast({
        title: "Payment initiation failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setStep("input");
    }
  };

  const handleConfirmPayment = async () => {
    setStep("processing");

    try {
      // Record the payment in Supabase
      const { error } = await supabase.from("payments").insert({
        order_id: orderId,
        transaction_id: transactionId,
        amount: amount,
        status: "completed",
        phone_number: phoneNumber,
        provider: "mpesa"
      });

      if (error) throw error;

      // Update order status if needed (optional, depends on flow)
      
      setStep("success");
      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
        // Reset for next time
        setStep("input");
        setPhoneNumber("");
      }, 2000);

    } catch (error: unknown) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      setStep("input");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/512px-M-PESA_LOGO-01.svg.png" alt="M-Pesa" className="h-6 object-contain" />
            M-Pesa Payment
          </DialogTitle>
          <DialogDescription>
            Complete your order of Ksh{amount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {step === "input" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  You will receive an STK push on your phone to authorize the payment.
                </p>
              </div>
              <Button className="w-full bg-[#39b54a] hover:bg-[#2e943c] text-white" onClick={handleInitiatePayment}>
                Pay Ksh{amount.toLocaleString()}
              </Button>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#39b54a]" />
              <p className="font-medium">Processing your request...</p>
              <p className="text-sm text-muted-foreground">Check your phone for the M-Pesa prompt.</p>
            </div>
          )}

          {step === "confirming" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-[#39b54a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-[#39b54a]" />
              </div>
              <h3 className="font-bold text-lg">STK Push Sent</h3>
              <p className="text-sm text-muted-foreground">
                Please enter your M-Pesa PIN on your phone. Once done, click the button below to confirm.
              </p>
              <div className="p-3 bg-muted rounded-lg text-xs font-mono">
                Transaction ID: {transactionId}
              </div>
              <Button className="w-full bg-[#39b54a] hover:bg-[#2e943c] text-white" onClick={handleConfirmPayment}>
                I have paid
              </Button>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="font-bold text-xl text-green-600">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">Your order is now being processed.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MPesaPaymentDialog;
