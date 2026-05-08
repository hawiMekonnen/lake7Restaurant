export enum OrderStatus {
  RECEIVED = 'Received',
  PREPARED = 'Prepared',
  OUT_FOR_DELIVERY = 'OutForDelivery',
  DELIVERED = 'Delivered',
}


export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Main Course' | 'Drinks' | 'Desserts' | 'Appetizers';
  availability: 'available' | 'out_of_stock';
  imageUrl: string;
  stockLevel: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  driverId?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
}

export interface InventoryItem {
  id: string;
  name: string;
  stockLevel: number;
  unit: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  status: 'online' | 'offline' | 'busy';
}

export interface Feedback {
  id: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: any;
}
