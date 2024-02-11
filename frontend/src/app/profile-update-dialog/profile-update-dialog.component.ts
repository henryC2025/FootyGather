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

    // const form_data =
    //     {
    //         user_name : this.user.nickname,
    //         oauth_id : this.user.sub,
    //         first_name : this.details_form.get('firstName')?.value,
    //         last_name : this.details_form.get('lastName')?.value,
    //         description : this.details_form.get('description')?.value,
    //         location : this.details_form.get('location')?.value,
    //         experience : this.details_form.get('experience')?.value,
    //         sub_notifications : this.details_form.get('subscribeToNotifications')?.value,
    //         profile_image : this.profile_image,
    //         games_joined : 0,
    //         games_attended : 0,
    //         balance : 0,
    //         is_admin : "false"
    //     };

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
                        first_name: ['', Validators.required],
                        last_name: ['', Validators.required],
                        description: ['', Validators.required],
                        location: ['', Validators.required],
                        experience: ['', Validators.required],
                        sub_notifications: ['', Validators.required],
                        profile_image: [null],
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
                // const venue_name = data[0].name;
                // const venue_address = data[0].address;
                // const venue_description = data[0].description;
                // const venue_contact_info = data[0].contact_info;
                // const venue_image = data[0].image;

                // this.existing_user_data.venue_name = venue_name;
                // this.existing_user_data.venue_address = venue_address;
                // this.existing_user_data.venue_description = venue_description;
                // this.existing_user_data.venue_contact = venue_contact_info;
                // this.existing_user_data.venue_image = venue_image;

                // this.user_details_form.patchValue(
                // {
                //     venueName : venue_name,
                //     venueAddress : venue_address,
                //     venueDescription : venue_description,
                //     venueContact : venue_contact_info,
                //     venueImage : venue_image,
                // });
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
                        this.user_image = [blobStorage + response.filePath, response.id];
                        this.submitUpdateVenueDetails();

                        // CALL DELETE OLDER IMAGE HERE
                        // this.webService.deleteVenueImage(this.existing_user_data.venue_image[1]).subscribe(
                        // {
                        //     next : (response) =>
                        //     {
            
                        //     },
                        //     error : (error) =>
                        //     {
            
                        //     },
                        //     complete : () =>
                        //     {
                        //         console.log("Venue deleted!")
                        //         this.router.navigate(['/venues']);
                        //         // ADD NOTIFIER HERE
                        //     }
                        // })
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
                this.user_image = this.existing_user_data.venue_image;
                this.submitUpdateVenueDetails();
            }
        }
        else
        {
            this.handleFormValidationErrors();
        }
    }

    public submitUpdateVenueDetails()
    {
        const formData =
        {
          venue_name : this.user_details_form.get('venueName')?.value,
          venue_address : this.user_details_form.get('venueAddress')?.value,
          venue_description : this.user_details_form.get('venueDescription')?.value,
          venue_image : this.user_image,
          venue_contact : this.user_details_form.get('venueContact')?.value
        }

        console.log(this.user_image)

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
                this.router.navigate(['/venues']);
            }
        })
    }

    public onClose()
    {
        this.dialogRef.close();
    }

    private handleFormValidationErrors()
    {
        if(this.user_details_form.get('venueName')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the venue name.", "error");
        }

        if(this.user_details_form.get('venueAddress')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter venue address.", "error");
        }

        if(this.user_details_form.get('venueContact')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the venue contact details.", "error");
        }

        if(this.user_details_form.get('venueDescription')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter a description of the venue.", "error");
        }

        if(this.user_details_form.get('venueImage')?.hasError('required'))
        {
            this.sharedService.showNotification("Please add an image of the venue.", "error");
        }
    }
}
