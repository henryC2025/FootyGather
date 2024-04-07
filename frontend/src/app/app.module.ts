import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Navigation, RouterModule, Routes } from '@angular/router';
import { WebService } from './web.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthModule } from '@auth0/auth0-angular';
import { SharedService } from './shared.service';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthComponent } from './authentication/auth.component';
import { NavComponent } from './navigation/nav.component';
import { ContactComponent } from './contact/contact.component';
import { VenuesComponent } from './venues/venues.component';
import { CommunitiesComponent } from './communities/communities.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete'; 
import { Loader } from '@googlemaps/js-api-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotifierComponent } from './notifier/notifier.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { VenueComponent } from './venue/venue.component';
import { VenuesAddDialogComponent } from './venues-add-dialog/venues-add-dialog.component';
import { VenueUpdateDialogComponent } from './venue-update-dialog/venue-update-dialog.component';
import { ProfileUpdateDialogComponent } from './profile-update-dialog/profile-update-dialog.component';
import { CommunitiesAddDialogComponent } from './communities-add-dialog/communities-add-dialog.component';
import { CommunityComponent } from './community/community.component';
import { CommunityUpdateDialogComponent } from './community-update-dialog/community-update-dialog.component';
import { GamesComponent } from './games/games.component';
import { GameComponent } from './game/game.component';
import { CommunityAddCommentDialogComponent } from './community-add-comment-dialog/community-add-comment-dialog.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { GamesAddDialogComponent } from './games-add-dialog/games-add-dialog.component';
import { GameUpdateDialogComponent } from './game-update-dialog/game-update-dialog.component';
import { GameAddCommentDialogComponent } from './game-add-comment-dialog/game-add-comment-dialog.component';

var routes : any = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'communities',
    component: CommunitiesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'communities/:id',
    component: CommunityComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'communities/:id/games',
    component: GamesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'games/:id',
    component: GameComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'venues',
    component: VenuesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'venues/:id',
    component: VenueComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:id',
    component: ProfilesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'contact',
    component: ContactComponent,
    canActivate: [AuthGuard]
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
    NotifierComponent,
    VenueComponent,
    VenuesAddDialogComponent,
    VenueUpdateDialogComponent,
    ProfileUpdateDialogComponent,
    CommunitiesAddDialogComponent,
    CommunityComponent,
    CommunityUpdateDialogComponent,
    GamesComponent,
    GameComponent,
    CommunityAddCommentDialogComponent,
    ProfilesComponent,
    GamesAddDialogComponent,
    GameUpdateDialogComponent,
    GameAddCommentDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    NgxGpAutocompleteModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    AuthModule.forRoot({
      domain: 'dev-lj7ac84a7apx1w1e.us.auth0.com',
      clientId: 'KC86pIWNkm7RJOVZRsxnATVWRZRwd8lk',
      authorizationParams: {
        redirect_uri: 'http://localhost:4200/'
      }
    }),
    BrowserAnimationsModule
  ],
  providers: [WebService, SharedService, AuthGuard, {
    provide: Loader,
    useValue: new Loader({
      apiKey: 'AIzaSyB8nrqDiRpBa4gUm_IuElatFUUyK0tTx7Q',
      libraries: ['places']
    })
  },],
  bootstrap: [AppComponent]
})
export class AppModule { }
