import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class WebService 
{
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
        return this.http.post('http://localhost:5000/api/v1.0/auth_user', data);
    }

    addNewUser(data : any)
    {
        let postData = new FormData();
        postData.append("oauth_id", data.oauth_id);
        postData.append("username", data.username);
        postData.append("email", data.email);

        return this.http.post('http://localhost:5000/api/v1.0/auth', postData);
    }

    testConnection()
    {
        return this.http.get('http://localhost:5000/api/v1.0/test');
    }

    userCheck(id : any)
    {

    }
}