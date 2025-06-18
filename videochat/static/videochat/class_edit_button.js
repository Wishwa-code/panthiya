document.addEventListener('DOMContentLoaded', function() {
    console.log("class_edit_button.js loaded 😃");

  let editbuttons = document.querySelectorAll('.class_edit_button');
  editbuttons.forEach(button => button.addEventListener('click', (event) => {
      edit_post(event); 
  }));

});

function edit_post(event) {
  const button = event.currentTarget;                 // Always the <button>
  const icon = button.querySelector('i');             // The icon inside

  const classroomId = button.dataset.classroomId;
  const subjectId = classroomId + '-subject';
  const gradeId = classroomId + '-grade';

  const isEditing = icon.classList.contains("fa-pen");

  if (isEditing) {
    // 👇 Switch to save state
    icon.classList.remove("fa-pen");
    icon.classList.add("fa-save");

    const imageInput = document.getElementById(`classroom-image-input-${classroomId}`);
    if (imageInput) {
      imageInput.style.display = 'block';  // Show file input
    }

    const nameDiv = document.getElementById(classroomId);
    const subjectDiv = document.getElementById(subjectId);
    const gradeDiv = document.getElementById(gradeId);

    const nameInput = document.createElement('input');
    nameInput.id = classroomId;
    nameInput.className = 'edit-class-subject-input';
    nameInput.value = nameDiv.textContent.trim();

    const subjectInput = document.createElement('input');
    subjectInput.id = subjectId;
    subjectInput.className = 'edit-class-other-input';
    subjectInput.value = subjectDiv.textContent.trim();

    const gradeInput = document.createElement('input');
    gradeInput.id = gradeId;
    gradeInput.className = 'edit-class-other-input';
    gradeInput.value = gradeDiv.textContent.trim();

    nameDiv.replaceWith(nameInput);
    subjectDiv.replaceWith(subjectInput);
    gradeDiv.replaceWith(gradeInput);

  } else if (icon.classList.contains("fa-save")) {
    // 👇 Switch to view state and save data
    icon.classList.remove("fa-save");
    icon.classList.add("fa-pen");

    const imageInput = document.getElementById(`classroom-image-input-${classroomId}`);
     if (imageInput) {
      imageInput.style.display = 'none';
    }
    const selectedImageFile = imageInput?.files[0];
    console.log("Selected image file:", selectedImageFile); 

    

    const nameInput = document.getElementById(classroomId);
    const subjectInput = document.getElementById(subjectId);
    const gradeInput = document.getElementById(gradeId);

    const updatedText = nameInput.value.trim();
    const updatedSubject = subjectInput.value.trim();
    const updatedGrade = gradeInput.value.trim();

    const formData = new FormData();
    formData.append('classroom_name', updatedText);
    formData.append('updated_subject', updatedSubject);
    formData.append('updated_grade', updatedGrade);

    if (selectedImageFile) {
      formData.append('image', selectedImageFile);  // Append image only if selected
    }

    // fetch(`/editClassroom/${classroomId}`, {
    //   method: 'PUT',
    //   body: formData
    // })
    formData.append('_method', 'PUT');  // 👈 tells backend this is actually a PUT

    fetch(`/editClassroom/${classroomId}`, {
      method: 'POST',                   // 👈 POST lets Django parse form data & files
      body: formData
    })
    .then(response => response.json())
    .then(result => {
      console.log("Saved successfully:", result);

    })
    .catch(error => {
      console.error('Error while saving:', error);
    });

    if (selectedImageFile) {
    const reader = new FileReader();
      reader.onload = function(e) {
        const imageElement = document.querySelector(`#classroom-image-${classroomId}`);
        if (imageElement) {
          imageElement.src = e.target.result;  // Preview new image
        }
      };
      reader.readAsDataURL(selectedImageFile);
    }

    const nameDiv = document.createElement('div');
    nameDiv.id = classroomId;
    nameDiv.className = 'classroom-title-inside-card';
    nameDiv.textContent = updatedText;

    const subjectDiv = document.createElement('div');
    subjectDiv.id = subjectId;
    subjectDiv.className = 'tag-card';
    subjectDiv.textContent = updatedSubject;

    const gradeDiv = document.createElement('div');
    gradeDiv.id = gradeId;
    gradeDiv.className = 'tag-card';
    gradeDiv.textContent = updatedGrade;

    nameInput.replaceWith(nameDiv);
    subjectInput.replaceWith(subjectDiv);
    gradeInput.replaceWith(gradeDiv);
  }
}
// function edit_post(event){
//     console.log(event.target.textContent.trim());

