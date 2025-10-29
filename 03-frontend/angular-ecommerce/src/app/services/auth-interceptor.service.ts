import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { from, lastValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor{

  constructor(private auth:AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request,next)); //from is to convert promise to observable
  }
  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>>{
    
    // define the list of url that need to inject token
    const secureEndpoints = [`${environment.myShopApiUrl}/order`];

    // request.urlWithParams is 
    // intercept(
    //   HttpRequest {
    //     method: "POST",
    //     url: "http://localhost:8080/api/order",
    //     urlWithParams: "http://localhost:8080/api/order",
    //     body: { item: "coffee" },
    //     headers: {}
    //   }, 
    //   HttpHandler { handle() { ... } }
    // );
    if(secureEndpoints.some((url) => request.urlWithParams.includes(url))){ //if any of the request.urlWithParams includes the array secureEndpoints then return true
      await this.auth.getAccessTokenSilently().forEach((token)=>{
        console.log('Access Token: ', token);
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      });
    }

    return await lastValueFrom(next.handle(request)); //lastValueFrom convert observable to promise
  }
}
