//* find-freind page find freind fuctionality is developed to let only users with freind users
//* username be able to send freind request. Intially freind searching UI is rendered on GET request and
//* once user  tries to find a specific user with valid username a POSST request is sent to server and freinds data or error message is 
//* delivered as response. When send-request-button is avaliable in rendered page js file
//* add functionality to call freind-requst API in to send freind request button

document.addEventListener('DOMContentLoaded', function() {
    
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            button.classList.add('active');
            const targetPane = document.querySelector(button.dataset.tabTarget);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    const sendRequestBtn = document.getElementById('send-request-btn');
    if (sendRequestBtn) {
        sendRequestBtn.addEventListener('click', function() {
            const userId = this.dataset.userId;
            fetch(`/send-friend-request/${userId}/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': '{{ csrf_token }}' }
            })
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('friend-request-container');
                if (data.success) {
                    container.innerHTML = `<span class="status-badge secondary">Request Sent</span>`;
                } else { alert(data.error || 'An error occurred.'); }
            });
        });
    }

    document.querySelectorAll('.accept-request-btn').forEach(button => {
        button.addEventListener('click', function() {
            const requestId = this.dataset.requestId;
            fetch(`/accept-friend-request/${requestId}/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': '{{ csrf_token }}' }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const requestItem = document.getElementById(`request-${requestId}`);
                    requestItem.innerHTML = 'You are now friends.';
                    requestItem.style.justifyContent = 'center';
                    requestItem.style.padding = '15px';
                    requestItem.style.color = '#28a745';
                } else {
                    alert(data.error || 'An error occurred.');
                }
            });
        });
    });

});