import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import { WebService } from "./web.service";
import { Observable, Subject } from "rxjs";

@Injectable()
export class SharedService
{

    private userID : any;

    constructor(private http : HttpClient,
                public authService : AuthService,
                public webService : WebService) {} 
    
    // authUserCompleted: Subject<void> = new Subject<void>();

    // authUser() : Observable<any>
    // {
    //     return this.authService.isAuthenticated$;
    // }

    // setUserId(id: string)
    // {
    //     this.userID = id;
    // }
}