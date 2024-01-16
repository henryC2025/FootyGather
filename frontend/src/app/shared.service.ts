import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import { WebService } from "./web.service";
import { Observable, Subject } from "rxjs";

@Injectable()
export class SharedService
{

    private isAuthCalled = false;
    private user : any;
    private oauthID : any;
    private isAuthenticated : any;

    constructor(private http : HttpClient,
                public authService : AuthService,
                public webService : WebService) {} 
    
    setAuthCalled(value : boolean)
    {
        this.isAuthCalled = value;
    }

    getAuthCalled()
    {
        return this.isAuthCalled;
    }

    resetAuthCalled()
    {
        this.isAuthCalled = false;
    }

    authUser()
    {
      this.authService.isAuthenticated$.subscribe((isAuthenticated: boolean) =>
      {
        this.isAuthenticated = isAuthenticated;

        if(this.isAuthenticated)
        {
          this.authService.user$.subscribe(user =>
          {
            this.user = user;

            console.log(this.user.sub)

            const userData =
            {
                oauth_id: this.user?.sub,
            };

            if(!this.getAuthCalled())
            {
              this.webService.authUser(userData).subscribe(
              {
                  next: (response) =>
                  {
                    console.log(response)

                    this.setAuthCalled(true);
                    // IF USER IS NEW
                    // CALL REDIRECT HERE TO PAGE ASKING FOR MORE INFORMATION

                    // IF USER EXISTS ALREADY
                    // CONTINUE TO NAVIGATE TO HOME PAGE
                  },
                  error: (error) =>
                  {
                    console.error('Error sending user information:', error);
                  },
              });
            }
            else
            {
              console.log("Auth already called!")
            }
          });
        }
        else
        {
          console.log("Not authenticated")
        }
      });
    }
}