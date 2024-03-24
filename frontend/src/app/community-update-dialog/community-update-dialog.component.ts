import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-community-update-dialog',
  templateUrl: './community-update-dialog.component.html',
  styleUrl: './community-update-dialog.component.css'
})
export class CommunityUpdateDialogComponent {
    @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;
    community_form: FormGroup;
    selected_file: File | null = null;
    image_preview: string | ArrayBuffer | null = null;
    community_image : any;
    community_id : any;
    is_admin : any;
    user : any;
    existing_data: any =
    {
        community_name: '',
        community_location: '',
        community_description: '',
        community_rules: '',
        community_image: '',
    };

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                @Inject(MAT_DIALOG_DATA) public data: any,
                public route : ActivatedRoute,
                private fb: FormBuilder,
                public dialogRef: MatDialogRef<CommunityUpdateDialogComponent>)
                {
                    this.community_form = this.fb.group(
                    {
                        community_name: ['', Validators.required],
                        community_location: ['', Validators.required],
                        community_description: ['', Validators.required],
                        community_rules: ['', Validators.required],
                        community_image: [null],
                    });
                }

    ngOnInit()
    {
        this.getUserDetails();
        this.community_id = this.data.community_id;
        this.populateForm();
    }

    getUserDetails()
    {
        this.authService.user$.subscribe((userData: any) =>
        {
            this.user = userData;

            const userDetails =
            {
                oauth_id: userData?.sub,
            };

            if(this.user)
            {
                this.webService.getUserDetails(userDetails).subscribe((data: any) =>
                {
                    this.is_admin = (data.is_admin == "true");
                });
            }
        });
    }

    populateForm()
    {
        this.webService.getCommunityByID(this.community_id).subscribe(
        {
            next : (data : any) =>
            {
                console.log(data)
                const community_name = data[0].name;
                const community_location = data[0].location;
                const community_description = data[0].description;
                const community_rules = data[0].rules;
                const community_image = data[0].image;
                const community_creator_oauth_id = data[0].creator_oauth_id;

                this.existing_data.community_name = community_name;
                this.existing_data.community_location = community_location;
                this.existing_data.community_description = community_description;
                this.existing_data.community_rules = community_rules;
                this.existing_data.community_image = community_image;
                this.existing_data.community_creator_oauth_id = community_creator_oauth_id;

                this.community_form.patchValue(
                {
                    community_name : community_name,
                    community_location : community_location,
                    community_description : community_description,
                    community_rules : community_rules,
                    community_image : community_image,
                    community_creator_oauth_id : community_creator_oauth_id
                });
            },
            error : () =>
            {
                console.log("An error occured retrieving community details!");
            }
        })
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
        if(this.existing_data.community_creator_oauth_id === this.user?.sub || this.is_admin)
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
                            this.submitUpdateCommunityDetails();
    
                            this.webService.deleteCommunityImage(this.existing_data.community_image[1], this.existing_data.community_image[2]).subscribe(
                            {
                                next : (response) =>
                                {
                
                                },
                                error : (error) =>
                                {
                
                                },
                                complete : () =>
                                {
                                    console.log("Community deleted!")
                                    this.router.navigate(['/communities']);
                                    // ADD NOTIFIER HERE
                                }
                            })
                        },
                        error : (error) =>
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
                    console.log("Old image kept");
                    this.community_image = this.existing_data.community_image;
                    this.submitUpdateCommunityDetails();
                }
            }
            else
            {
                this.handleFormValidationErrors();
            }
        }
        else
        {
            this.sharedService.showNotification("Only the community creator or admin can update the community!", "error");
        }
    }

    public submitUpdateCommunityDetails()
    {
        const formData =
        {
          community_name : this.community_form.get('community_name')?.value,
          community_location : this.community_form.get('community_location')?.value,
          community_description : this.community_form.get('community_description')?.value,
          community_rules : this.community_form.get('community_rules')?.value,
          community_image : this.community_image,
        }

        console.log(this.community_image)

        this.webService.updateCommunityDetails(this.community_id, formData).subscribe(
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
                this.sharedService.showNotification("Community updated", "success");
                this.onClose();
                this.router.navigate(['/communities']);
            }
        })
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

        if(this.community_form.get('community_location')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter community location.", "error");
        }

        if(this.community_form.get('community_description')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the community description.", "error");
        }

        if(this.community_form.get('community_rules')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the community rules.", "error");
        }

        if(this.community_form.get('community_image')?.hasError('required'))
        {
            this.sharedService.showNotification("Please add an image for the community.", "error");
        }
    }
}
