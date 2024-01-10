import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Navigation, RouterModule } from '@angular/router';
import { WebService } from './web.service';
import { NavComponent } from './nav.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthModule } from '@auth0/auth0-angular';
import { SharedService } from './shared.service';
import { AuthGuard } from '@auth0/auth0-angular';
import { AuthComponent } from './auth.component';
import { HomeComponent } from './home.component';

var routes : any = [
  {
    path: '',
    component: HomeComponent
  },
  // {
  //   path: 'games/:id',
  //   component: GameComponent
  // },
  // {
  //   path: 'profile',
  //   component: ProfileComponent
  // }
]

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent, 
    HomeComponent,
    NavComponent, 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    AuthModule.forRoot({
      domain: 'dev-lj7ac84a7apx1w1e.us.auth0.com',
      clientId: 'V1vpytxkkPCX6I2Aebhi0jGowtyH8rf8',
      authorizationParams: {
        redirect_uri: 'http://localhost:4200/'
      }
    })
  ],
  providers: [WebService, SharedService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
