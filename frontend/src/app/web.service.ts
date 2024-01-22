import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class WebService 
{
    GOOGLE_API = "AIzaSyB8nrqDiRpBa4gUm_IuElatFUUyK0tTx7Q";
    venue_list : any;
    community_list : any;
    game_list : any;
    private game_id : any;
    private user_id : any;
    // private game_id : any;
    // private user_id : any;
    // private comment_id : any;
    // private comment_text : any;
    // private query : any;

    constructor(private http: HttpClient) {}

    authUser(data : any)
    {
        // let postData = new FormData();
        // postData.append("oauth_id", data.oauth_id);
        return this.http.post('http://localhost:5000/api/v1.0/user', data);
    }

    addNewUserInformation(data : any)
    {
        // USER
        // - ObjectID - HAVE
        // - OAuthID - HAVE
        // - UserName - HAVE
        // - Email - HAVE
        // - Location - HAVE
        // - Balance - START AT 0
        // - OrganizerRating (GameID, AvgRating) - START AT NULL
        // - ProfileImage (Use Azure Blob)
        // - Description - HAVE
        // - Games joined - START AT 0 
        // - Games attended - START AT 0
        // - CreateAt - USE DATE FORMAT
        // - IsSubscribed - HAVE

        // ## IF NO PROFILE PICTURE PROVIDED USE A DEFAULT IMAGE
        let postData = new FormData();
        postData.append("oauth_id", data.oauth_id);
        postData.append("username", data.username);
        postData.append("email", data.email);

        return this.http.post('http://localhost:5000/api/v1.0/user/information', postData);
    }

    testConnection()
    {
        return this.http.get('http://localhost:5000/api/v1.0/test');
    }

    userCheck(id : any)
    {

    }
}