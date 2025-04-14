// api-test-await.js

(function(){
   const baseURL = 'http://localhost:8080'; //  for development
  //  const baseURL = 'http://134.122.0.238:8080'; // for Digital Ocean, 
   async function testAPIs(){
    try{
      // Declare variables outside so accessible later in if/else blocks
      let newPhoto;
      let photoId = null;
      //--------------------------------------------------------------------------
      // list all photos
        let list = await callAPI('GET', '/api/photos', null, null);
        console.log('\n\n**************\n list all current photos:');
        console.log(list);
        //--------------------------------------------------------------------------
        // create a photo with image, title, description and location hard coded
        let input = document.querySelector('input[type="file"]');
        if (!input.files[0]) {
          console.error("No file selected!");
        } else {
          let data = new FormData();
          data.append("image", input.files[0]);
          data.append("title", "BRICKYS API-TEST-AWAIT.JS TITLE");
          data.append("description", "INITIAL DESCRIPTION:  run from api-test-await.js");
          data.append("location", "BRICKYS HOUSE");
          console.log("api-test-await.js LINE 21: data =", data);
          console.log("api-test-await.js LINE 22: input.files[0] =", input.files[0]);
          newPhoto = await callAPI("POST", "/api/photos", null, data);
          photoId = newPhoto._id;
          console.log('\n\n***************\n create a new photo: ');
          console.log(newPhoto);
        }
        console.log("Photo ID:", photoId);
        //--------------------------------------------------------------------------
        // retrieve created photo 
        let retreivedNewPhoto = await callAPI('GET','/api/photos/'+newPhoto._id, null, null)
        console.log('\n\n**************\n retrieve the new created photo:');
        console.log(retreivedNewPhoto);
        //--------------------------------------------------------------------------
        // update description field of created photo
        const updatedData = {'description' : 'UPDATED DESCRIPTION: THIS DESCRIPTION WAS UPDATED IN API-TEST-AWAIT.JS'};
        let updatedPhoto = await callAPI('PUT','/api/photos/'+retreivedNewPhoto._id, null, updatedData)
        // let updatedPhoto = await callAPI('PUT','/api/photos/'+retreivedNewPhoto._id, null, retreivedNewPhoto)
        console.log('\n\n*************\n update the description field:');
        console.log('api-test-await LINED 53, updatedPhoto = ', updatedPhoto);
        //--------------------------------------------------------------------------
        // update commentArray field of created photo
        const newCommentArrayElement = {  // Define the comment 
          name: 'JB, added from api-text-await',
          date_time: 'whenever, added from api-text-await',
          comment_text: 'whatever, added from api-text-await'
        };
        let newUpdatedPhoto = await callAPI('PUT','/api/photos/addComment/'+retreivedNewPhoto._id, null, newCommentArrayElement)
        // let updatedPhoto = await callAPI('PUT','/api/photos/'+retreivedNewPhoto._id, null, retreivedNewPhoto)
        console.log('\n\n*************\n  add a comment to commentArray field:');
        console.log('api-test-await LINED 53, newUpdatedPhoto = ', newUpdatedPhoto);
        //--------------------------------------------------------------------------
        // now find again to confirm that the description update was changed
        let retreivedUpdatedPhoto = await callAPI('GET','/api/photos/'+updatedPhoto._id, null, null)
        console.log('\n\n*************\n getting updated photo from the database to confirm the updates have been stored');
        console.log(retreivedUpdatedPhoto);
        //--------------------------------------------------------------------------
        //delete
        let deletedPhoto = await callAPI('DELETE', '/api/photos/delete/'+retreivedUpdatedPhoto._id, null, null)
        console.log('\n\n*************\ndelete photo (should show the photo that was deleted):');
        console.log(deletedPhoto);
        //--------------------------------------------------------------------------
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
      
      return response.json(); 
    }catch(err){
      console.error(err);
      return "{'status':'error'}";
    }
  }
      
  // Calls the test function when clicking the button
  document.querySelector('#testme').addEventListener("click", ()=>{
    let input = document.querySelector('input[type="file"]')
    if (input.value){ 
      testAPIs();
    }else{
      alert("please select an image file first");
    }
  });
})();
