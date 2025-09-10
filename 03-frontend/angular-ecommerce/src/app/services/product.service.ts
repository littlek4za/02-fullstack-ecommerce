import { HttpClient } from '@angular/common/http'; //Allows Angular to make HTTP requests (GET, POST, etc.).
import { Injectable } from '@angular/core'; //Marks this class as available for dependency injection.
import { Observable } from 'rxjs'; //Represents asynchronous data (data that will arrive in the future).
import { Product } from '../common/product';
import { map } from 'rxjs/operators' //RxJS operator to transform API response before sending it to the component.
import { ProductCategory } from '../common/product-category';
import { environment } from 'src/environments/environment';

//make service available everywhere in your app, without needing to manually add in to Providers
@Injectable({
  providedIn: 'root'
})
export class ProductService {

  //assign url that api using
  private productBaseUrl = `${environment.myShopApiUrl}/products`
  private categoryBaseUrl = `${environment.myShopApiUrl}/product-category`

  //inject http client
  constructor(private httpClient: HttpClient) { }

  getProductListPaginate(thePage: number, 
                        theCategoryId: number, 
                        thePageSize: number): Observable<GetResponseProducts> { //return as observable product array

    const searchUrl = `${this.productBaseUrl}/search/findByCategoryId?id=${theCategoryId}&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  searchProductListPaginate(thePage: number, 
                        thePageSize: number,
                        theKeyword: string): Observable<GetResponseProducts> { //return as observable product array

    const searchUrl = `${this.productBaseUrl}/search/findByNameContaining?name=${theKeyword}&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProductList(theCategoryId: number): Observable<Product[]> { //return as observable product array

    const searchUrl = `${this.productBaseUrl}/search/findByCategoryId?id=${theCategoryId}`;

    return this.getProducts(searchUrl);
  }

  searchProducts(theKeyword: string): Observable<Product[]> {

    const searchUrl = `${this.productBaseUrl}/search/findByNameContaining?name=${theKeyword}`;

    return this.getProducts(searchUrl);
  }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl) //make a get request to this.baseUrl
      .pipe( //Pipes the response into RxJS operators for transformation.
        map(response => response._embedded.products) //API wraps products inside _embedded.products (HATEOAS style).
      ); //extracts just the products array from the response
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(this.categoryBaseUrl)
      .pipe(
        map(response => response._embedded.productCategory)
      );
  }

  getProduct(theProductId: number): Observable<Product> {

    const productUrl = `${this.productBaseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
  }
}

interface GetResponseProducts { //tell the shape of the API respsonse 
  _embedded: {
    products: Product[];
  };
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number;
  };
}

interface GetResponseProductCategory { //tell the shape of the API respsonse 
  _embedded: {
    productCategory: ProductCategory[];
  };
}