import { Product } from "./product";

export class CartItem {

    id: number;
    name: string;
    imageUrl: string;
    unitPrice: number;
    quantity: number;

    constructor(theProduct: Product){
        this.id = theProduct.id;
        this.name = theProduct.name;
        this.imageUrl = theProduct.imageUrl;
        this.unitPrice = theProduct.unitPrice;
        
        this.quantity = 1;
    }
}
