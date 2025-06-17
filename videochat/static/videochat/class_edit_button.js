document.addEventListener('DOMContentLoaded', function() {
    console.log("class_edit_button.js loaded 😃");

  let editbuttons = document.querySelectorAll('.class_edit_button');
  editbuttons.forEach(button => button.addEventListener('click', (event) => {
      edit_post(event); 
  }));

});


function edit_post(event){
    console.log(event.target.textContent.trim());

    // Performing save operation with the updated text  
    if (event.target.textContent.trim() == 'Save'){
      console.log("cathcing save");
      event.target.textContent = 'Save';
  
    //   event.target.style.backgroundColor = '#1DA1F2';
  
      let classroomId = event.currentTarget.dataset.classroomId;

      let subjectId = classroomId + '-subject';
      let gradeId = classroomId + '-grade';
  
      let inputField = document.getElementById(classroomId);
      let subjectField = document.getElementById(subjectId);
      let gradeField = document.getElementById(gradeId);

      console.log(inputField);
      
      let updatedText = inputField.value;
      let updatedSubject = subjectField.value;
      let updatedGrade = gradeField.value;
        
        console.log('Saving updated text:', updatedText);
          fetch(`/editClassroom/${classroomId}`, {
            method: 'PUT',
            body: JSON.stringify({
              classroom_name: updatedText,
              updated_subject: updatedSubject,
              updated_grade: updatedGrade
            })
          })
          .then(response => response.json())
          .then(result => {
            console.log("read update",result);
          })
          .catch(error => {
            console.error('Error:', error);
          });
  
          // Converting the input back to a <p> element
          new_classroom_name = document.createElement('div');
          new_classroom_name.id = classroomId;
          new_classroom_name.className = 'classroom-title-inside-card';
          new_classroom_name.textContent = updatedText;

          new_subject_name = document.createElement('div');
          new_subject_name.id = subjectId;
          new_subject_name.className = 'tag-card';
          new_subject_name.textContent = updatedSubject;

          new_grade_name = document.createElement('div');
          new_grade_name.id = gradeId;
          new_grade_name.className = 'tag-card';
          new_grade_name.textContent = updatedGrade;  

          inputField.replaceWith(new_classroom_name); 
          subjectField.replaceWith(new_subject_name);
          gradeField.replaceWith(new_grade_name);
  
          // changing the button text back to 'Edit'
                  //   event.target.className = 'class_edit_button';
        //   event.currentTarget.className = 'class_edit_button';
          const oldTxt = event.target.textContent;
          event.target.textContent = oldTxt.replace("Save", "");
          
  

    // Performing edit operation
    }else if (event.target.textContent.trim()== ''){
      console.log("cathichng edit")
      event.target.textContent = 'Save';
    //   event.target.style.backgroundColor = '#17BF63';
      //!probably culprit is hete
      let classroomId = event.currentTarget.dataset.classroomId;
      console.log("postId", event.target.dataset);
      let classroom_name = document.getElementById(classroomId);

      subjectId = classroomId + '-subject';
      gradeId = classroomId + '-grade';
      
      let classroom_subject = document.getElementById(subjectId);
      let classroom_grade = document.getElementById(gradeId);


      console.log(classroom_name);
  
      let inputField = document.createElement('input');

      inputField.id = classroomId;
      inputField.className = 'edit-class-subject-input';
      inputField.value = classroom_name.textContent.trim(); 
      
      let subjectinputField = document.createElement('input');

      subjectinputField.id = subjectId;
      subjectinputField.className = 'edit-class-other-input';
      subjectinputField.value = classroom_subject.textContent.trim(); 

      let gradeinputField = document.createElement('input');// Set the input value to the current text content
      
      
      gradeinputField.id = gradeId;
      gradeinputField.className = 'edit-class-other-input';
      gradeinputField.value = classroom_grade.textContent.trim(); 

      classroom_name.replaceWith(inputField);
      classroom_subject.replaceWith(subjectinputField);
      classroom_grade.replaceWith(gradeinputField);
  
    } else{
      console.log("cathicng error")
    }
  }
