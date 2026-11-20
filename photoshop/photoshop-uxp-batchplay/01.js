const {app, action, core} = require('photoshop');
async function hideActiveLayer() {
  return await action.batchPlay([{
    _obj: "hide",
    _target: [{_ref: "layer", _enum: "ordinal"},
              {_ref: "document", _enum: "ordinal"}]
  }], {});
}
let result = core.executeAsModal(hideActiveLayer, {commandName: "Hide Layer"});
