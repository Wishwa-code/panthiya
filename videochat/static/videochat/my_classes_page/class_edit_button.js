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