//     // Performing save operation with the updated text  
//     if (event.target.textContent.trim() == 'Save'){
//       console.log("Edit state:", event.target);
//       event.target.textContent = 'Save';
  
//     //   event.target.style.backgroundColor = '#1DA1F2';
  
//       let classroomId = event.currentTarget.dataset.classroomId;

//       let subjectId = classroomId + '-subject';
//       let gradeId = classroomId + '-grade';
  
//       let inputField = document.getElementById(classroomId);
//       let subjectField = document.getElementById(subjectId);
//       let gradeField = document.getElementById(gradeId);

//       // console.log(inputField);
      
//       let updatedText = inputField.value;
//       let updatedSubject = subjectField.value;
//       let updatedGrade = gradeField.value;
        
//         console.log('Saving updated text:', updatedText);
//           fetch(`/editClassroom/${classroomId}`, {
//             method: 'PUT',
//             body: JSON.stringify({
//               classroom_name: updatedText,
//               updated_subject: updatedSubject,
//               updated_grade: updatedGrade
//             })
//           })
//           .then(response => response.json())
//           .then(result => {
//             console.log("read update",result);
//           })
//           .catch(error => {
//             console.error('Error:', error);
//           });
  
//           // Converting the input back to a <p> element
//           new_classroom_name = document.createElement('div');
//           new_classroom_name.id = classroomId;
//           new_classroom_name.className = 'classroom-title-inside-card';
//           new_classroom_name.textContent = updatedText;

//           new_subject_name = document.createElement('div');
//           new_subject_name.id = subjectId;
//           new_subject_name.className = 'tag-card';
//           new_subject_name.textContent = updatedSubject;

//           new_grade_name = document.createElement('div');
//           new_grade_name.id = gradeId;
//           new_grade_name.className = 'tag-card';
//           new_grade_name.textContent = updatedGrade;  

//           inputField.replaceWith(new_classroom_name); 
//           subjectField.replaceWith(new_subject_name);
//           gradeField.replaceWith(new_grade_name);
  
//           // changing the button text back to 'Edit'
//                   //   event.target.className = 'class_edit_button';
//         //   event.currentTarget.className = 'class_edit_button';
//           const oldTxt = event.target.textContent;
//           event.target.textContent = oldTxt.replace("Save", "");
          
  

//     // Performing edit operation
//     }else if (event.target.classList.contains("fa-pen")){
//       console.log("Save state:", event.target);

//       event.target.textContent = 'Save';
//       event.target.classList.add('class_edit_button')

//       console.log("Save state changed icon:", event.target);
//     //   event.target.style.backgroundColor = '#17BF63';
//       let classroomId = event.currentTarget.dataset.classroomId;
//       // console.log("postId", event.target.dataset);
//       let classroom_name = document.getElementById(classroomId);

//       subjectId = classroomId + '-subject';
//       gradeId = classroomId + '-grade';
      
//       let classroom_subject = document.getElementById(subjectId);
//       let classroom_grade = document.getElementById(gradeId);


//       // console.log(classroom_name);
  
//       let inputField = document.createElement('input');

//       inputField.id = classroomId;
//       inputField.className = 'edit-class-subject-input';
//       inputField.value = classroom_name.textContent.trim(); 
      
//       let subjectinputField = document.createElement('input');

//       subjectinputField.id = subjectId;
//       subjectinputField.className = 'edit-class-other-input';
//       subjectinputField.value = classroom_subject.textContent.trim(); 

//       let gradeinputField = document.createElement('input');// Set the input value to the current text content
      
      
//       gradeinputField.id = gradeId;
//       gradeinputField.className = 'edit-class-other-input';
//       gradeinputField.value = classroom_grade.textContent.trim(); 

//       classroom_name.replaceWith(inputField);
//       classroom_subject.replaceWith(subjectinputField);
//       classroom_grade.replaceWith(gradeinputField);
  
//     } else{
//       console.log("Error state:", event.target);
//     }
//   }
