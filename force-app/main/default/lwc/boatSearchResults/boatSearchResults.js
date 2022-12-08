import { LightningElement, api, wire, track } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {

  selectedBoatId;
  columns = [];
  boatTypeId = '';
  @track boats;
  isLoading = false;
    _wiredData;
  // wired message context
  @wire(MessageContext)
  messageContext;
    
  // wired getBoats method
  @wire(getBoats,{boatTypeId : '$boatTypeId'})  
  wiredBoats({ data, error }) {
      this._wiredData = { data, error };
      if (data) {
        this.boats = data;
        console.log(JSON.stringify(this.boats));
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
      } else if (error) {
          console.error(error);
      }
  }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
      this.boatTypeId = boatTypeId;
      this.isLoading = false;
      this.notifyLoading(this.isLoading);
  }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  refresh() { }
  
  // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        console.log('boatSearchResutls: ', this.selectedBoatId);
   }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    updateBoatList({data: updatedFields})
    .then(() => {})
    .catch(error => {})
    .finally(() => {});
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        const loadingInfo = isLoading ? 'doneloading' : 'loading';
        const notifyLoadingEvent = new CustomEvent(loadingInfo, { detail: isLoading });
        this.dispatchEvent(notifyLoadingEvent);
  }
}
