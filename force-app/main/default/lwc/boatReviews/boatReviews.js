import { LightningElement,api } from 'lwc';
// imports
import { refreshApex } from '@salesforce/apex';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { NavigationMixin } from 'lightning/navigation';
export default class BoatReviews extends NavigationMixin(LightningElement) {
    // Private
    boatId;
    error;
    boatReviews;
    isLoading;
    
    // Getter and Setter to allow for logic to run on recordId change
    get recordId() {
        return this.boatId;
    }
    @api
    set recordId(value) {
      //sets boatId attribute
      //sets boatId assignment
      //get reviews associated with boatId
        this.setAttribute('boatId', value);
        this.boatId = value;
        this.getReviews();
    }
    
    // Getter to determine if there are reviews to display
    get reviewsToShow() { 
        return this.boatReviews != null &&
               this.boatReviews != undefined &&
               this.boatReviews.length > 0;
    }
    
    // Public method to force a refresh of the reviews invoking getReviews
    @api
    refresh() {
        this.getReviews();
     }
    
    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() {
        if (this.boatId) {
            this.isLoading = true;
            getAllReviews({ boatId: this.boatId })
                .then((result) => {
                    console.log(JSON.stringify(result));
                    this.boatReviews = result;
                })
                .catch((error) => {
                    this.error = error;
                })
                .finally(() => {
                    this.isLoading = false;
                })
        } 
     }
    
    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) { 
        const currentUserId = event.currentTarget.dataset.recordId;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: currentUserId,
                objectApiName: 'User',
                actionName: 'view',
            }
        });
    }
  }
  