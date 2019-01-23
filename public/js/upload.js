// $(document).ready(function(){
//   $('.upload-btn').on('click', function(){
//     $('#upload-input').click();
//     $('.progress-bar').text('0%');
//     $('.progress-bar').width('0%');
//   });
  
//   // Use ajax to send the input data to the server
//   $('#upload-input').on('change', function(){
//     var uploadInput = $('#upload-input').val();
//     if(uploadInput != ''){
//       // Set var fomData to  to ajax new FormData
//       var formData = new FormData();
//           // Use ajax new FormData
//       formData.append('upload', uploadInput[0].files[0]);
//       $.ajax({
//         url: '/upload',
//         type: 'POST',
//         data: formData,
//         processData: false,
//         contentType: false,
//         success: function(data){
//           $('#upload-input').val('');
//         },
//         // Make communication exist between client and server with XMLhttpRequest
//         xhr: function(){
//           var xhr = new XMLHttpRequest();
//           xhr.upload.addEventListener('progress', function(e){
//             if(e.lengthComputable){
//               var uploadPercent = e.loaded / e.total;
//                 uploadPercent = (uploadPercent * 100);
//                 $('.progress-bar').text(uploadPercent+'%');
//                 $('.progress-bar').width(uploadPercent+'%');
//                 if(uploadPercent === 100){
//                   $('.progress-bar').text('Done');
//                   $('#completed').text('File Uploaded');

//                 }
//             }
//           }, false)
//           return xhr;
//         }
//       })


//     }



//   })
// })

$(document).ready(function(){
    
  $('.upload-btn').on('click', function(){
      $('#upload-input').click();
      
      $('.progress-bar').text('0%');
      $('.progress-bar').width('0%');
  });
  
  $('#upload-input').on('change', function(){
      var uploadInput = $('#upload-input').val();
      
      if(uploadInput != ''){
          var formData = new FormData();
          
          formData.append('upload', uploadInput);
          
          $.ajax({
              url: '/upload',
              type: 'POST',
              data: formData,
              processData: false,
              contentType: false,
              success: function(data){
                $('#upload-input').val('');
              },
              
              xhr: function(){
                  var xhr = new XMLHttpRequest();

                  xhr.upload.addEventListener('progress', function(e){
                      if(e.lengthComputable){
                          var uploadPercent = e.loaded / e.total;
                          uploadPercent = (uploadPercent * 100);

                          $('.progress-bar').text(uploadPercent+'%');
                          $('.progress-bar').width(uploadPercent+'%');

                          if(uploadPercent === 100){
                              $('.progress-bar').text('Done');
                              $('#completed').text('File Uploaded');
                          }
                      }
                  }, false);

                  return xhr;
              }
          })
      }
  })
})























