// api-test-await.js

(function(){
   const baseURL = 'http://localhost:8080'; //  for development, it's http://localhost:8080
   async function testAPIs(){
    // test list first
    let testId = '';
    let testJSON = {};
    try{
      // list
      let list = await callAPI('GET', '/api/photos', null, null);
      console.log('\n\n**************\nlist results:');
      console.log(list);

      // create form data object with photo and metadata
      // This section is for uploading a file to the REST API
      let input = document.querySelector('input[type="file"]');

      // ✅ Declare `photoId` outside so it's accessible later
      let photoId = null;

      if (!input.files[0]) {
        console.error("❌ No file selected!");
      } else {
        let data = new FormData();
        data.append("image", input.files[0]);
        data.append("title", "BRICKYS API-TEST-AWAIT.JS TITLE");
        data.append("description", "run from api-test-await.js");
        data.append("location", "BRICKYS HOUSE");

        console.log("api-test-await.js LINE 21: data =", data);
        console.log("api-test-await.js LINE 22: input.files[0] =", input.files[0]);

        // ✅ Log raw API response before parsing JSON
        const newPhoto = await callAPI("POST", "/api/photos", null, data);
        console.log("✅ Created Photo:", newPhoto);

        // ✅ Assign `photoId` inside the block where `newPhoto` exists
        photoId = newPhoto._id;
        console.log('\n\n***************\ncreate results: BRICKY!!!');
        console.log(newPhoto);
      }

      //  
      console.log("📌 Photo ID:", photoId);

      // If you don't have a file upload component to your application, a simple JSON object will do
      /*
      let data = {
        "title": "My API Test Title",
        "description": "This is an AJAX API test"
      }
      */
      // create
      // let newPhoto = await callAPI('POST', '/api/photos', null, photoData)

        // find
        let retreivedNewPhoto = await callAPI('GET','/api/photos/'+newPhoto._id, null, null)
        console.log('\n\n**************\nfind results:');
        console.log(retreivedNewPhoto);

        // update description
        retreivedNewPhoto.description += ' appended by the AJAX API ';
        let updatedPhoto = await callAPI('PUT','/api/photos/'+retreivedNewPhoto._id, null, retreivedNewPhoto)
        console.log('\n\n*************\nupdate results:');
        console.log(updatedPhoto);
        
        // now find again to confirm that the description update was changed
        let retreivedUpdatedPhoto = await callAPI('GET','/api/photos/'+updatedPhoto._id, null, null)
        console.log('\n\n*************\nfind results (should contain updated description field):');
        console.log(retreivedUpdatedPhoto);

        //delete
        let deletedPhoto = await callAPI('DELETE', '/api/photos/'+retreivedUpdatedPhoto._id, null, null)
        console.log(deletedPhoto);

    } catch(err) {
        console.error(err);
    };
  }//end testAPIs

  async function callAPI(method, uri, params, body){
    jsonMimeType = {
      'Content-type':'application/json'
     }
    try{
      /*  Set up our fetch.
       *   'body' to be included only when method is POST
       *   If 'PUT', we need to be sure the mimetype is set to json
       *      (so bodyparser.json() will deal with it) and the body
       *      will need to be stringified.
       *   '...' syntax is the ES6 spread operator.
       *      It assigns new properties to an object, and in this case
       *      lets us use a conditional to create, or not create, a property
       *      on the object. (an empty 'body' property will cause an error
       *      on a GET request!)
       */
      const response = await fetch(baseURL + uri, {
        method: method, // GET, POST, PUT, DELETE, etc.
        ...(method=='POST' ? {body: body} : {}),
        ...(method=='PUT' ?  {headers: jsonMimeType, body:JSON.stringify(body)} : {})
      });
      // response.json() parses the textual JSON data to a JSON object. 
      // Returns a Promise that resolves with the value of the JSON object 
      //  which you can pick up as the argument passed to the .then()
      return response.json(); 
    }catch(err){
      console.error(err);
      return "{'status':'error'}";
    }
  }
      
  // Calls our test function when we click the button
  //  afer validating that there's a file selected.
  document.querySelector('#testme').addEventListener("click", ()=>{
    let input = document.querySelector('input[type="file"]')
    if (input.value){ 
      testAPIs();
    }else{
      alert("please select an image file first");
    }
  });
})();
