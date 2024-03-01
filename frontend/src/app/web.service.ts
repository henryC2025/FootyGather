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
    private community_id : any;
    private game_id : any;
    private oauth_id : any;
    private query : any;
    private cpiURL = 'https://prod-09.centralus.logic.azure.com:443/workflows/14df396b4875481e844146328068033a/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=nhXrxC9BMddEpgDKzGLg2RhkcdB2bhtih1M7vEHJaRc' 
    private cviURL = 'https://prod-09.centralus.logic.azure.com:443/workflows/22df00e54dad4c02be499f2b8ace1ec6/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=c9KFMZrMoGsCimGKKKMalT1TcBVyUhdy9RT_wrY7j8E'
    private dviURL = 'https://prod-10.centralus.logic.azure.com/workflows/3c43554199ed46b2a6c09a836ff86945/triggers/manual/paths/invoke/rest/v1/venues/media/{id}/{path}?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Y7W2YPve8tovGT_KBGVisnCHW-tMK-SR8kvA13Ehw0E';
    private dpiURL = 'https://prod-22.centralus.logic.azure.com/workflows/37daa6855a9a4e0da8afdf1d19e112ee/triggers/manual/paths/invoke/rest/v1/profile/media/{id}/{path}?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=M8i0j3x8EdYBJHW56VNSuPwKGffUX64moXCaBBF4600';
    private cciURL = 'https://prod-27.centralus.logic.azure.com:443/workflows/cd7fe63d7af94240a8aaa3d3a38288c8/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7Fg4r1odgjnX8cZqPkxKxR47K1S1aqpAJljn6s9ov-Y'
    private dciURL = 'https://prod-20.centralus.logic.azure.com/workflows/79b108a852ce417c93260c0c8ebbe2a5/triggers/manual/paths/invoke/rest/v1/communities/media/{id}/{path}?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kWdx4MOL4QD5wB5tPlGytctC4058kmf_JEVc2ZT92dk'
    constructor(private http: HttpClient) {}
    
    //  Users
    uploadProfileImage(data : any)
    {
        let postData = new FormData();
        postData.append("oauthID", data.oauthID);
        postData.append("userName", data.userName);
        postData.append("uploadFile", data.uploadFile);

        return this.http.post(this.cpiURL, postData);
    }
    
    deleteProfileImage(id : any, file_path : any)
    {
        const file_path_full = file_path.split('/');
        const file_path_id = file_path_full[file_path_full.length - 1];
        const url = `${this.dpiURL.replace('{id}', id)}`;
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

    authUser(data : any)
    {
        return this.http.post('http://localhost:5000/api/v1.0/user', data);
    }

    deleteUser(id : any)
    {
        this.oauth_id = id;
        return this.http.delete(`http://localhost:5000/api/v1.0/user/delete/${this.oauth_id}`);
    }

    //  Venues
    addVenueDetails(data : any)
    {
        return this.http.post('http://localhost:5000/api/v1.0/venues/information', data);
    }

    uploadVenueImage(data : any)
    {
        let postData = new FormData();
        postData.append("uploadFile", data.uploadFile);

        return this.http.post(this.cviURL, postData);
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

    searchVenue(query : any)
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

    // Communities
    getCommunities(page : any)
    {
        return this.http.get('http://localhost:5000/api/v1.0/communities?pn=' + page);
    }

    getAllCommunities()
    {
        return this.http.get('http://localhost:5000/api/v1.0/all_communities');
    }

    getCommunityByID(id : any)
    {
        this.community_id = id;
        return this.http.get(
            'http://localhost:5000/api/v1.0/communities/' + this.community_id
        );
    }

    searchCommunity(query : any)
    {
        this.query = query
        return this.http.get(
            'http://localhost:5000/api/v1.0/communities/search?query=' + this.query
        );
    }

    addCommunityDetails(data : any)
    {
        return this.http.post('http://localhost:5000/api/v1.0/communities/information', data);
    }

    uploadCommunityImage(data : any)
    {
        let postData = new FormData();
        postData.append("uploadFile", data.uploadFile);

        return this.http.post(this.cciURL, postData);
    }

    deleteCommunityImage(id : any, file_path : any)
    {
        const file_path_full = file_path.split('/');
        const file_path_id = file_path_full[file_path_full.length - 1];
        const url = `${this.dciURL.replace('{id}', id)}`;
        const url_full = `${url.replace('{path}', file_path_id)}`;
        console.log(url_full)
        return this.http.delete(url_full);
    }

    updateCommunityDetails(id: string, data: any)
    {
        return this.http.put(`http://localhost:5000/api/v1.0/communities/information/${id}`, data);
    }

    deleteCommunity(id : any)
    {
        this.community_id = id;

        return this.http.delete(`http://localhost:5000/api/v1.0/communities/${this.community_id}`);
    }

    calculateDistance(origin: string, destination: string)
    {
        let baseUrl = 'http://localhost:5000/api/v1.0/';
        
        const url = `${baseUrl}/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
        return this.http.get<any>(url);
    }

    getAddressFromCoordinates(latitude : number, longitude : number)
    {
        const api_key = 'AIzaSyAYYaztrROgb-QD7ibhLJorPJILazXCNAo';
        let geocodingApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
        const url = `${geocodingApiUrl}?latlng=${latitude},${longitude}&key=${api_key}`;
        return this.http.get<any>(url);
    }

    saveCommunityDistanceFromUser(data : any)
    {
        return this.http.post('http://localhost:5000/api/v1.0/communities/save_distance', data);
    }

    resetCommunityDistanceFromUser(data : any)
    {
        return this.http.post('http://localhost:5000/api/v1.0/communities/distance_unavailable', data);
    }

    getSortedCommunities(sort_option : string)
    {
        return this.http.get(`http://localhost:5000/api/v1.0/communities/sort?sort_option=${sort_option}`);
    }
}