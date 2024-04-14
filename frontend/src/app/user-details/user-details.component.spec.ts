import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserDetailsComponent } from './user-details.component';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Loader } from '@googlemaps/js-api-loader';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

class MockLoader
{
    load()
    {
        return Promise.resolve();
    }
    importLibrary()
    {
        return Promise.resolve();
    }
}

describe('UserDetailsComponent', () =>
{
    let component: UserDetailsComponent;
    let fixture: ComponentFixture<UserDetailsComponent>;

    beforeEach(async () => {

      const authServiceMock =
      {
          user$: of(
          {
              sub: 'auth0|123456',
              nickname: 'testuser',
              email: 'test@example.com'
          }),
          isAuthenticated$: of(true)
      };

      const webServiceMock =
      {
        
      };

      const sharedServiceMock =
      {
          showNotification: jasmine.createSpy(),
          showUpdateUserDetailsDialog: jasmine.createSpy(),
          setUserFormCompleted: jasmine.createSpy(),
          isUserFormCompleted: jasmine.createSpy(),
          setAuthCalled: jasmine.createSpy(),
          getAuthCalled: jasmine.createSpy().and.returnValue(true)
      };

      await TestBed.configureTestingModule(
      {
          declarations: [UserDetailsComponent],
          imports: [
            FormsModule,
            ReactiveFormsModule,
            HttpClientTestingModule,
            RouterTestingModule,
            NgxGpAutocompleteModule
          ],
          providers: [
            { provide: AuthService, useValue: authServiceMock },
            { provide: WebService, useValue: webServiceMock },
            { provide: SharedService, useValue: sharedServiceMock },
            { provide: Loader, useClass: MockLoader }
          ],
          schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
          }).compileComponents();

          fixture = TestBed.createComponent(UserDetailsComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });
});
