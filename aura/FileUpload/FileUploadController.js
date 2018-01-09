({  
    save : function(component, event, helper) {
        helper.save(component, event);
    },
    
    waiting: function(component, event, helper) {
    	helper.waiting(component,event);
    },
    
    doneWaiting: function(component, event, helper) {
    	helper.doneWaiting(component,event);
    }
})