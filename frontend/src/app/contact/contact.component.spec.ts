import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactComponent } from './contact.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('ContactComponent', () =>
{
    let component: ContactComponent;
    let fixture: ComponentFixture<ContactComponent>;
    let authServiceMock: any;
    let webServiceMock: any;
    let sharedServiceMock: any;

    beforeEach(async () =>
    {
        authServiceMock =
        {
            user$: of({ sub: 'auth0|123456', nickname: 'testuser', email: 'test@example.com' }),
            isAuthenticated$: of(true)
        };
        webServiceMock =
        {
            sendContactMessageEmail: jasmine.createSpy('sendContactMessageEmail').and.returnValue(of({}))
        };
        sharedServiceMock =
        {
            showNotification: jasmine.createSpy('showNotification'),
        };

        await TestBed.configureTestingModule(
        {
            declarations: [ ContactComponent ],
            imports: [ HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, FormsModule ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ContactComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should initialize the contact form', () =>
    {
        expect(component.contact_form).toBeDefined();
        expect(component.contact_form.valid).toBeFalsy();
    });

    it('should validate form fields as required', () =>
    {
        let name = component.contact_form.controls['contact_name'];
        let email = component.contact_form.controls['contact_email'];
        let message = component.contact_form.controls['contact_message'];

        expect(name.errors?.['required']).toBeTruthy();
        expect(email.errors?.['required']).toBeTruthy();
        expect(message.errors?.['required']).toBeTruthy();

        name.setValue("Test");
        email.setValue("test@example.com");
        message.setValue("Hello there!");

        expect(component.contact_form.valid).toBeTruthy();
    });

    it('should handle valid form submission', () =>
    {
        component.contact_form.controls['contact_name'].setValue("Test");
        component.contact_form.controls['contact_email'].setValue("test@example.com");
        component.contact_form.controls['contact_message'].setValue("Hello there!");
        component.onSubmit();

        expect(webServiceMock.sendContactMessageEmail).toHaveBeenCalled();
        expect(sharedServiceMock.showNotification).toHaveBeenCalledWith("Message sent successfully!", "success");
    });

    it('should handle form submission with validation errors', () =>
    {
        component.onSubmit();
        expect(webServiceMock.sendContactMessageEmail).not.toHaveBeenCalled();
        expect(sharedServiceMock.showNotification).toHaveBeenCalledWith("Please enter your name.", "error");
    });
});
