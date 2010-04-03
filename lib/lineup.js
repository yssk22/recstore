// rendering functions
function redirectToday() {
   var day = new Date();
   var sk = [day.getFullYear(), day.getMonth() + 1, day.getDate(),
             4,0];

   day.setDate(day.getDate() + 1);
   var ek = [day.getFullYear(), day.getMonth() + 1, day.getDate(),
             3,59];

   return {
      code :  302,
      headers : {
         "Location" : assetPath() + "/_show/lineup?startkey=" +
            toJSON(sk) + "&endkey=" + toJSON(ek)
      }
   };
}