({
    MAX_FILE_SIZE: 4 500 000, /* 6 000 000 * 3/4 to account for base64 */
    CHUNK_SIZE: 950 000, /* Use a multiple of 4 */

    save : function(component, event) {
    	var successElement = component.find("uploadSuccess");
    	$A.util.addClass(successElement,"slds-hide");

    	this.waiting(component, event);

        var fileInput = component.find("file").getElement();
    	var file = fileInput.files[0];
    	component.set("v.fileName", file.name);
   
        if (file.size > this.MAX_FILE_SIZE) {
            alert('File size cannot exceed ' + this.MAX_FILE_SIZE + ' bytes.\n' +
    		  'Selected file size: ' + file.size);
    	    return;
        }
        
        var fr = new FileReader();

        var self = this;
        fr.onload = function() {
            var fileContents = fr.result;
    	    var base64Mark = 'base64,';
            var dataStart = fileContents.indexOf(base64Mark) + base64Mark.length;

            fileContents = fileContents.substring(dataStart);
        
    	    self.upload(component, file, fileContents);
        };

        fr.readAsDataURL(file);
    },
        
    upload: function(component, file, fileContents) {
        var fromPos = 0;
        var toPos = Math.min(fileContents.length, fromPos + this.CHUNK_SIZE);
		
        // start with the initial chunk
        this.uploadChunk(component, file, fileContents, fromPos, toPos, '');   
    },
     
    uploadChunk : function(component, file, fileContents, fromPos, toPos, attachId) {
        var action = component.get("c.saveTheChunk"); 
        var chunk = fileContents.substring(fromPos, toPos);

        action.setParams({
            parentId: component.get("v.parentId"),
            fileName: file.name,
            base64Data: encodeURIComponent(chunk), 
            contentType: file.type,
            fileId: attachId
        });
       
        var self = this;
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                attachId = response.getReturnValue();
                
                fromPos = toPos;
                toPos = Math.min(fileContents.length, fromPos + self.CHUNK_SIZE);    
                if (fromPos < toPos) {
                	self.uploadChunk(component, file, fileContents, fromPos, toPos, attachId);  
                }else{
                    component.set("v.attachmentId", attachId);
                	var element = component.find("uploadSuccess");
                	$A.util.removeClass(element,"slds-hide");
                	this.doneWaiting(component, event);
                }
            }else{
                this.processErrors(component, response,"Problem saving, error: ", "error");
                this.doneWaiting(component, event);
                var element = component.find("uploadFail");
                $A.util.removeClass(element,"slds-hide");
            }
        });
            
        $A.enqueueAction(action); 
    },
    
    waiting: function(component, event) {
        var element = component.find("uploading").getElement();
    	$A.util.removeClass(element,"slds-hide");
    },
    
    doneWaiting: function(component, event) {
    	var element = component.find("uploading").getElement();
    	$A.util.addClass(element,"slds-hide");
    },

    processErrors : function(component, response, title, type){
        var messages = [];
        var errors = response.getError();
        if(errors[0].message){
            messages.push(errors[0].message);
        }
        for(var key in errors[0].fieldErrors){
            for(var i in errors[0].fieldErrors[key]){
                messages.push(errors[0].fieldErrors[key][i].message);
            }
                
        }
        for(var key in errors[0].pageErrors){
            messages.push(errors[0].pageErrors[key].message);
                
        }
        for(var key in errors[0].duplicateResults){
            messages.push(errors[0].duplicateResults[key].message); 
        }
        var message = "";
        for(var key in messages){
            if(message){
                message += "\r\n";
            }
            message += messages[key];
        }
        this.showToast(component, title, message, type);
        
    },

    showToast: function(component, title, message, type){
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "sticky"
        });
        toastEvent.fire();  
    }
})