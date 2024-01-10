import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class WebService 
{
    game_list : any;
    // private game_id : any;
    // private user_id : any;
    // private comment_id : any;
    // private comment_text : any;
    // private query : any;

    constructor(private http: HttpClient) {}

    // authUser(data : any)
    // {
    //     return this.http.post('http://localhost:5000/api/v1.0/auth', postData);
    // }
}