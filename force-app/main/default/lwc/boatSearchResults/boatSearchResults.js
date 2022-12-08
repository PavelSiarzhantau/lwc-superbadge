import { LightningElement, api, wire, track } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import BOAT_NAME from '@salesforce/schema/Boat__c.Name';
import BOAT_LENGTH from '@salesforce/schema/Boat__c.Length__c';
import BOAT_PRICE from '@salesforce/schema/Boat__c.Price__c';
import BOAT_DESCRIPTION from '@salesforce/schema/Boat__c.Description__c';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';
const COLUMNS = [
    { label: 'Name', fieldName:  BOAT_NAME.fieldApiName, editable: true },
    { label: 'Length', fieldName: BOAT_LENGTH.fieldApiName, type: 'number', editable: true},
    { label: 'Price', fieldName: BOAT_PRICE.fieldApiName, type: 'currency', editable: true},
    { label: 'Description', fieldName: BOAT_DESCRIPTION.fieldApiName, editable: true},        
    ];
export default class BoatSearchResults extends LightningElement {

  _title;
  _message;
  _variant;
  _wiredData;
  selectedBoatId;
  columns = COLUMNS;
  boatTypeId = '';
  @track boats;
  isLoading = false;
    
  // wired message context
  @wire(MessageContext)
  messageContext;
    
  // wired getBoats method
  @wire(getBoats,{boatTypeId : '$boatTypeId'})  
  wiredBoats(response) {
      const { data, error } = response;
      this.boats = response;
      if (data) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
      } else if (error) {
          console.log(error);
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
    @api
    async refresh() {
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
        await refreshApex(this.boats);
        this.isLoading = true;
        await this.notifyLoading(this.isLoading);
        
   }
  
  // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        console.log('boatSearchResutls: ', this.selectedBoatId);
        this.sendMessageService(this.selectedBoatId);
   }
  
  // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId
        publish(this.messageContext, BOATMC, { recordId: boatId });
    
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {   
    // notify loading
      this.isLoading = false;
      this.notifyLoading(this.isLoading);
      const updatedFields = event.detail.draftValues;
      console.log('updatedFields: ' + updatedFields);
    // Update the records via Apex
    updateBoatList({data: updatedFields})
        .then(() => {
            this.isLoading = true;
            this.notifyLoading(this.isLoading);
            this._title = SUCCESS_TITLE;
            this._message = MESSAGE_SHIP_IT;
            this._variant = SUCCESS_VARIANT;
            this.template.querySelector("lightning-datatable").draftValues = [];
            this.refresh();
            this.template.querySelector("c-boats-near-me").updateBoatsInfo();
        })
        .catch(error => {
            this._title = ERROR_TITLE;
            this._message = error.getMessage();
            this._variant = ERROR_VARIANT;
        })
        .finally(() => {
            const evt = new ShowToastEvent({
                title: this._title,
                message: this._message,
                variant: this._variant,
            });
            this.dispatchEvent(evt);
        });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        const loadingInfo = isLoading ? 'doneloading' : 'loading';
        const notifyLoadingEvent = new CustomEvent(loadingInfo, { detail: isLoading });
        this.dispatchEvent(notifyLoadingEvent);
  }
}
