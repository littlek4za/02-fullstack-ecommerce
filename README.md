# Project Name
Full-stack Ecommerce Website 

## Description
This is a full-stack ecommerce application that demonstrates:
* Customer registration and login
* Browsing products and viewing product details
* Shopping cart functionality and order placement
* Payment processing with Stripe
* Secured API endpoints using Auth0 OAuth2
* Fully responsive frontend built with Angular
* HTTPS support for local development

This project serves as a starter template for building more advanced ecommerce platforms.

## 
* **Backend:** Java, Spring Boot (Spring Data JPA, Spring Data REST, OAuth2 Resource Server)
* **Frontend:** Angular 14, Bootstrap 5, Auth0 Angular SDK
* **Database:** MySQL
* **Payment Gateway:** Stripe
* **Tools:** Tools: Maven, IntelliJ IDEA / Visual Studio Code, Node.js, Angular CLI

## Prerequisites
Make sure the following are installed on your system:
* Java 17+
* Maven 3.6+
* Node.js and npm
* MySQL Server and Workbench
* Angular CLI: install project dependencies with `npm install`, then run Angular commands using the local CLI (`npx ng serve`)


---
## Database Setup
1. Start MySQL Workbench and create a connection to your local MySQL server.
2. Open the provided SQL script, included in `01-starter-files/db-scripts`
3. Run the script `01-create-user.sql`to create user as ecommerceapp, with password ecommerceapp.
4. Run the remaining script, to create the required entity in MySQL:
    * `02-create-products.sql`
    * `03-countries-and-states.sql`
    * `04-create-order-tables.sql`

## Auth0 Account Setup
### Overview of Steps
1. Create a developer account on Auth0
    * Open: https://developer.auth0.com/
    * Sign up

2. Create Application and provide Application Information
    * In Auth0 Developer Account, select Applications > + Create Application
    * Name: My Angular App
    * Choose Single Page Web Applications
    * Click Create Application and Add Application URIs:
        * Allowed Callback URLs: https://<YOUR_FRONTEND_HOST>:<YOUR_FRONTEND_PORT>/login/callback (example: http://localhost:4200/login/callback)
        * Allowed Logout URLs: https://<YOUR_FRONTEND_HOST>:<YOUR_FRONTEND_PORT> (example: http://localhost:4200/)
        * Allowed Web Origins: https://<YOUR_FRONTEND_HOST>:<YOUR_FRONTEND_PORT> (example: http://localhost:4200/)
        * Allowed Origins (CORS): https://<YOUR_FRONTEND_HOST>:<YOUR_FRONTEND_PORT> (example: http://localhost:4200/)
        ![alt text](<docs/images/Auth0 Account Setup/00.png>)
        ![alt text](<docs/images/Auth0 Account Setup/01.png>)
        ![alt text](<docs/images/Auth0 Account Setup/02.png>)
        ![alt text](<docs/images/Auth0 Account Setup/03.png>)
        ![alt text](<docs/images/Auth0 Account Setup/04.png>)
    * Click Save

3. Create API
    * In Auth0 Developer Account, select Applications > API > + Create API
    * Name: My Spring Boot App
    * Identifier: Any name as an identifier (example: my-ecommerce-api)
    * Click Create API
    ![alt text](<docs/images/Auth0 Account Setup/05.png>)
    ![alt text](<docs/images/Auth0 Account Setup/06.png>)
    * Click Create
    
4. Install Auth0 dependencies
    * Run the following command in the Angular app console:
    ```bash
    npm install @auth0/auth0-angular
    ```

