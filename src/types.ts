export type WineType = "Red" | "White" | "Sparkling" | "Rosé" | "Dessert";

export type CurrencyType = "KRW" | "USD" | "EUR" | "JPY" | "GBP";

export interface Wine {
  id: string;
  name: string;
  producer: string;
  region: string;
  country: string;
  type: WineType;
  vintage: string;
  quantity: number;
  price: number; // Market/Cost price
  currency: CurrencyType;
  priceB2B: number;
  priceB2C: number;
  priceStaff: number;
  location: string;
  importDate: string;
}

export interface Partner {
  id: string;
  name: string;
  type: "Supplier" | "Client";
  category: string;
  contact: string;
  email: string;
  location: string;
}

export type PaymentMethod = "Bank Transfer" | "Company Expense" | "Card" | "Cash";

export interface Transaction {
  id: string;
  date: string; // ISO string with time
  wineId: string;
  wineName: string;
  partnerId: string;
  partnerName: string;
  type: "Inbound" | "Outbound";
  quantity: number;
  unitPrice: number;
  currency: CurrencyType;
  totalPrice: number;
  priceType: "B2B" | "B2C" | "Staff" | "Custom" | "Cost" | "Business";
  paymentMethod?: PaymentMethod;
  cashReceiptIssued?: boolean;
  notes?: string;
  ownerId: string;
}
