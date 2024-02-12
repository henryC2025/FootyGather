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
    private dviURL = 'https://prod-10.centralus.logic.azure.com/workflows/3c43554199ed46b2a6c09a836ff86945/triggers/manual/paths/invoke/rest/v1/venues/media/{id}/{path}?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Y7W2YPve8tovGT_KBGVisnCHW-tMK-SR8kvA13Ehw0E';
    private dpiURL = 'https://prod-22.centralus.logic.azure.com/workflows/37daa6855a9a4e0da8afdf1d19e112ee/triggers/manual/paths/invoke/rest/v1/profile/media/{id}/{path}?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=M8i0j3x8EdYBJHW56VNSuPwKGffUX64moXCaBBF4600';
    constructor(private http: HttpClient) {}

    uploadProfileImage(data : any)
    {
        let postData = new FormData();
        postData.append("oauthID", data.oauthID);
        postData.append("userName", data.userName);
        postData.append("uploadFile", data.uploadFile);

        return this.http.post(this.cpiURL, postData);
    }

    // deleteProfileImage(data : any)
    // {

    // }

    deleteProfileImage(id : any, file_path : any)
    {
        const file_path_full = file_path.split('/');
        const file_path_id = file_path_full[file_path_full.length - 1];
        const url = `${this.dpiURL.replace('{id}', id)}`;
        const url_full = `${url.replace('{path}', file_path_id)}`;
        console.log(url_full)
        return this.http.delete(url_full);
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

    updateVenueDetails(id: string, data: any)
    {
        return this.http.put(`http://localhost:5000/api/v1.0/venues/information/${id}`, data);
    }

    deleteVenue(id : any)
    {
        this.venue_id = id;

        return this.http.delete(`http://localhost:5000/api/v1.0/venues/${this.venue_id}`);
    }

    deleteVenueImage(id : any, file_path : any)
    {
        const file_path_full = file_path.split('/');
        const file_path_id = file_path_full[file_path_full.length - 1];
        const url = `${this.dviURL.replace('{id}', id)}`;
        const url_full = `${url.replace('{path}', file_path_id)}`;
        console.log(url_full)
        return this.http.delete(url_full);
    }

    addNewUserDetails(data : any)
    {
        return this.http.post('http://localhost:5000/api/v1.0/user/information', data);
    }

    updateUserDetails(data : any)
    {
        return this.http.put('http://localhost:5000/api/v1.0/user/information', data);
    }

    getUserDetails(data : any)
    {
        return this.http.post('http://localhost:5000/api/v1.0/user/details', data);
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