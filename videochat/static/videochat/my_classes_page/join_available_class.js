//*This js file add functionality for enroll class button in classroom cards in find new classroom page */

document.addEventListener('DOMContentLoaded', function() {

    const enrollButtons = document.querySelectorAll('.enroll-btn');

    enrollButtons.forEach(button => {
        button.addEventListener('click', function() {
            const classroomId = this.dataset.classroomId;
            enrollClassroom(classroomId);
        });
    });

    function enrollClassroom(classroomId) {
        fetch(`/enroll/${classroomId}/`, {
            method: 'PUT',
            headers: {
                'X-CSRFToken': '{{ csrf_token }}',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Enrolled successfully!");
                location.reload();
            } else {
                alert(data.error || "Something went wrong!");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to enroll.");
        });
    }
});