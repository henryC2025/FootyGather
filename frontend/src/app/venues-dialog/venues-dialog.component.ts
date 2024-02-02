import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    venueImageLink : any;

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
                        venueImage: [null],
                        venueContact: ['', Validators.required],
                    });
                }

    ngOnInit()
    {
    }

    public handleAddressChange(place: google.maps.places.PlaceResult)
    {
        if (place)
        {
            this.venueForm.get('venueAddress')?.setValue(place.formatted_address);
        }
    }

    public onFileSelected(event: any)
    {
        const file = event.target.files[0] as File;

        if (file)
        {
            if (file.type.startsWith('image/'))
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

        if (this.fileInput)
        {
            this.fileInput.nativeElement.value = '';
        }
    }

    private uploadImage()
    {
        const blobStorage = 'https://blobstoragehenry2001.blob.core.windows.net';

        const formData =
        {
            uploadFile: this.selectedFile
        };

        this.webService.uploadVenueImage(formData).subscribe(
        {
            next: (response : any) =>
            {
                console.log(response);
                console.log(response.filePath);
            },
            error: (error: any) =>
            {
                console.log("Error!");
            },
        });
    }

    onSubmit()
    {

    }

    public submitVenueDetails()
    {
        const formData =
        {
          venueName : this.venueForm.get('venueName')?.value,
          venueAddress : this.venueForm.get('venueAddress')?.value,
          venueDescription : this.venueForm.get('venueDescription')?.value,
          venueImage : this.venueForm.get('venueImage')?.value,
          venueContact : this.venueForm.get('venueContact')?.value
        }
        console.log(formData)
    }

    public onClose()
    {
        this.dialogRef.close();
    }
}