5. Update my-app-config.ts.example
    * Edit `03-frontend/angular-ecommerce/src/app/config/my-app-config.ts.example` file
    
    ```typescript
    export default {
    auth: {
        domain: "<YOUR_AUTH0_DOMAIN>",
        clientId: "<YOUR_AUTH0_CLIENT_ID>",
        authorizationParams: {
        redirect_uri: "https://<YOUR_FRONTEND_HOST>:<YOUR_FRONTEND_PORT>/login/callback",
        audience: "<YOUR_API_AUDIENCE>",
        },
    },
    httpInterceptor: {
        allowedList: [
        'https://<YOUR_BACKEND_HOST>:<YOUR_BACKEND_PORT>/api/orders/**',
        'https://<YOUR_BACKEND_HOST>:<YOUR_BACKEND_PORT>/api/checkout/purchase'
        ],
    },
    }
    ```

    * Update Auth0 configuration in my-app-config.ts.example:
        * `<YOUR_AUTH0_DOMAIN>` → Your Auth0 domain (example: dev-XXXXXX.us.auth0.com)
        * `<YOUR_AUTH0_CLIENT_ID>` → Your Auth0 client ID
        * `<YOUR_FRONTEND_HOST>` → Your Frontend Host (example: localhost)
        * `<YOUR_FRONTEND_PORT>` → Your Frontend Port (example: 4200)
        * `<YOUR_API_AUDIENCE>` → Your Auth0 API audience (Your auth0 identifier) 
        * `<YOUR_BACKEND_HOST>` → Host of Spring Boot backend (example: localhost)
        * `<YOUR_BACKEND_PORT>` → Port of backend (example: 8443)
    * Rename the file from `my-app-config.ts.example` to `my-app-config.ts`

## Stripe Account Setup
1. Create a developer account on Stripe
    * Open: https://stripe.com/
    * Sign up

2. After sign up, goes to dashboard and get your Publishable key and Secret Key.
![alt text](<docs/images/Stripe Account Setup/00.png>)

## Generate Self Signed Certificate for https usage
For local development over HTTPS, you need a self-signed SSL certificate.
### Frontend
1. For windows user, install Win62 OpenSSL Light version from https://slproweb.com/products/Win32OpenSSL.html
2. Update your Environment Variables
    * go to Control Panel > System > Advanced System Settings > Environment Variables
    * Under system variables section, select `PATH` and press edit
    * add `c:\Program Files\OpenSSL-Win64\bin;` at the beginning of the path
    * Click OK to save changes
3. Create a new file named: `localhost.conf` at `03-frontend/angular-ecommerce` , or you can use the existing file, just rename `localhost.conf.example` to `localhost.conf` and replace with your parameter.
```bash
[req]
# Don't prompt the user when running openssl certificate generation
prompt = no

# Reference to the section containing the Distinguished Name (information about your company/entity)
distinguished_name = dn

[dn]
# Country, State and Locality (city)
C = YourCountry
ST = YourState
L = YourCity

# Organization and Organizational Unit (department name, group name)
O = MyProject
OU = DevTeam

# Common Name (fully qualified domain name of your website server)
CN = localhost
```
  * CN is pointing to your frontend host, modify this if you have different ip then localhost
4. Open Terminal at `03-frontend/angular-ecommerce` and run the following command
```bash
openssl req -x509 -out ssl-localhost\localhost.crt -keyout ssl-localhost\localhost.key -newkey rsa:2048 -nodes -sha256 -days 365 -config localhost.conf
```
5. Check and verify if there is `localhost.crt` and `localhost.key` generated at `03-frontend/angular-ecommerce/ssl-localhost`
  * View the contents of your certificate using the following command
  ```bash
  openssl x509 -noout -text -in ssl-localhost/localhost.crt
  ```
### Backend
1. Open Terminal at `02-backend/spring-boot-ecommerce` and run the following command
```bash
keytool -genkeypair -alias springbootecommerce -keystore src/main/resources/my-keystore.p12 -keypass secret -storeType PKCS12 -storepass secret -keyalg RSA -keysize 2048 -validity 365 -dname "C=YourCountry, ST=YourState, L=YourCity, O=MyProject, OU=DevTeam, CN=localhost" -ext "SAN=dns:localhost"
```
  * change the keypass and storepass to your desired key (recommend to be same, Spring Boot by default only needs storepass unless keypass differs)
  * make sure -dname info to be same as info in  `03-frontend/angular-ecommerce/localhost.conf`
  * CN and SAN=dns: is pointing to your backend host, modify this if you have different ip then localhost

2. Check and verify if there is new file `my-keystore.p12` at `02-backend/spring-boot-ecommerce/src/main/resources/`
  * View the content of your keystore using the following command
  ```bash
  keytool -list -v -alias luv2code -keystore src/main/resources/luv2code-keystore.p12 -storepass secret
  ```


