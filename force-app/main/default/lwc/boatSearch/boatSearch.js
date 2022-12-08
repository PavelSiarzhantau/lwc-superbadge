import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

 // imports
 export default class BoatSearch extends NavigationMixin(LightningElement) {
    isLoading = true;
    
    // Handles loading event
     handleLoading() {
         this.isLoading = false;
         console.log('loading');
    }
    
    // Handles done loading event
     handleDoneLoading() {
         this.isLoading = true;
         console.log('doneLoading');
    }
    
    // Handles search boat event
    // This custom event comes from the form
     searchBoats(event) {
         this.template.querySelector('c-boat-search-results').searchBoats(event.detail.boatTypeId);
    }
    
     createNewBoat() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new'
            }
        });
     }
  }