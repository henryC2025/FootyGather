import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-communities-add-dialog',
  templateUrl: './communities-add-dialog.component.html',
  styleUrl: './communities-add-dialog.component.css'
})
export class CommunitiesAddDialogComponent {

    @ViewChild('fileInput') fileInput : ElementRef<HTMLInputElement> | undefined;
    community_form : FormGroup;
    selected_file : File | null = null;
    image_preview : string | ArrayBuffer | null = null;
    community_image : any;
    user : any;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                @Inject(MAT_DIALOG_DATA) public data : any,
                private fb : FormBuilder,
                public dialogRef : MatDialogRef<CommunitiesAddDialogComponent>)
                {
                    this.community_form = this.fb.group(
                    {
                        community_name: ['', Validators.required],
                        community_description: ['', Validators.required],
                        community_rules: ['', Validators.required],
                        community_location: ['', Validators.required],
                        community_image: [null, Validators.required],
                    })
                }
    ngOnInit()
    {
    }

    public handleAddressChange(place: google.maps.places.PlaceResult)
    {
        if(place)
        {
            this.community_form.get('community_location')?.setValue(place.formatted_address);
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
                this.community_form.patchValue(
                {
                    community_image: file,
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
        this.community_form.patchValue(
        {
            community_image: null,
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
            uploadFile: this.selected_file
        };

        return this.webService.uploadCommunityImage(formData).pipe(
            map((response: any) =>
            {
                return response;
            })
        );
    }

    onSubmit()
    {
        const blobStorage = 'https://blobstoragehenry2001.blob.core.windows.net';

        if(this.community_form.valid)
        {
            if(this.selected_file)
            {
                this.uploadImage().subscribe(
                {
                    next : (response : any) =>
                    {
                        this.community_image = [blobStorage + response.filePath, response.id, response.filePath];
                        this.submitCommunityDetails();
                    },
                    error : (error : any) =>
                    {
                        this.sharedService.showNotification("Error uploading community image", "error");
                    },
                    complete: () =>
                    {
                        console.log('Community image upload completed.');
                    }
                })
            }
            else
            {
                this.sharedService.showNotification("Please add an image", "error");
            }
        }
        else
        {
            this.handleFormValidationErrors();
        }
    }

    public submitCommunityDetails()
    {
        this.authService.user$.subscribe(user =>
        {
            this.user = user;
            this.authService.isAuthenticated$.subscribe(
            {
                next : (response : any) =>
                {
                    if(response === false)
                    {
                        this.sharedService.showNotification("Please sign in to access add a new community.", "error");
                        this.onClose();
                        this.router.navigate(['/']);
                        return;
                    }

                    const form_data =
                    {
                        community_name : this.community_form.get('community_name')?.value,
                        community_description : this.community_form.get('community_description')?.value,
                        community_rules : this.community_form.get('community_rules')?.value,
                        community_location : this.community_form.get('community_location')?.value,
                        community_image : this.community_image,
                        community_creator_oauth_id : this.user?.sub,
                        community_creator_email : this.user?.email,
                        community_creator_nickname : this.user?.nickname
                    }

                    this.webService.addCommunityDetails(form_data).subscribe(
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
                            this.sharedService.showNotification("Community added", "success");
                            this.onClose();
                            this.router.navigate(['/communities']);
                            this.sharedService.community_added.next();
                        }
                    })
                }
            });
        });
    }

    public onClose()
    {
        this.dialogRef.close();
    }

    private handleFormValidationErrors()
    {
        if(this.community_form.get('community_name')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the community name.", "error");
        }

        if(this.community_form.get('community_description')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the community description.", "error");
        }

        if(this.community_form.get('community_rules')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the rules for the community.", "error");
        }

        if(this.community_form.get('community_location')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter community location.", "error");
        }

        if(this.community_form.get('community_image')?.hasError('required'))
        {
            this.sharedService.showNotification("Please add an image for the community.", "error");
        }
    }
}