## Spring Boot Application Properties Setup
### Edit `02-backend/spring-boot-ecommerce/src/main/resources/application.properties.example` file
```properties
############################################################
# Database configuration
############################################################
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://<YOUR_DB_HOST>:<YOUR_DB_PORT>/full-stack-ecommerce?useSSL=false&useUnicode=yes&characterEncoding=UTF-8&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=<YOUR_DB_USERNAME>
spring.datasource.password=<YOUR_DB_PASSWORD>

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

############################################################
# Spring Data REST
############################################################
spring.data.rest.base-path=/api
allowed.origins=https://<YOUR_FRONTEND_HOST>:<YOUR_FRONTEND_PORT>
spring.data.rest.detection-strategy=ANNOTATED

############################################################
# Resource server (API protection)
############################################################
spring.security.oauth2.resourceserver.jwt.issuer-uri=<YOUR_ISSUER_URI>
spring.security.oauth2.resourceserver.jwt.audience=<YOUR_AUDIENCE>

############################################################
# HTTPS configuration
############################################################
server.port=8443
# demo port
## server.port=9898

# Enable HTTPS
server.ssl.enabled=true

# Alias for the key in the keystore
server.ssl.key-alias=<KEY_ALIAS>

# Keystore location (in resources folder)
server.ssl.key-store=classpath:<KEYSTORE_FILE>
server.ssl.key-store-password=<KEYSTORE_PASSWORD>
server.ssl.key-store-type=PKCS12

############################################################
# Payment Processing (Stripe)
############################################################
stripe.key.secret=<STRIPE_SECRET_KEY>

############################################################
# Notes for developers
############################################################
# 1. Copy this file to 'application.properties' in the same folder.
# 2. Replace placeholders (<...>) with your own values.
# 3. For local HTTPS, generate your own keystore and SSL certificates.

```

1. Update the Database configuration:
 * Replace `<YOUR_DB_HOST>` with your MySQL host (default is localhost)
 * Replace `<YOUR_DB_PORT>` with your MySQL port (default is 3306)
 * Replace `<YOUR_DB_USERNAME>` and `<YOUR_DB_PASSWORD>` with your MySQL credentials, or can use the default from `01-create-user.sql`: 
    * username: ecommerceapp
    * password: ecommerceapp

2. Update Spring Data REST configuration:
 * Replace `<YOUR_FRONTEND_HOST>` with your frontend host (example: localhost)
 * Replace `<YOUR_FRONTEND_PORT>` with your frontend port (example: 4200)

3. Update Resource Server configuration:
 * Replace `<YOUR_ISSUER_URI>` with your Auth0 domain (example: https://dev-XXXXXXX.us.auth0.com/)
 * Replace `<YOUR_AUDIENCE>` with your API audience (Your auth0 identifier) 

4. Update HTTPS configuration:
 * Replace `<KEY_ALIAS>` (default from the above configuration: luv2code)
 * Replace `<KEYSTORE_FILE>` (default from the above configuration: luv2code-keystore.p12)
 * Replace `<KEYSTORE_PASSWORD>` (default from the above confirugration: secret)

5. Update Payment Processing configuration:
 * Replace `<STRIPE_SECRET_KEY>` with your Stripe secret key (example: sk_test_XXXXXXXX)

6. rename the file from `application.properties.example` to `application.properties` for the setting to take effect

## Angular Configuration Setup
### Edit `03-frontend/angular-ecommerce/src/environments/environment.ts.example` file
```ts
export const environment = {
  production: false,

  luv2shopApiUrl: "https://<YOUR_BACKEND_HOST>:<YOUR_BACKEND_PORT>/api",
  stripePublishableKey: "<YOUR_STRIPE_PUBLISHABLE_KEY>"
};

```
2. Update environment configuration in environment.ts.example:
 * `<YOUR_BACKEND_HOST>` and `<YOUR_BACKEND_PORT>` → Backend host/port
 * `<YOUR_STRIPE_PUBLISHABLE_KEY>` → Your Stripe publishable key

3. Rename the files:

`environment.ts.example` → `environment.ts`

## Running the frontend
1. Open terminal at `03-frontend/angular-ecommerce/`
2. Install Angular dependencies and run the app:
```bash
# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli

# Install project dependencies
npm install

# Start Angular app with HTTPS
npm start
```

## Running the backend
1. Open terminal at `02-backend/spring-boot-ecommerce/`
2. Build the java app with maven and run the app
```bash
# Build the project
mvn clean install

# Run the java app
mvn spring-boot:run
```




