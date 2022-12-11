import { LightningElement,api,wire } from 'lwc';
// imports
import { NavigationMixin } from 'lightning/navigation';
// import getSimilarBoats
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';
const OBJECT_API_NAME = 'Boat__c';
export default class SimilarBoats extends NavigationMixin(LightningElement){
    // Private
    currentBoat;
    relatedBoats;
    boatId;
    error;
    // public
    @api
    get recordId() {
        // returns the boatId
        return this.boatId;
      }
    set recordId(value) {
        // sets the boatId value
        this.setAttribute('boatId', value);
        // sets the boatId attribute
        this.boatId = value;
      }
    
    // public
    @api
    similarBy;
    
    // Wire custom Apex call, using the import named getSimilarBoats
    // Populates the relatedBoats list
    @wire(getSimilarBoats,{boatId: '$boatId', similarBy: '$similarBy'})
    similarBoats({ error, data }) {
        if (data) {
            console.log('data::: ', data);
            this.relatedBoats = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            console.error(error);
            console.log(error.message);
        }
     }
    get getTitle() {
      return 'Similar boats by ' + this.similarBy;
    }
    get noBoats() {
      return !(this.relatedBoats && this.relatedBoats.length > 0);
    }
    
    // Navigate to record page
    openBoatDetailPage(event) {
        this.currentBoat = event.detail.boatId;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.currentBoat,
                objectApiName: OBJECT_API_NAME,
                actionName: 'view',
            }
        });
     }
  }
  