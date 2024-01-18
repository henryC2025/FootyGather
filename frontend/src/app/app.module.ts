import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Navigation, RouterModule } from '@angular/router';
import { WebService } from './web.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthModule } from '@auth0/auth0-angular';
import { SharedService } from './shared.service';
import { AuthGuard } from '@auth0/auth0-angular';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthComponent } from './auth/auth.component';
import { NavComponent } from './nav/nav.component';
import { ContactComponent } from './contact/contact.component';
import { VenuesComponent } from './venues/venues.component';
import { CommunitiesComponent } from './communities/communities.component';
import { UserDetailsComponent } from './user-details/user-details.component';

var routes : any = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'communities',
    component: CommunitiesComponent
  },
  {
    path: 'venues',
    component: VenuesComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'user-details',
    component: UserDetailsComponent
  },
]

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent, 
    HomeComponent,
    NavComponent,
    ProfileComponent,
    ContactComponent,
    VenuesComponent,
    CommunitiesComponent,
    UserDetailsComponent,
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
      clientId: 'KC86pIWNkm7RJOVZRsxnATVWRZRwd8lk',
      authorizationParams: {
        redirect_uri: 'http://localhost:4200/'
      }
    })
  ],
  providers: [WebService, SharedService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
