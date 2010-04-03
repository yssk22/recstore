function(doc, req){
   var m = require('vendor/crayon/lib/template');
   var a = "Hello {{msg}}";
   return m.render(a, {msg: "recstore"});
}