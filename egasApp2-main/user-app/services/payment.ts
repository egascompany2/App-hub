import { api } from "@/lib/api";
import {
  CardPaymentRequest,
  PaymentResponse,
  PaymentVerificationResponse,
} from "@/types/payment";

interface PaymentErrorResponse {
  error?: string;
  message?: string;
  code?: string;
  details?: string;
}

interface InterswitchError {
  error?: string;
  message?: string;
  responseCode?: string;
  responseMessage?: string;
  code: any;
}

class PaymentService {
  private formatErrorMessage(error: any): string {
    console.log("xxxxxerror", error);
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return "The payment request timed out. Please try again.";
      }
      if (error.message.includes("Network Error")) {
        return "Please check your internet connection and try again.";
      }
      return "Unable to reach payment service. Please try again later.";
    }

    // Handle Interswitch specific error formats
    const interswitchError = error.response?.data as InterswitchError;
    if (interswitchError?.responseMessage) {
      return this.translateInterswitchError(interswitchError);
    }

    // Handle our API's error format
    const apiError = error.response?.data as PaymentErrorResponse;
    if (apiError?.error || apiError?.message) {
      return apiError.error || apiError.message || "Payment processing failed";
    }

    // Handle network/connection errors
    if (!error.response) {
      return "Unable to connect to payment service";
    }

    // Handle HTTP status code specific errors
    switch (error.response.status) {
      case 400:
        return "Invalid payment details. Please check your information and try again.";
      case 401:
        return "Payment authentication failed. Please try again.";
      case 403:
        return "Payment declined. Please contact your bank or try a different card.";
      case 422:
        return "Invalid card information. Please check your card details.";
      case 503:
        return "Payment service is temporarily unavailable. Please try again in a few moments.";
      default:
        return "Payment processing failed. Please try again later.";
    }
  }

  private translateInterswitchError(error: InterswitchError): string {
    //Interswitch specific error codes
    const errorMessages: Record<string, string> = {
      Z6: "Transaction declined. Please contact your bank.",
      B0: "Invalid card information. Please check your card details.",
      "06": "Insufficient funds. Please try a different card.",
      "12": "Invalid transaction. Please check your card details.",
      "14": "Invalid card number. Please check and try again.",
      "51": "Insufficient funds. Please try a different card.",
      "54": "Expired card. Please use a different card.",
      "55": "Incorrect PIN. Please try again.",
      "56": "Invalid card. Please try a different card.",
      "58": "Transaction not permitted on this card.",
      "91": "Payment service temporarily unavailable. Please try again later.",
      "96": "System error. Please try again later.",
    };

    const code = error.responseCode || error.code;
    return (
      errorMessages[code] ||
      error.responseMessage ||
      error.message ||
      "Payment processing failed"
    );
  }

  async initiateCardPayment(
    data: CardPaymentRequest
  ): Promise<PaymentResponse> {
    try {
      // Format the request according to server expectations
      const formattedData = {
        customerId: data.cardDetails.customerId,
        amount: data.amount,
        currency: data.cardDetails.currency || "NGN",
        cardNumber: data.cardDetails.cardNumber.replace(/\s/g, ""),
        expiryMonth: data.cardDetails.expiryMonth,
        expiryYear: data.cardDetails.expiryYear,
        cvv: data.cardDetails.cvv,
        pin: data.cardDetails.pin,
      };

      const response = await api.post("/card-payment/purchase", formattedData);
      console.log("payment response", response.data);
      return response.data;
    } catch (error: any) {
      console.log("payment error", error);
      const errorMessage = this.formatErrorMessage(error);
      console.error("Payment Error:", {
        message: errorMessage,
        originalError: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(error);
    }
  }

  async authenticateOtp(
    paymentId: string,
    transactionId: string,
    otp: string
  ): Promise<PaymentResponse> {
    try {
      const response = await api.post("card-payment/verify-otp", {
        paymentId,
        transactionId,
        otp,
      });
      console.log(response);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await api.get(`/payments/verify/${reference}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
