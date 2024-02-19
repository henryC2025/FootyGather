import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-venues-add-dialog',
  templateUrl: './venues-add-dialog.component.html',
  styleUrl: './venues-add-dialog.component.css'
})
export class VenuesAddDialogComponent
{
    @ViewChild('fileInput') fileInput : ElementRef<HTMLInputElement> | undefined;
    venue_form : FormGroup;
    selected_file : File | null = null;
    image_preview : string | ArrayBuffer | null = null;
    venue_image : any;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                @Inject(MAT_DIALOG_DATA) public data : any,
                private fb : FormBuilder,
                public dialogRef : MatDialogRef<VenuesAddDialogComponent>)
                {
                    this.venue_form = this.fb.group(
                    {
                        venueName: ['', Validators.required],
                        venueAddress: ['', Validators.required],
                        venueDescription: ['', Validators.required],
                        venue_image: [null, Validators.required],
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
            this.venue_form.get('venueAddress')?.setValue(place.formatted_address);
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

                this.venue_form.patchValue(
                {
                    venue_image: file,
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
        this.venue_form.patchValue(
        {
            venue_image: null,
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

        if(this.venue_form.valid)
        {
            if(this.selected_file)
            {
                this.uploadImage().subscribe(
                {
                    next : (response : any) =>
                    {
                        this.venue_image = [blobStorage + response.filePath, response.id, response.filePath];
                        this.submitVenueDetails();
                    },
                    error : (error : any) =>
                    {
                        this.sharedService.showNotification("Error uploading venue image", "error");
                    },
                    complete: () =>
                    {
                        console.log('Venue image upload completed.');
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
          venue_name : this.venue_form.get('venueName')?.value,
          venue_address : this.venue_form.get('venueAddress')?.value,
          venue_description : this.venue_form.get('venueDescription')?.value,
          venue_image : this.venue_image,
          venue_contact : this.venue_form.get('venueContact')?.value
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
        if(this.venue_form.get('venueName')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the venue name.", "error");
        }

        if(this.venue_form.get('venueAddress')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter venue address.", "error");
        }

        if(this.venue_form.get('venueContact')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the venue contact details.", "error");
        }

        if(this.venue_form.get('venueDescription')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter a description of the venue.", "error");
        }

        if(this.venue_form.get('venue_image')?.hasError('required'))
        {
            this.sharedService.showNotification("Please add an image of the venue.", "error");
        }
    }
}
