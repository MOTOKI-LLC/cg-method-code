var listenerID = stringIDToTypeID("AdobeScriptListener ScriptListener");
var keyLogID = charIDToTypeID('Log ');
var d = new ActionDescriptor;
d.putBoolean(keyLogID, false);
executeAction(listenerID, d, DialogModes.NO);
