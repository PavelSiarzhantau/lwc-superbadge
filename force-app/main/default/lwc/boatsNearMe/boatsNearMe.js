import { LightningElement, wire ,api, track} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { refreshApex } from '@salesforce/apex';
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {

  @api boatTypeId;
  @track mapMarkers = [];
  isLoading = true;
  isRendered;
  latitude;
  longitude;
    _wiredDta;
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
    @wire(getBoatsByLocation, {
        latitude: '$latitude',
        longitude: '$longitude',
        boatTypeId: '$boatTypeId'
    })
    wiredBoatsJSON(response) {
        this._wiredDta = response;
        const { error, data } = response;
      if (data) {
          console.log('getBoatsByLocation:: ' + data);
          this.createMapMarkers(data);
      } else if (error) {
          console.log('getBoatsByLocation ERROR:::' + error);
          const evt = new ShowToastEvent({
            title: ERROR_TITLE,
            message: error.getMessage(),
            variant: ERROR_VARIANT,
          });
          this.isLoading = false;
          this.dispatchEvent(evt);
      }
  }
  
  // Controls the isRendered property
  // Calls getLocationFromBrowser()
    renderedCallback() {
        if (!this.isRendered) {
            this.getLocationFromBrowser();
        }
        this.isRendered = true;
   }
  
  // Gets the location from the Browser
  // position => {latitude and longitude}
    getLocationFromBrowser() { 
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                console.log('latitude ' + this.latitude);
                console.log('longitude ' + this.longitude);
            }, (error) => {
                console.log('geolocation erorr::: ' + error);
            }, { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true });
        }
    }
  
  // Creates the map markers
  createMapMarkers(boatData) {
      const newMarkers = JSON.parse(boatData).map(boat => {
          return {
              location: {
                  Latitude: boat.Geolocation__Latitude__s,
                  Longitude: boat.Geolocation__Longitude__s,
              },
              title: boat.Name,
          }
      });
      newMarkers.unshift({
        title: LABEL_YOU_ARE_HERE,
        icon: ICON_STANDARD_USER,
        location: {
            Latitude: this.latitude,
            Longitude: this.longitude
        }
      });
      this.mapMarkers = newMarkers;
      this.isLoading = false;   
  }
    @api
    updateBoatsInfo() {
        if (this.isRendered) {
            console.log('colled');
            refreshApex(this._wiredDta);  
        }
    }
}
