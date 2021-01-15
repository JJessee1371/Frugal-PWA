//Setup database name and version number
let db;
const req = indexedDB.open('budget', 1);

//Create an object store on upgrade event
req.onupgradeneeded = event => {
  const db = event.target.result;
  db.createObjectStore('pending', { autoIncrement: true });
};

//Successfully connected to the database
req.onsuccess = event => {
  db = event.target.result;
  //Verify online status before checking database function is called
  if (navigator.onLine) {
    checkDatabase();
  }
};

//Log error if one occurs during connection
req.onerror = event => {
  console.log("Request Error: ", event.target.errorCode);
};

//Save a transaction record to the database
const saveRecord = (record) => {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
};
 
//Check database transactions
const checkDatabase = () => {
   const transaction = db.transaction(["pending"], "readwrite");
   const store = transaction.objectStore("pending");
   //Retrieve all records
   const getAll = store.getAll();
 
   getAll.onsuccess = function() {
     if (getAll.result.length > 0) {
       fetch("/api/transaction/bulk", {
         method: "POST",
         body: JSON.stringify(getAll.result),
         headers: {
           Accept: "application/json, text/plain, */*",
           "Content-Type": "application/json"
         }
       })
       .then(response => response.json())
       .then(() => {
         const transaction = db.transaction(["pending"], "readwrite");
         const store = transaction.objectStore("pending");
         store.clear();
       });
     }
   };
};

//Online event listener
window.addEventListener("online", checkDatabase);