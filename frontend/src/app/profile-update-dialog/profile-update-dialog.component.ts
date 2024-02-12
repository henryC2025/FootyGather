import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-profile-update-dialog',
  templateUrl: './profile-update-dialog.component.html',
  styleUrl: './profile-update-dialog.component.css'
})

export class ProfileUpdateDialogComponent
{
    @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;
    user_details_form : FormGroup;
    user : any;
    selected_file: File | null = null;
    image_preview: string | ArrayBuffer | null = null;
    user_image : any;
    existing_user_data: any =
    {
        first_name: '',
        last_name: '',
        description: '',
        location: '',
        experience: '',
        sub_notifications: '',
        profile_image: '',
    };

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                @Inject(MAT_DIALOG_DATA) public data : any,
                public route : ActivatedRoute,
                private fb : FormBuilder,
                public dialogRef : MatDialogRef<ProfileUpdateDialogComponent>)
                {
                    this.user_details_form = this.fb.group(
                    {
                        first_name : ['', Validators.required],
                        last_name : ['', Validators.required],
                        description : ['', Validators.required],
                        location : ['', Validators.required],
                        experience : ['', Validators.required],
                        sub_notifications : [false],
                        profile_image : [null],
                    });
                }

    ngOnInit()
    {
        // this.venue_id = this.data.venue_id;
        this.authService.user$.subscribe(user =>
        {
            this.user = user;
            this.populateForm();
        });
    }

    populateForm()
    {
        const data =
        {
            oauth_id : this.user?.sub
        }

        console.log(data)

        this.webService.getUserDetails(data).subscribe(
        {
            next : (data : any) =>
            {
                console.log(data);
                const first_name = data?.first_name;
                const last_name = data?.last_name;
                const description = data?.description;
                const location = data?.location;
                const experience = data?.experience;
                const sub_notifications = data?.sub_notifications;
                const profile_image = data?.profile_image;

                this.existing_user_data.first_name = first_name;
                this.existing_user_data.last_name = last_name;
                this.existing_user_data.description = description;
                this.existing_user_data.location = location;
                this.existing_user_data.experience = experience;
                this.existing_user_data.sub_notifications = sub_notifications;
                this.existing_user_data.profile_image = profile_image;

                console.log(this.existing_user_data);
                this.user_details_form.patchValue(
                {
                    first_name : first_name,
                    last_name : last_name,
                    description : description,
                    location : location,
                    experience : experience,
                    sub_notifications : sub_notifications,
                    profile_image : profile_image,

                })
            },
            error : () =>
            {
              
            }
        })
    }

    public handleAddressChange(place: google.maps.places.PlaceResult)
    {
        if(place)
        {
            this.user_details_form.get('location')?.setValue(place.formatted_address);
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

                this.user_details_form.patchValue(
                {
                    profile_image: file,
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
        this.user_details_form.patchValue(
        {
            profile_image: null,
        });

        if(this.fileInput)
        {
            this.fileInput.nativeElement.value = '';
        }
    }

    private uploadImage()
    {
        const formData =
        {
            oauthID : this.user?.sub,
            userName : this.user?.nickname,
            uploadFile : this.selected_file
        };

        return this.webService.uploadProfileImage(formData).pipe(
            map((response: any) =>
            {
                return response;
            })
        );
    }

    onSubmit()
    {
        // ADD SOMETHING TO DELETE THE EXISTING IMAGE
        const blobStorage = 'https://blobstoragehenry2001.blob.core.windows.net';

        if(this.user_details_form.valid)
        {
            if(this.selected_file)
            {
                this.uploadImage().subscribe(
                {
                    next : (response : any) =>
                    {
                        this.user_image = [blobStorage + response.filePath, response.id, response.filePath];
                        this.submitUpdateProfileDetails();

                        // CALL DELETE OLDER IMAGE HERE
                        console.log(this.existing_user_data);
                        if(this.existing_user_data.profile_image[2] && this.existing_user_data.profile_image[2] != '0000')
                        {
                            console.log(this.existing_user_data.profile_image);
                            this.webService.deleteProfileImage(this.existing_user_data.profile_image[1], this.existing_user_data.profile_image[2]).subscribe(
                            {
                                next : (response) =>
                                {

                                },
                                error : (error) =>
                                {

                                },
                                complete : () =>
                                {
                                    console.log("Profile Image deleted!")
                                    this.router.navigate(['/profile']);
                                    // ADD NOTIFIER HERE
                                }
                            })
                        }

                    },
                    error : (error) =>
                    {
                        this.sharedService.showNotification("Error uploading profile image", "error");
                    },
                    complete: () =>
                    {
                        console.log('Profile image upload completed.');
                    }
                })
            }
            else
            {
                console.log("Old image kept");
                this.user_image = this.existing_user_data.profile_image;
                this.submitUpdateProfileDetails();
            }
        }
        else
        {
            this.handleFormValidationErrors();
        }
    }

    public submitUpdateProfileDetails()
    {
        const formData =
        {
            oauth_id : this.user?.sub,
            first_name : this.user_details_form.get('first_name')?.value,
            last_name : this.user_details_form.get('last_name')?.value,
            description : this.user_details_form.get('description')?.value,
            location : this.user_details_form.get('location')?.value,
            experience : this.user_details_form.get('experience')?.value,
            sub_notifications : this.user_details_form.get('sub_notifications')?.value,
            profile_image : this.user_image,
        }
        this.webService.updateUserDetails(formData).subscribe(
        {
            next : (response : any) =>
            {
                console.log(response);
            },
            error : () =>
            {
                this.sharedService.showNotification("Something went wrong!", "error");
            },
            complete: () =>
            {
                this.sharedService.showNotification("User details updated", "success");
                this.onClose();
                // FIX THIS LATER ON
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                {
                    this.router.navigate(['/profile']);
                });
            }
        })
    }

    public onClose()
    {
        this.dialogRef.close();
    }

    private handleFormValidationErrors()
    {
        if(this.user_details_form.get('first_name')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter your first name.", "error");
        }

        if(this.user_details_form.get('last_name')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter your last name.", "error");
        }

        if(this.user_details_form.get('description')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter a description.", "error");
        }

        if(this.user_details_form.get('location')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter your location.", "error");
        }

        if(this.user_details_form.get('experience')?.hasError('required'))
        {
            this.sharedService.showNotification("Please select an experience level.", "error");
        }
    }
}
