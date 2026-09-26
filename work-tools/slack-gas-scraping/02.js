function SetTrigger1() {
  var triggerDay = new Date();
  triggerDay.setHours(9);
  triggerDay.setMinutes(00);
  ScriptApp.newTrigger("doGet").timeBased().at(triggerDay).create();
}

function deleteTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for(var i=0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == "doGet") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}
