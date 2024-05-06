import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommunitiesAddDialogComponent } from './communities-add-dialog.component';
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

describe('CommunitiesAddDialogComponent', () =>
{
    let component: CommunitiesAddDialogComponent;
    let fixture: ComponentFixture<CommunitiesAddDialogComponent>;
    let authServiceMock : any;
    let webServiceMock : any;
    let sharedServiceMock : any;

    beforeEach(async () =>
    {
        authServiceMock =
        {
            user$: of(
            {
                sub: 'auth0|123456',
                nickname: 'testuser',
                email: 'test@example.com'
            }),
            isAuthenticated$: of(true)
        };

        webServiceMock =
        {
            getUserDetails: jasmine.createSpy('getUserDetails').and.returnValue(of({})),
            addCommunityDetails: jasmine.createSpy('addCommunityDetails').and.returnValue(of({})),
        	getCountOfCurrentCommunityGames: jasmine.createSpy().and.returnValue(of({ count_of_current_games: 5 })),
            uploadCommunityImage: jasmine.createSpy('uploadCommunityImage').and.returnValue(of({ filePath: '/path/to/image', id: '123', locator: '/path' })),
        }

        webServiceMock.uploadCommunityImage = jasmine.createSpy().and.returnValue(of({
            filePath: 'path/to/file',
            id: '123',
            fileName: 'filename.jpg'
        }));


        sharedServiceMock =
        {
            showNotification: jasmine.createSpy(),
        };

        await TestBed.configureTestingModule(
        {
            declarations: [CommunitiesAddDialogComponent],
            imports: [
                FormsModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
                RouterTestingModule,
                MatDialogModule,
                NgxGpAutocompleteModule
            ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock },
                { provide: Loader, useClass: MockLoader },
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CommunitiesAddDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should handle file selection and update form value', () =>
    {
        const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
        const event = { target: { files: [file] } };
        component.onFileSelected(event);
        expect(component.community_form.value.community_image).toEqual(file);
    });
});
