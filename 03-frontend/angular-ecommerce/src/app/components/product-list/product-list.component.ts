import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {


  products: Product[] = []; //to be use dispaly in html
  currentCategoryId: number = 1; //to be use dispaly in html
  previousCategoryId: number = 1;
  listTitleName: string = "";
  searchMode: boolean = false;

  //property for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;
 
  previousKeyword: string = "";


  constructor(private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => { //keep listen to changes and run the code when there is changes
      this.listProducts();
    })
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword'); //check if there is keyword from search(pass by route in search component)
    if (this.searchMode) {
      this.handleSearchProducts();
    }
    else {
      this.handleListProducts();
    }
  }

  handleSearchProducts() {

    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;


    //if we have a different keyword than previous
    //then set thePageNumber to 1

    if(this.previousKeyword != theKeyword){
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;
    console.log(`keyword=${theKeyword}, previousKeyword =${this.previousKeyword}`)

    this.productService.searchProductListPaginate(
      this.thePageNumber - 1,
      this.thePageSize,
      theKeyword).subscribe(
        this.processResultForPaginate()
        // data => {
        //   this.products = data._embedded.products;
        //   this.thePageNumber = data.page.number + 1;
        //   this.thePageSize = data.page.size;
        //   this.theTotalElements = data.page.totalElements;
        // }
      );

    this.listTitleName = `Search Result`;
  }

  handleListProducts() {
    //check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      //get the "id" param string. convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
      // get the "name" param string
      const categoryName = this.route.snapshot.paramMap.get('name')!;
      this.listTitleName = `Category: ${categoryName}`;
    }
    else {
      // not category id available ... default to category id 1
      this.currentCategoryId = 1;
      this.listTitleName = 'Category: Books';
    }

    // Check if we have a different category than previous
    // Note: Angular will reuse a component if it is currently being viewed
    // if we have a different category id than previous
    // then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;
    console.log(`currentCategoryId=${this.currentCategoryId}`, `previousCategoryId=${this.previousCategoryId}`);



    //now get the product for the given id
    this.productService.getProductListPaginate(
      this.thePageNumber - 1,
      this.currentCategoryId,
      this.thePageSize).subscribe( //subscribe will listen, when data comes it will run the function
        this.processResultForPaginate()
        // data => {
        //   this.products = data._embedded.products;
        //   this.thePageNumber = data.page.number + 1;
        //   this.thePageSize = data.page.size;
        //   this.theTotalElements = data.page.totalElements;
        // }
      );
  }

  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  processResultForPaginate(){
    return (data:any) => {
          this.products = data._embedded.products;
          this.thePageNumber = data.page.number + 1;
          this.thePageSize = data.page.size;
          this.theTotalElements = data.page.totalElements;
        }
  }

  addToCart(theProduct: Product){

    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);

    //TO DO
    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);

  }
}
