import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-venues-dialog',
  templateUrl: './venues-dialog.component.html',
  styleUrl: './venues-dialog.component.css'
})
export class VenuesDialogComponent {
    @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;
    venueForm: FormGroup;
    selectedFile: File | null = null;
    imagePreview: string | ArrayBuffer | null = null;
    venueImage : any;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private fb: FormBuilder,
                public dialogRef: MatDialogRef<VenuesDialogComponent>)
                {
                    this.venueForm = this.fb.group(
                    {
                        venueName: ['', Validators.required],
                        venueAddress: ['', Validators.required],
                        venueDescription: ['', Validators.required],
                        venueImage: [null, Validators.required],
                        venueContact: ['', Validators.required],
                    });
                }

    ngOnInit()
    {
    }

    public handleAddressChange(place: google.maps.places.PlaceResult)
    {
        if(place)
        {
            this.venueForm.get('venueAddress')?.setValue(place.formatted_address);
        }
    }

    public onFileSelected(event: any)
    {
        const file = event.target.files[0] as File;

        if(file)
        {
            if(file.type.startsWith('image/'))
            {
                this.selectedFile = file;

                this.venueForm.patchValue(
                {
                    venueImage: file,
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

    public clearImage()
    {
        this.selectedFile = null;
        this.imagePreview = '';
        this.venueForm.patchValue(
        {
            venueImage: null,
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
            uploadFile: this.selectedFile
        };

        return this.webService.uploadVenueImage(formData).pipe(
            map((response: any) =>
            {
                return response;
            })
        );
    }

    onSubmit()
    {
        const blobStorage = 'https://blobstoragehenry2001.blob.core.windows.net';

        if(this.venueForm.valid)
        {
            if(this.selectedFile)
            {
                this.uploadImage().subscribe(
                {
                    next : (response : any) =>
                    {
                        this.venueImage = [blobStorage + response.filePath, response.id];
                        this.submitVenueDetails();
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
                this.sharedService.showNotification("Please add an image", "error");
            }
        }
        else
        {
            this.handleFormValidationErrors();
        }
    }

    public submitVenueDetails()
    {
        const formData =
        {
          venue_name : this.venueForm.get('venueName')?.value,
          venue_address : this.venueForm.get('venueAddress')?.value,
          venue_description : this.venueForm.get('venueDescription')?.value,
          venue_image : this.venueImage,
          venue_contact : this.venueForm.get('venueContact')?.value
        }

        this.webService.addVenueDetails(formData).subscribe(
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
                this.sharedService.showNotification("Venue added", "success");
                this.onClose();
            }
        })
    }

    public onClose()
    {
        this.dialogRef.close();
    }

    private handleFormValidationErrors()
    {
        if(this.venueForm.get('venueName')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the venue name.", "error");
        }

        if(this.venueForm.get('venueAddress')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter venue address.", "error");
        }

        if(this.venueForm.get('venueContact')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the venue contact details.", "error");
        }

        if(this.venueForm.get('venueDescription')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter a description of the venue.", "error");
        }

        if(this.venueForm.get('venueImage')?.hasError('required'))
        {
            this.sharedService.showNotification("Please add an image of the venue.", "error");
        }
    }
}
