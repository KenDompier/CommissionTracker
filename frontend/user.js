document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const username = formData.get("loginUsername");
        const password = formData.get("loginPassword");
        console.log("Login form data:", { username, password });
        try {
            const response = await loginUser(username, password);
            alert("Login successful");
            window.location.href = "/index.html";
        } catch (error) {
            alert("Login failed. Please check your credentials.");
        }
    });

    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = new FormData(signupForm);
        const username = formData.get("signupUsername");
        const password = formData.get("signupPassword");

        // Log the data before sending the request
        console.log("Signup form data:", { username, password });

        try {
            const response = await signupUser(username, password);
            alert("Signup successful, please login to continue.");
            // Redirect or show success message as needed
        } catch (error) {
            alert("Signup failed. Username may already exist.");
        }
    });
});

async function loginUser(username, password) { 
    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    });
    if (!response.ok) {
        throw new Error("Login failed");
    }
    return response.json();
}

async function signupUser(username, password) {
    const response = await fetch("/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    });
    if (!response.ok) {
        throw new Error("Signup failed");
    }
    return response.json();
}

document.getElementById('showSignupForm').addEventListener('click', function() {
    document.getElementById('loginFormContainer').classList.add('hidden');
    document.getElementById('signupFormContainer').classList.remove('hidden');
});

document.getElementById('showLoginForm').addEventListener('click', function() {
    document.getElementById('signupFormContainer').classList.add('hidden');
    document.getElementById('loginFormContainer').classList.remove('hidden');
});

document.getElementById('forgotPasswordButton').addEventListener('click', function() {
    // Open a new window that covers the screen asking for an email
    const forgotPasswordWindow = window.open('forgot_password.html', 'forgotPasswordWindow', 'width=600,height=400,left=100,top=100');
});
