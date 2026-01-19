export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    reference: string;
    redirectUrl?: string;
    status: "pending" | "success" | "failed";
    transactionRef: string;
    paymentId: string;
  };
  requiresOtp?: boolean;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
}

interface CardPaymentDetails {
  cardNumber: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
  pin: string;
  currency: string;
  customerId: string;
}

export interface CardPaymentRequest {
  cardDetails: CardPaymentDetails;
  requiresOtp?: boolean;
  paymentId?: string;
  amount: number;
}
