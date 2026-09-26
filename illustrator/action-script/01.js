var set = 'action_resize10';   
var action = 'resize';

// アクションの中身    
var actionStr = ['/version 3',  
'/name [ 15',  
'    616374696f6e5f726573697a653130',
']',  
'/isOpen 1',  
'/actionCount 1',  
'/action-1 {',  
    '/name [ 6',  
        '726573697a65',
    ']',  
    '/keyIndex 0',  
    '/colorIndex 0',  
    '/isOpen 1',  
    '/eventCount 1',  
    '/event-1 {',  
        '/useRulersIn1stQuadrant 0',  
        '/internalName (adobe_scale)',  
        '/localizedName [ 18',  
            '4d69736520c3a0206c27c3a96368656c6c65',
        ']',  
        '/isOpen 0',  
        '/isOn 1',  
        '/hasDialog 1',  
        '/showDialog 0',  
        '/parameterCount 4',  
        '/parameter-1 {',  
            '/key 1970169453',  
            '/showInPalette -1',  
            '/type (boolean)',  
            '/value 1',  
        '}',  
        '/parameter-2 {',  
            '/key 1818848869',  
            '/showInPalette -1',  
            '/type (boolean)',  
            '/value 1',  
        '}',  
        '/parameter-3 {',  
            '/key 1935895653',  
            '/showInPalette -1',  
            '/type (unit real)',  
            '/value 10.0',
            '/unit 592474723',  
        '}',  
        '/parameter-4 {',  
            '/key 1668247673',  
            '/showInPalette -1',  
            '/type (boolean)',  
            '/value 0',  
        '}',  
    '}',  
'}'].join('\n');   

createAction(actionStr, set);       
app.doScript(action, set);
app.unloadAction (set, '');

function createAction (actionStr, set) {    
  var fpath = Folder ('~/Desktop');
  var f = File(fpath +'/'+ set + '.aia');    
  f.open('w');    
  f.write(actionStr);    
  f.close();    
  app.loadAction(f);    
  f.remove();    
}
