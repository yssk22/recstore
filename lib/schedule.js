// rendering functions
function redirectDefault() {
   var day = new Date();
   day.setDate(day.getDate() - 7);
   var ek = [day.getFullYear(), day.getMonth() + 1, day.getDate(),
             0,0];

   return {
      code :  302,
      headers : {
         "Location" : assetPath() +
            "/_list/schedule/records?descending=true&endkey=" +
            toJSON(ek)
      }
   };
}