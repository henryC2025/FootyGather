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

    details_form: FormGroup;
    user : any;
    selected_file: File | null = null;
    image_preview: string | ArrayBuffer | null = null;
    profile_image : any;


    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                private fb: FormBuilder)
                {
                    this.details_form = this.fb.group(
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

    ngOnInit()
    {
        this.authService.user$.subscribe(user =>
        {
            this.user = user;
        });

        console.log("AM I CALLED" + this.sharedService.getAuthCalled())
    }

    public handleAddressChange(place: google.maps.places.PlaceResult)
    {
        console.log(place)
        if(place)
        {
            this.details_form.get('location')?.setValue(place.formatted_address);
        }
    }

    public onFileSelected(event: any)
    {
        const file = event.target.files[0] as File;

        if(file)
        {
            if(file.type.startsWith('image/'))
            {
                this.selected_file = file;
                
                this.details_form.patchValue(
                {
                    profilePicture: file,
                });
                const reader = new FileReader();
                reader.onload = () =>
                {
                    this.image_preview = reader.result;
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
            this.selected_file = null;
            this.image_preview = null;
        }
    }

    public clearImage()
    {
        this.selected_file = null;
        this.image_preview = '';
        this.details_form.patchValue(
        {
            profilePicture: null,
        });

        if(this.fileInput)
        {
            this.fileInput.nativeElement.value = '';
        }
    }

    private uploadImage()
    {
        const blobStorage = 'https://blobstoragehenry2001.blob.core.windows.net';

        return this.authService.user$.pipe(
            map(user =>
                {
                const oauthID = user?.sub;
                const userName = user?.nickname;
                const selected_file = this.selected_file;

                const formData =
                {
                    oauthID: oauthID,
                    userName: userName,
                    uploadFile: selected_file
                };

                return formData;
            }),
            switchMap(formData =>
                this.webService.uploadProfileImage(formData).pipe(
                    map((response: any) => [blobStorage + response.filePath, response.id, response.filePath]),
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

    public onSubmit()
    {
        if(this.details_form.valid)
        {
            if(this.selected_file)
            {
                this.uploadImage().subscribe(
                {
                    next: (image_details: any) =>
                    {
                        this.profile_image = image_details;
                        this.submitUserDetails();
                    },
                    error: (error: any) =>
                    {
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
                this.profile_image = ['assets/logo.png', "0000", "0000"];
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
        const form_data =
        {
            user_name : this.user.nickname,
            oauth_id : this.user.sub,
            email : this.user.email,
            first_name : this.details_form.get('firstName')?.value,
            last_name : this.details_form.get('lastName')?.value,
            description : this.details_form.get('description')?.value,
            location : this.details_form.get('location')?.value,
            experience : this.details_form.get('experience')?.value,
            sub_notifications : this.details_form.get('subscribeToNotifications')?.value,
            profile_image : this.profile_image,
            games_joined : 0,
            games_attended : 0,
            balance : 0,
            is_admin : "false"
        };

        this.webService.addNewUserDetails(form_data).subscribe(
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
        if(this.details_form.get('firstName')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter your first name.", "error");
        }

        if(this.details_form.get('lastName')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter your last name.", "error");
        }

        if(this.details_form.get('location')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the area you are located.", "error");
        }

        if(this.details_form.get('description')?.hasError('required'))
        {
            this.sharedService.showNotification("Please introduce yourself in the description.", "error");
        }
    }
}
