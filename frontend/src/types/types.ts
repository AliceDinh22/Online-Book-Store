export interface AuthState {
    token: string | null;
    user: any | null;
    role: string | null;
}

export interface BookDTO {
    id: number;
    title: string;
    author: string;
    publisher?: string;
    category?: string;
    description: string;
    originalPrice: number; 
    discountPrice?: number;  
    stock: number;
    sold?: number;
    yearPublished?: number;
    rating?: number;
    isDeleted?: boolean;
    files?: File[];
    coverImages?: string[];
}


export interface UserDTO {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address?: string;
    city?: string;
    active?: boolean;
    role: string;
}

export interface PasswordResetForm {
    password: string;
    password2: string;
}

export interface CartItemDTO {
    id?: number;
    book: BookDTO;
    quantity: number;
}

export interface CartDTO {
    id?: number;
    userId?: number;
    items: CartItemDTO[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CartItemCardProps {
    userId: number;
    item: CartItemDTO;
    onUpdate: (bookId: number, newQuantity: number) => void;
    onRemove: (bookId: number) => void;
    checked: boolean;
    onSelect: (bookId: number, checked: boolean) => void;
}

export interface CartListProps {
    cart: CartItemDTO[];
    userId: number;
    onUpdate: (bookId: number, delta: number) => void;
    onRemove: (bookId: number) => void;
}

export interface ReviewDTO {
    id: number;
    rating: number;
    message: string;
    date: string;
    userId: number;
    firstName: string;
    lastName: string;
}

export interface BookInfoProps {
    book: BookDTO;
    userId?: number;
    addToCart: (book: BookDTO, quantity: number) => Promise<void>;
}

export interface BookReviewsProps {
    bookId: number;
    userId?: number;
    reviews: ReviewDTO[];
    loading: boolean;
    onAddReview: (values: { rating: number; message: string }) => Promise<void>;
    form: any;
    rating?: number;
}

export interface CheckoutState {
    cart: CartItemDTO[];
    totalPrice: number;
    userId: number;
}

export interface PaymentDTO {
    id?: number;
    amount: number;
    currency?: string;
    method: string;
    status?: string;
    orderId?: number;
    transactionId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderDTO {
    id?: number;
    date?: string; 
    totalPrice: number;
    status: string;
    address: string;
    city: string;
    phoneNumber: string;
    userId: number;
    username?: string;         
    items?: OrderItemDTO[];
    cartItemIds?: number[];
    payment?: PaymentDTO;
}


export interface OrderItemDTO {
  id?: number;
  bookId: number;
  bookTitle?: string;
  quantity: number;
  price: number;
  paymentDTO?: PaymentDTO;
  bookUrl?: string;
}


