import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, map, switchMap } from 'rxjs';

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
    profileImageLink : any;


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
    }

    onFileSelected(event: any)
    {
        const file = event.target.files[0] as File;
    
        if (file)
        {
            if (file.type.startsWith('image/'))
            {
                this.selectedFile = file;
                
                this.detailsForm.patchValue(
                {
                    profilePicture: file,
                });
                const reader = new FileReader();
                reader.onload = () =>
                {
                    this.imagePreview = reader.result;
                };

                reader.readAsDataURL(file);
            }
            else
            {
                console.error('Selected file is not an image.');
                this.sharedService.showNotification("Please select an image.", "error");
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

    uploadImage()
    {
        const blobStorage = 'https://blobstoragehenry2001.blob.core.windows.net'

        return this.authService.user$.pipe(
            map(user =>
                {
                const oauthID = user?.sub;
                const userName = user?.nickname;
                const selectedFile = this.selectedFile;
    
                const formData =
                {
                    oauthID: oauthID,
                    userName: userName,
                    uploadFile: selectedFile
                };
    
                return formData;
            }),
            switchMap(formData =>
                this.webService.uploadProfileImage(formData).pipe(
                    map((response: any) => blobStorage + response.filePath),
                    catchError(error =>
                    {
                        console.error('Form submission failed', error);
                        this.sharedService.showNotification("An error occurred uploading profile image", "error");
                        throw error; // Propagate the error
                    })
                )
            )
        );
    }

    onSubmit()
    {
        if (this.detailsForm.valid)
        {
            if (this.selectedFile)
            {
                this.uploadImage().subscribe(
                {
                    next: (imageLink: string) =>
                    {
                        this.profileImageLink = imageLink;
                        console.log('Profile image link:', imageLink);
                        this.submitUserDetails();
                    },
                    error: (error: any) =>
                    {
                        console.error('Error uploading profile image:', error);
                        // Handle error if needed
                        this.sharedService.showNotification("Error uploading profile image", "error");
                    },
                    complete: () =>
                    {
                        console.log('Profile image upload completed.');
                    },
                });
            }
            else
            {
                this.profileImageLink = 'assets/logo.png';
                this.submitUserDetails();
            }
        }
        else
        {
            // Handle form validation errors
            this.handleFormValidationErrors();
        }
    }

    private submitUserDetails()
    {
        const formData =
        {
            userName: this.user.nickname,
            oauthID: this.user.sub,
            firstName: this.detailsForm.get('firstName')?.value,
            lastName: this.detailsForm.get('lastName')?.value,
            description: this.detailsForm.get('description')?.value,
            location: this.detailsForm.get('location')?.value,
            experience: this.detailsForm.get('experience')?.value,
            subNotifications: this.detailsForm.get('subscribeToNotifications')?.value,
            profileImage: this.profileImageLink,
        };

        this.webService.addNewUserDetails(formData).subscribe(
        {
            next: (response) =>
            {
                // Handle success if needed
                console.log("User Details added: " + response)
                this.sharedService.showNotification("Details added, Thank you for Joining :)", "success");
            },
            error: (error: any) =>
            {
                console.error('Error submitting user details:', error);
                // Handle error if needed
                this.sharedService.showNotification("Error submitting user details", "error");
            },
            complete: () =>
            {
                console.log('User details submission completed.');
                // ADD TO BELOW AFTER SUCCESSFUL SUBMISSION
                this.sharedService.setUserFormCompleted(true);
                console.log("Submit button: " + this.sharedService.isUserFormCompleted())
                this.sharedService.setAuthCalled(true);
                this.router.navigate(['/']);
            },
        });
    }

    private handleFormValidationErrors()
    {
        if (this.detailsForm.get('firstName')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter your first name.", "error");
        }
    
        if (this.detailsForm.get('lastName')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter your last name.", "error");
        }
    
        if (this.detailsForm.get('location')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the area you are located.", "error");
        }
    
        if (this.detailsForm.get('description')?.hasError('required'))
        {
            this.sharedService.showNotification("Please introduce yourself in the description.", "error");
        }
    }
}
