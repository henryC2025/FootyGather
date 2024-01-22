import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})

export class UserDetailsComponent {
    @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;

    detailsForm: FormGroup;
    user : any;
    selectedFile: File | null = null;
    imagePreview: string | ArrayBuffer | null = null;


    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                private fb: FormBuilder)
                {
                    this.detailsForm = this.fb.group(
                    {
                        location: ['', Validators.required],
                        description: ['', Validators.required],
                        firstName: ['', Validators.required],
                        lastName: ['', Validators.required],
                        experience: ['', Validators.required],
                        profilePicture: [null],
                        subscribeToNotifications: [false],
                    });
                }


    public handleAddressChange(place: google.maps.places.PlaceResult)
    {
        console.log(place)
        if (place)
        {
            this.detailsForm.get('location')?.setValue(place.formatted_address);
        }
    }

    ngOnInit()
    {
        this.authService.user$.subscribe(user =>
        {
            this.user = user;
        });

        this.authService.isAuthenticated$.subscribe(response =>
        {
            if(response === false)
            {
                window.alert("Please sign in to access this page")
                this.router.navigate(['/']);
            }
        });
    }

    onFileSelected(event: any)
    {
        const file = event.target.files[0] as File;
    
        if (file) {
            // Check if the file type is an image
            if (file.type.startsWith('image/'))
            {
                this.selectedFile = file;
    
                const reader = new FileReader();
                reader.onload = () =>
                {
                    this.imagePreview = reader.result;
                };
    
                reader.readAsDataURL(file);
            } else
            {
                // Handle the case when the selected file is not an image
                console.error('Selected file is not an image.');
                this.sharedService.showNotification("Please select an image.", "Close", "error");
                this.clearImage();
            }
        }
        else
        {
            this.selectedFile = null;
            this.imagePreview = null;
        }
    }
    
    clearImage()
    {
        this.selectedFile = null;
        this.imagePreview = '';
        this.detailsForm.patchValue(
        {
            profilePicture: null,
        });
      
        if (this.fileInput)
        {
            this.fileInput.nativeElement.value = '';
        }
    }
      

    onSubmit()
    {
        // Check overall form validity
        if (this.detailsForm.valid)
        {
            const locationValue = this.detailsForm?.get('location')?.value;
            const descriptionValue = this.detailsForm?.get('description')?.value;
            const firstNameValue = this.detailsForm?.get('firstName')?.value;
            const lastNameValue = this.detailsForm?.get('lastName')?.value;
            const experienceValue = this.detailsForm?.get('experience')?.value;
            const subscribeToNotificationsValue = this.detailsForm?.get('subscribeToNotifications')?.value;
            const profilePictureValue = this.detailsForm?.get('profilePicture')?.value || 'assets/logo.png';
        
            console.log('Form submitted with the following values:');
            console.log('Location:', locationValue);
            console.log('Description:', descriptionValue);
            console.log('First Name:', firstNameValue);
            console.log('Last Name:', lastNameValue);
            console.log('Experience:', experienceValue);
            console.log('Subscribe to Notifications:', subscribeToNotificationsValue);
            console.log('Profile Picture:', profilePictureValue);
            this.sharedService.showNotification("Details added, Thank you for Joining :)", "Close", "success");
            //   HANDLE SUBMIT DETAILS HERE, AND ALSO STORE THE IMAGE
        }
        else
        {
            if (this.detailsForm.get('firstName')?.hasError('required'))
            {
                this.sharedService.showNotification("Please enter your first name.", "Close", "error");
            }

            if (this.detailsForm.get('lastName')?.hasError('required'))
            {
                this.sharedService.showNotification("Please enter your last name.", "Close", "error");
            }

            if (this.detailsForm.get('location')?.hasError('required'))
            {
                this.sharedService.showNotification("Please enter the area you are located.", "Close", "error");
            }
        
            if (this.detailsForm.get('description')?.hasError('required'))
            {
                this.sharedService.showNotification("Please introduce yourself in the description.", "Close", "error");
            }
        
        }
    }

    // onSubmit()
    // {
    //     console.log("Details Added!")
    //     const subscribeToNotificationsValue = this.detailsForm?.get('subscribeToNotifications')?.value;
    //     const location = this.detailsForm?.get('location')?.value;
    //     const experience = this.detailsForm?.get('experience')?.value;
    //     const firstName = this.detailsForm?.get('firstName')?.value;
    //     const lastName = this.detailsForm?.get('lastName')?.value;



    //     console.log(subscribeToNotificationsValue);
    //     console.log(location)
    //     console.log(firstName)
    //     console.log(lastName)
    //     console.log(experience)
    //     console.log(this.selectedFile)

    //     // CALL AZURE API TO STORE IMAGE AND ASSIGN LINK TO IMAGE IN MONGODB
    //     // CALL WEBSERVICE TO ADD DETAILS
    // }

}
