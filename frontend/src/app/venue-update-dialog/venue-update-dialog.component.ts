import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-venue-update-dialog',
  templateUrl: './venue-update-dialog.component.html',
  styleUrl: './venue-update-dialog.component.css'
})

export class VenueUpdateDialogComponent
{
    @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;
    venue_form: FormGroup;
    selected_file: File | null = null;
    image_preview: string | ArrayBuffer | null = null;
    venue_image : any;
    venue_id : any;
    existing_data: any =
    {
        venue_name: '',
        venue_address: '',
        venue_description: '',
        venue_contact: '',
        venue_image: '',
    };

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                @Inject(MAT_DIALOG_DATA) public data: any,
                public route : ActivatedRoute,
                private fb: FormBuilder,
                public dialogRef: MatDialogRef<VenueUpdateDialogComponent>)
                {
                    this.venue_form = this.fb.group(
                    {
                        venueName: ['', Validators.required],
                        venueAddress: ['', Validators.required],
                        venueDescription: ['', Validators.required],
                        venueImage: [null],
                        venueContact: ['', Validators.required],
                    });
                }

    ngOnInit()
    {
        this.venue_id = this.data.venue_id;
        this.populateForm();
    }

    populateForm()
    {
        this.webService.getVenueByID(this.venue_id).subscribe(
        {
            next : (data : any) =>
            {
                const venue_name = data[0].name;
                const venue_address = data[0].address;
                const venue_description = data[0].description;
                const venue_contact_info = data[0].contact_info;
                const venue_image = data[0].image;

                this.existing_data.venue_name = venue_name;
                this.existing_data.venue_address = venue_address;
                this.existing_data.venue_description = venue_description;
                this.existing_data.venue_contact = venue_contact_info;
                this.existing_data.venue_image = venue_image;

                this.venue_form.patchValue(
                {
                    venueName : venue_name,
                    venueAddress : venue_address,
                    venueDescription : venue_description,
                    venueContact : venue_contact_info,
                    venueImage : venue_image,
                });
            },
            error : (error) =>
            {
                console.log(error);
            }
        })
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
                    venueImage: file,
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
        // ADD SOMETHING TO DELETE THE EXISTING IMAGE
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
                        this.submitUpdateVenueDetails();

                        // CALL DELETE OLDER IMAGE HERE
                        this.webService.deleteVenueImage(this.existing_data.venue_image[1], this.existing_data.venue_image[2]).subscribe(
                        {
                            next : (response) =>
                            {
            
                            },
                            error : (error) =>
                            {
            
                            },
                            complete : () =>
                            {
                                console.log("Venue deleted!")
                                this.router.navigate(['/venues']);
                                // ADD NOTIFIER HERE
                            }
                        })
                    },
                    error : (error) =>
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
                console.log("Old image kept");
                this.venue_image = this.existing_data.venue_image;
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
          venue_name : this.venue_form.get('venueName')?.value,
          venue_address : this.venue_form.get('venueAddress')?.value,
          venue_description : this.venue_form.get('venueDescription')?.value,
          venue_image : this.venue_image,
          venue_contact : this.venue_form.get('venueContact')?.value
        }

        console.log(this.venue_image)

        this.webService.updateVenueDetails(this.venue_id, formData).subscribe(
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
                this.sharedService.showNotification("Venue updated", "success");
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

        if(this.venue_form.get('venueImage')?.hasError('required'))
        {
            this.sharedService.showNotification("Please add an image of the venue.", "error");
        }
    }
}
