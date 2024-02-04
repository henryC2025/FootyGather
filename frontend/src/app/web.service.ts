import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class WebService 
{
    GOOGLE_API = "AIzaSyB8nrqDiRpBa4gUm_IuElatFUUyK0tTx7Q";
    venue_list : any;
    community_list : any;
    game_list : any;
    private venue_id : any;
    private game_id : any;
    private user_id : any;
    private oauth_id : any;
    private query : any;
    // private game_id : any;
    // private user_id : any;
    // private comment_id : any;
    // private comment_text : any;
    // private query : any;
    private cpiURL = 'https://prod-09.centralus.logic.azure.com:443/workflows/14df396b4875481e844146328068033a/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=nhXrxC9BMddEpgDKzGLg2RhkcdB2bhtih1M7vEHJaRc' 
    private cviURL = 'https://prod-09.centralus.logic.azure.com:443/workflows/22df00e54dad4c02be499f2b8ace1ec6/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=c9KFMZrMoGsCimGKKKMalT1TcBVyUhdy9RT_wrY7j8E'

    constructor(private http: HttpClient) {}

    uploadProfileImage(data : any)
    {
        let postData = new FormData();
        postData.append("oauthID", data.oauthID);
        postData.append("userName", data.userName);
        postData.append("uploadFile", data.uploadFile);

        return this.http.post(this.cpiURL, postData);
    }

    uploadVenueImage(data : any)
    {
        let postData = new FormData();
        postData.append("uploadFile", data.uploadFile);

        return this.http.post(this.cviURL, postData);
    }

    authUser(data : any)
    {
        return this.http.post('http://localhost:5000/api/v1.0/user', data);
    }

    addVenueDetails(data : any)
    {
        return this.http.post('http://localhost:5000/api/v1.0/venues/information', data);
    }

    addNewUserDetails(data : any)
    {
        let postData = new FormData();
        postData.append("oauth_id", data.oauthID);
        postData.append("user_name", data.userName);
        postData.append("first_name", data.firstName);
        postData.append("last_name", data.lastName);
        postData.append("description", data.description);
        postData.append("location", data.location);
        postData.append("experience", data.experience);
        postData.append("sub_notifications", data.subNotifications);
        postData.append("profile_image", data.profileImage);
        postData.append("games_joined", '0');
        postData.append("games_attended", '0');
        postData.append("balance", '0');
        postData.append("is_admin", 'false');

        return this.http.post('http://localhost:5000/api/v1.0/user/information', postData);
    }

    getUserDetails(data : any)
    {
        return this.http.post('http://localhost:5000/api/v1.0/user/details', data);
    }

    testConnection()
    {
        return this.http.get('http://localhost:5000/api/v1.0/test');
    }

    userCheck(id : any)
    {

    }

    searchGame(query : any)
    {
        this.query = query

        return this.http.get(
            'http://localhost:5000/api/v1.0/venues/search?query=' + query
        );
    }

    getCountOfVenues()
    {
        return this.http.get(
            'http://localhost:5000/api/v1.0/venues/count'
        );
    }

    getVenues(page : number)
    {
        return this.http.get(
            'http://localhost:5000/api/v1.0/venues?pn=' + page
        );
    }

    getVenueByID(id : any)
    {
        this.venue_id = id;
        return this.http.get(
            'http://localhost:5000/api/v1.0/venues/' + id
        );
    }

    addLike(venue_id : any, oauth_id : any)
    {
        this.venue_id = venue_id;
        let postData = new FormData();
        postData.append("oauth_id", oauth_id);

        return this.http.post(
            'http://localhost:5000/api/v1.0/venues/' + this.venue_id + '/likes_dislikes/likes', postData
        );
    }

    addDislike(venue_id : any, oauth_id : any)
    {
        this.venue_id = venue_id;
        let postData = new FormData();
        postData.append("oauth_id", oauth_id);

        return this.http.post(
            'http://localhost:5000/api/v1.0/venues/' + this.venue_id + '/likes_dislikes/dislikes', postData
        );
    }

    getLikesDislikesFromVenue(venue_id : any)
    {
        this.venue_id = venue_id;
        return this.http.get(
            'http://localhost:5000/api/v1.0/venues/' + this.venue_id + '/likes_dislikes'
        )
    }

    getLikesDislikesFromUser(oauth_id : any)
    {
        this.oauth_id = oauth_id;

        return this.http.get(
            'http://localhost:5000/api/v1.0/users/' + this.oauth_id + '/likes_dislikes'
        )
    }

    removeUserLikeFromGame(venue_id : any, oauth_id : any)
    {
        this.venue_id = venue_id;
        this.oauth_id = oauth_id;

        return this.http.delete(
            'http://localhost:5000/api/v1.0/venues/' + this.venue_id + '/likes_dislikes/likes?user_id=' + this.oauth_id)
    }

    removeUserDislikeFromGame(venue_id : any, oauth_id : any)
    {
        this.venue_id = venue_id;
        this.oauth_id = oauth_id;

        return this.http.delete(
            'http://localhost:5000/api/v1.0/venues/' + this.venue_id + '/likes_dislikes/dislikes?oauth_id=' + this.oauth_id)
    }
}