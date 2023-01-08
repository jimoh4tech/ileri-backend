ILERI OLUWA API
===============

This project was developed for a block industry Ecommerce website. You can find its coresponding Frontend project [Here](https://github.com/Abu-Abdillah1/ileri-frontend)

[![Technologies Used](icon.jfif)]


##  Backend Stack

-   Express JS
-   MongoDB
-   TypeScript
-   Json Web Token (JWT)
-   Argon (Algorithm)
-   Mongoose
-   Nodemon
-   dotenv
-   helmet
-   morgan
-   class-validator
-   node-mailer



## HTTP Status Codes
HTTP status codes was used to indicate success or failure of a request

### Success codes
- 200 OK - Request succeeded. Response included in JSON 
- 201 Created - Resource created. Response included in JSON 
- 204 No Content - Request succeeded, but no response body

### Error codes
- 400 Bad Request - Could not parse request. Response with appropriate error message
- 401 Unauthorized - No authentication credentials provided or authentication failed
- 403 Forbidden - Authenticated user does not have access
- 404 Not Found - Resource not found. If you hit an endpoint that is not available
- 500, 501, 502, 503, etc - An internal server error occured


## Philosophy Implored

#### Friendly and informative error message
When users send a request that is not well formatted, missing or invalid, an appropriate status code with error message is thrown to enable the user to easily navigate to the source of problem. 

#### Separation of concerns
This style as been gaining fame in the backend development world. It allows other programmers to easily interact with the code with little amount of time and effort, making them free of the fear  of breaking the application.


#### TypeScript
A very interesting question type might be asked is why typescript could be a philosophy. JavaScript is a very popular programming language characterized with easy to learn and use. Thus, there’s always a price to pay for that – runtime error and complexity in making changes.

#### Versioning
Versioning API is among the best practices that a backend engineer should pick up during development 

#### Linting
A careful coding style with appropriate linting is very import for good software


## Architecture
During the development of the application, the modular architectural pattern was used to structure the code.


## Getting Started
- Clone repo `https://github.com/Abu-Abdillah1/ileri-backend.git`
- Install NPM modules `npm install`
- Build project `npm run build`
- Run Project `npm start`
 

## Core Structure
    ileri-backend
      ├── .github
      ├── @types
      ├── src 
      │   ├── auth
      │   │   ├── auth.controller.ts
      |   |   ├── auth.interface.ts
      │   │   ├── auth.middleware.ts
      |   |   ├── auth.router.ts
      │   │   ├── auth.test.ts
      |   |   ├── auth.token.models.ts
      │   │   └── auth.util.ts
      |   |
      │   ├── carts
      │   │   ├── carts.controller.ts
      |   |   ├── carts.interface.ts
      │   │   ├── carts.middleware.ts
      |   |   ├── carts.router.ts
      │   │   ├── carts.test.ts
      │   │   └── carts.util.ts
      |   |
      │   ├── error
      │   │   ├── error.middleware.ts
      │   │   ├── http-exception.ts
      │   │   └── not-found.middleware.ts
      │   │
      │   ├── items
      │   │   ├── items.controller.ts
      │   │   ├── items.interface.ts
      │   │   ├── items.model.ts
      │   │   ├── items.router.ts
      │   │   ├── items.test.ts
      │   │   └── items.util.ts
      │   │
      │   ├── orders
      │   │   ├── orders.controller.ts
      │   │   ├── orders.interface.ts
      │   │   ├── orders.model.ts
      │   │   ├── orders.router.ts
      │   │   ├── orders.test.ts
      │   │   └── orders.util.ts
      │   │
      │   ├── users
      │   │   ├── users.controller.ts
      │   │   ├── users.interface.ts
      │   │   ├── users.model.ts
      │   │   ├── users.router.ts
      │   │   ├── users.test.ts
      │   │   └── users.util.ts
      │   │
      │   │
      │   ├── app.ts
      │   ├── dbConnections.ts
      │   └── index.ts
      │
      ├── .env
      ├── .eslintignore
      ├── .eslintrc
      ├── .gitignore
      ├── jest.config.js
      ├── package-lock.json
      ├── package.json
      ├── README.md
      └── tsconfig.json

Authentication Endpoints
------------------------

| Routes | HTTP Verb | Request Body | Description |
| --- | --- | --- | --- |
| /api/v1/auth/register | `POST` | {'name': 'John', 'phone': '2349091222345', 'email': '<john.doe@example.com>', 'password': '123456'} | Create new user. |
| /api/v1/auth/login | `POST` | {'email': '<john.doe@example.com>', 'password': '123456'} | Login endpoint. |
| /api/v1/auth/requestPasswordReset | `POST` | {'email': '<john.doe@example.com>'} | Send reset password link to user |
| /api/v1/auth/resetPassword | `POST` | {'userId': 'id', 'token': 'token', 'password': '123456'} | Reset users password. |

Contribution
----------------------------------------------------------------------------

Anyone interested in the project can contribute to this repository. To do this, first fork the repository. Then make the changes in your repository. Finally, send a pull request to this repository.

## Author
Abu Abdillah olamide14044@gmail.com - [Twitter](https://twitter.com/abu4code) - [LinkedIn](linkedin.com/in/abdul-quadri-jimoh-69369714a)

Copyright (c) 2022 Abu Abdillah https://github.com/Abu-Abdillah1/

