//** This js file load functionality for edit button in each classroom card. Initially Django template
//** attached edit buttons for classrooms that user has created as instructor. When user clicks the edit button all 
//** fields are converted to input fields and when user save data API request with that is sent to server. */ 

document.addEventListener('DOMContentLoaded', function() {
    // console.log("class_edit_button.js loaded 😃");

    let editbuttons = document.querySelectorAll('.class_edit_button');
    editbuttons.forEach(button => button.addEventListener('click', (event) => {
        edit_post(event); 
    }));

});

function edit_post(event) {
    const button = event.currentTarget;                
    const icon = button.querySelector('i');            

    const classroomId = button.dataset.classroomId;
    const subjectId = classroomId + '-subject';
    const gradeId = classroomId + '-grade';

    const isEditing = icon.classList.contains("fa-pen");

    if (isEditing) {
        icon.classList.remove("fa-pen");
        icon.classList.add("fa-save");

        const imageInput = document.getElementById(`classroom-image-input-${classroomId}`);
        if (imageInput) {
            imageInput.style.display = 'block';  
        }

        const nameDiv = document.getElementById(classroomId);
        const subjectDiv = document.getElementById(subjectId);
        const gradeDiv = document.getElementById(gradeId);

        const nameInput = document.createElement('input');
        nameInput.id = classroomId;
        nameInput.className = 'edit-class-name-input';
        nameInput.value = nameDiv.textContent.trim();

        const subjectInput = document.createElement('input');
        subjectInput.id = subjectId;
        subjectInput.className = 'edit-class-subject-input';
        subjectInput.value = subjectDiv.textContent.trim();

        const gradeInput = document.createElement('input');
        gradeInput.id = gradeId;
        gradeInput.className = 'edit-class-grade-input';
        gradeInput.value = gradeDiv.textContent.trim();

        nameDiv.replaceWith(nameInput);
        subjectDiv.replaceWith(subjectInput);
        gradeDiv.replaceWith(gradeInput);

    } else if (icon.classList.contains("fa-save")) {
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
            formData.append('image', selectedImageFile);  
        }

        formData.append('_method', 'PUT');  

        fetch(`/editClassroom/${classroomId}`, {
            method: 'POST',                   
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
                imageElement.src = e.target.result;  
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
