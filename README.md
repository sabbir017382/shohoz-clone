# ShohozClone

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.11.

## admin details it's fixed for admin ,,,and other use can register and loign

admin number 01700000000
admin password: admin123

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## -------------Project Structure & setup --------------------##

## Creating shohoz-clone project

ng new shohoz-clone --routing

## install and setup Bootstrap@4

npm install --save boostrap@4

## install and create a mode json server

npm install -g json-server@0.17.3 its for istall
json-server --watch db.json --port 8000 its for run

## create core module

ng g m core

## create auth guard inside core module

ng g g core/guards/auth

## create auth interceptor inside code module

ng interceptor core/interceptors/auth

## create service inside the core module

ng g s core/services

## create auth service inside service

ng g s core/services/auth

## create user service inside service

ng g s core/services/user

## create features module

ng g m features

## create auth module for login and registration inside feature

ng g m features/auth

## create login component inside auth

ng g c features/auth/login

## create register component inside auth

ng g c features/auth/register

## create vehical module incide features

ng g m features/vehicle

## create bus component inside vehicle

ng g c /features/vehicle/bus

## create air component inside vehicle

ng g c /features/vehicle/air

## create shared module for share component header/footer/layout

ng g m shared

## create header component inside shared module

ng g c shared/header

## create footer component inside shared module

ng g c shared/footer

## create layout component inside shared module

ng g c shared/layout

## create a model interface for user

ng g interface/models/user
