import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})

export class ContactComponent
{
    contact_form: FormGroup;
    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                private fb: FormBuilder)
                {
                    this.contact_form = this.fb.group(
                    {
                        contact_email: ['', Validators.required],
                        contact_message: ['', Validators.required],
                        contact_name: ['', Validators.required],
                    });
                }

    ngOnInit()
    {
      
    }

    onSubmit()
    {
        const formData =
        {
            message : this.contact_form.get('contact_message')?.value,
            email : this.contact_form.get('contact_email')?.value,
            name : this.contact_form.get('contact_name')?.value,
        }

        if(this.contact_form.valid)
        {
            this.webService.sendContactMessageEmail(formData).subscribe(
            {
                next: (response) =>
                {
                    this.sharedService.showNotification("Message sent successfully!", "success");
                },
                error: (error) =>
                {
                    this.sharedService.showNotification("An error occured sending the message!", "error");
                    console.log(error)
                },
                complete: () =>
                {
                    this.contact_form.patchValue(
                    {
                        contact_email: "",
                        contact_name: "",
                        contact_message: ""
                    });
                }
            });
        }
        else
        {
          this.handleFormValidationErrors();
        }
    }

    private handleFormValidationErrors()
    {
        if(this.contact_form.get('contact_name')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter your name.", "error");
        }
        if(this.contact_form.get('contact_email')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter your email.", "error");
        }
        if(this.contact_form.get('contact_message')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter a message.", "error");
        }
    }
}