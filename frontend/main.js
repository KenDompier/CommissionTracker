//Commission Base
let commissionId = document.getElementById('commission-id');
let commissions = document.getElementById('commissions');

//Text Inputs from User (TextBoxes)
let titleInput = document.getElementById('title');
let descInput = document.getElementById('desc');
let titleEditInput = document.getElementById('title-edit');
let descEditInput = document.getElementById('desc-edit');

//Date Input
let dateStarted;
let dateEdit;

//Commission Status from User (Dropdown Box Selection)
let statusChoice; //The Text Status
let barPercent; //The width of the progress Bar
let barColor; //The color of the progress bar

let statusEdit;
let percentEdit;
let colorEdit;

//Data/API
let data = [];
let selectedCommission = {};
let selectedCommissionId; // To store the ID of the commission to be deleted
const api = 'http://localhost:8000';

function tryAdd() {
  let msg = document.getElementById('msg');
  msg.innerHTML = '';
}

// Listen for adding
document.getElementById('addNew').addEventListener('click', () => {

  // Set the date input to today's date
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
  document.getElementById('myDate').value = formattedDate;
});


// Listen for Date Selection
document.getElementById('myDate').addEventListener('change', function(event) {
  dateStarted = event.target.value;
});

// Listen for Date Selection - Edit/Update Modal
document.getElementById('myDateUpdate').addEventListener('change', function(event) {
  dateEdit = event.target.value;
});

// Add event listener for file input change in "Add New Commission" modal
document.getElementById('image-upload').addEventListener('change', function(event) {
  handleImageUpload(event.target.files[0], 'add');
});

// Add event listener for file input change in "Edit Commission" modal
document.getElementById('image-upload-edit').addEventListener('change', function(event) {
  handleImageUpload(event.target.files[0], 'edit');
});


// Event listener for the toggleSort button
document.getElementById('toggleSort').addEventListener('click', sortCommissionsByStatus);

// Add event listener for the delete all button
document.getElementById('delete-all').addEventListener('click', () => {
  // Call the confirmDeleteCommission function to confirm deletion
  confirmDeleteCommission();
});



// Listen for User Selection for Commission Status
document.querySelector('[aria-labelledby="dropdownAdd"]').addEventListener('click', (e) => {
  // Add Commission: Modal Version
  if (e.target.classList.contains('dropdown-item') && e.target.getAttribute('key') === '1') {
    statusChoice = e.target.innerText; 

    let value = e.target.getAttribute('value');

    const progressBarWidths = {
      1: "15", 
      2: "25", 
      3: "50",
      4: "75",
      5: "100"    
    };

    const colorMap = {
      1: "red",
      2: "yellow",
      3: "teal",
      4: "blue",
      5: "green"
    };

    barPercent = progressBarWidths[value];
    barColor = colorMap[value];
  }
});

// Add Commission: Form-Add
document.getElementById('form-add').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!titleInput.value) {
    document.getElementById('msg').innerHTML = 'Commission title cannot be blank';
  } else if (statusChoice === undefined) {
    document.getElementById('msg').innerHTML = 'Commission status cannot be blank';
  } else {
    if (dateStarted === undefined || dateStarted === '') {
      dateStarted = "N/A, Payment Received";
    }
    addCommission(titleInput.value, descInput.value, statusChoice, barPercent, barColor, dateStarted);
    // Close Modal
    let add = document.getElementById('add');
    add.setAttribute('data-bs-dismiss', 'modal');
    add.click();
    (() => {
      add.setAttribute('data-bs-dismiss', '');
    })();

    // Reset the Text and Progress Bar
    const myBar = document.getElementById("myBar")
    statusChoice = undefined;
    myBar.style.width = 0;
    myBar.style.backgroundColor = "gray";
    const dateInput = document.getElementById('myDate');
    dateInput.value = '';
    dateStarted = undefined;
  }
});

// Add Commission 
let addCommission = (title, description, status, width, color, date) => {
  
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 201) {
      const newCommission = JSON.parse(xhr.responseText);
      data.push(newCommission);
      refreshCommissions();
    }
  };
  xhr.open('POST', `${api}/commissions`, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({ title, description, status , width, color, date}));
};

// Refresh commissions list// Listen for adding
document.getElementById('addNew').addEventListener('click', () => {
  // Reset the name and description fields
  titleInput.value = '';
  descInput.value = '';

  // Reset the commission status dropdown to its default value
  document.getElementById('dropdownAdd').innerText = 'Select a status';
  statusChoice = undefined;

  // Set the date input to today's date
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
  document.getElementById('myDate').value = formattedDate;
});

let refreshCommissions = () => {
  commissions.innerHTML = '';
  data
    .sort((a, b) => {
      const statusOrder = {
        'Paid / Starting': 1,
        'Sketch Completed': 2,
        'Lineart Completed': 3,
        'Coloring Completed': 4,
        'Completed': 5
      };

      // Determine if sorting should be ascending or descending
      let sortOrder = document.getElementById('toggleSort').getAttribute('data-sort-order');
      const ascending = sortOrder === 'asc';

      const orderA = statusOrder[a.status];
      const orderB = statusOrder[b.status];
      return ascending ? orderA - orderB : orderB - orderA;
    })
    .forEach((x) => {
      commissions.innerHTML += `
        <div id="commission-${x.id}">
          <span class="fw-bold fs-4">${x.title}</span>
          <pre class="text-secondary ps-12">${x.description}</pre>
          <span class="fs-6">Date Started: ${x.date}</span>
          <span class="fw-bold fs-5.2">${x.status}</span>
          <div id="myProgress">
            <span id="myBarStored" style="width: ${x.width}%; background-color: ${x.color};"></div>
          </span>
          <span class="options">
            <i onClick="tryEditCommission(${x.id})" data-bs-toggle="modal" data-bs-target="#modal-edit" class="fas fa-edit"></i>
            <input type="checkbox" class="commission-checkbox" id="checkbox-${x.id}">
          </span>
        </div>
      `;
    });
};

// Try Edit Commission
let tryEditCommission = (id) => {
  const commission = data.find((x) => x.id === id);
  selectedCommission = commission;
  commissionId.innerText = commission.id;
  titleEditInput.value = commission.title;
  descEditInput.value = commission.description;
  statusEdit = commission.status;
  percentEdit = commission.width;
  colorEdit = commission.color;
  dateEdit= commission.date;
  // Makes it so the date and commission status are put into the boxes when you edit
  document.getElementById('myDateUpdate').value = commission.date;
  // Set the commission status and update the progress bar color
  document.getElementById('dropdownEdit').innerText = commission.status;
  updateProgressBar2(commission.status);
  document.getElementById('msg').innerHTML = '';
};

// Update Modal Dropdown
document.querySelector('[aria-labelledby="dropdownEdit"]').addEventListener('click', (e) => {
if (e.target.classList.contains('dropdown-item') && e.target.getAttribute('key') === '2') {
  statusEdit = e.target.innerText; 

  let value = e.target.getAttribute('value');

  const progressBarWidths = {
    1: "15", 
    2: "25", 
    3: "50",
    4: "75",
    5: "100"  
  };

  const colorMap = {
    1: "red",
    2: "yellow",
    3: "teal",
    4: "blue",
    5: "green"
  };

  percentEdit = progressBarWidths[value];
  colorEdit = colorMap[value];
}
});

// Form Update/Edit Submit
document.getElementById('form-edit').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!titleEditInput.value) {
    msg.innerHTML = 'Commission cannot be blank';
  } else {
    editCommission(titleEditInput.value, descEditInput.value, statusEdit, percentEdit, colorEdit, dateEdit);

    // Close Modal
    let edit = document.getElementById('edit');
    edit.setAttribute('data-bs-dismiss', 'modal');
    edit.click();
    (() => {
      edit.setAttribute('data-bs-dismiss', '');
    })();

    // Reset Commission Status Selection
    document.getElementById('dropdownAdd').innerHTML = "Select a status";
    const myBar = document.getElementById("myBar")
    myBar.style.width = 0;
    myBar.style.backgroundColor = "gray";
  }
});


let editCommission = (title, description, status, width, color, date) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      selectedCommission.title = title;
      selectedCommission.description = description;
      selectedCommission.status = status;
      selectedCommission.width = width;
      selectedCommission.color = color;
      selectedCommission.date = date;
      refreshCommissions();
    }
  };
  xhr.open('PUT', `${api}/commissions/${selectedCommission.id}`, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({ title, description, status, width, color, date }));
};

// Track selected checkboxes
document.querySelectorAll('.commission-checkbox').forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      // Checkbox is checked
      // Handle logic to track selected commission
    } else {
      // Checkbox is unchecked
      // Handle logic to untrack selected commission
    }
  });
});

// Confirm delete commission
function confirmDeleteCommission() {
  // Get the number of selected commissions
  const selectedCount = document.querySelectorAll('.commission-checkbox:checked').length;
  
  // Update modal title and confirmation message based on the number of selected commissions
  const modalDelete = document.getElementById('modal-delete');
  const modalTitle = document.getElementById('modal-delete-title');
  const modalBody = document.querySelector('#modal-delete .modal-body p');
  
  if (selectedCount === 1) {
    modalTitle.textContent = 'Confirm Deletion';
    modalBody.textContent = 'Are you sure you want to delete this commission?';
  } else {
    modalTitle.textContent = `Confirm Deletion (${selectedCount} commissions)`;
    modalBody.textContent = `Are you sure you want to delete these ${selectedCount} commissions?`;
  }
  
  // Show the modal
  const modalInstance = new bootstrap.Modal(modalDelete);
  modalInstance.show();
}

// Event listener for confirm delete button in the delete confirmation modal
document.getElementById('confirm-delete').addEventListener('click', () => {
  // Array to store IDs of selected commissions
  const selectedIds = [];
  
  // Iterate over checkboxes to find selected commissions
  document.querySelectorAll('.commission-checkbox').forEach((checkbox) => {
    if (checkbox.checked) {
      // Extract commission ID from checkbox ID
      const id = checkbox.id.split('-')[1];
      selectedIds.push(id);
    }
  });
  
  // Delete selected commissions
  selectedIds.forEach((id) => {
    deleteCommission(id);
  });

  // Close modal
  let modalDelete = document.getElementById('modal-delete');
  let modalInstance = bootstrap.Modal.getInstance(modalDelete);
  modalInstance.hide();
});

// Function to delete a commission
function deleteCommission(id) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      data = data.filter((x) => x.id !== id);
      refreshCommissions();
    }
  };
  xhr.open('DELETE', `${api}/commissions/${id}`, true);
  xhr.send();
}


let resetForm = () => {
  titleInput.value = '';
  descInput.value = '';
  statusChoice = undefined;
  barPercent = '0';
  barColor = 'gray'
};

let getCommissions = () => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      data = JSON.parse(xhr.responseText) || [];
      refreshCommissions();
    }
  };
  xhr.open('GET', `${api}/commissions`, true);
  xhr.send();
};

(() => {
  getCommissions();
})();

// Add Modal Functions
function updateText(option) {
  const dropdownButton = document.getElementById("dropdownAdd");

  const optionChoice = {
    A: 'Paid / Starting', 
    B: 'Sketch Completed', 
    C: 'Lineart Completed',  
    D: 'Coloring Completed', 
    E: 'Completed', 
  };

  dropdownButton.innerText = optionChoice[option];
  updateProgressBar(option);
}

function updateProgressBar(option) {
  const myBar = document.getElementById("myBar");
  const progressBarWidths = {
      A: "15%", 
      B: "25%", 
      C: "50%",
      D: "75%",
      E: "100%"  
  };

  // Set the width and color based on the selected option
  myBar.style.width = progressBarWidths[option];
  myBar.style.backgroundColor = getBackgroundColor(option);
}

function getBackgroundColor(option) {
  // Define color mappings based on options (you can customize this)
  const colorMap = {
      A: "red",
      B: "yellow",
      C: "teal",
      D: "blue",
      E: "green"
  };

  return colorMap[option] || "gray"; // Default to gray if option not found
}

// Edit Modal Functions
function updateTextEdit(option) {
  const dropdownButton = document.getElementById("dropdownEdit");

  const optionChoice = {
    A: 'Paid / Starting', 
    B: 'Sketch Completed', 
    C: 'Lineart Completed',  
    D: 'Coloring Completed', 
    E: 'Completed', 
  };

  dropdownButton.innerText = optionChoice[option];
  updateProgressBar2(option);
}

// Progress Bar in Edit/Update Modal
function updateProgressBar2(option) {
  const myBar = document.getElementById("myBarEdit");
  const progressBarWidths = {
    A: "15%", 
    B: "25%", 
    C: "50%",
    D: "75%",
    E: "100%"  
  };

  // Set the width and color based on the selected option
  myBar.style.width = progressBarWidths[option];
  myBar.style.backgroundColor = getBackgroundColor2(option);
}

function getBackgroundColor2(option) {
  // Define color mappings based on options (you can customize this)
  const colorMap = {
      A: "red",
      B: "yellow",
      C: "teal",
      D: "blue",
      E: "green"
  };

  return colorMap[option] || "gray"; // Default to gray if option not found
}

// Function to handle image upload
function handleImageUpload(file, mode) {
  const formData = new FormData();
  formData.append('image', file);

  // Make an AJAX request to upload the image
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // Image uploaded successfully
        const imageUrl = xhr.responseText;
        if (mode === 'add') {
          // Update the URL or any other relevant attribute for the new commission
          document.getElementById('desc').value += `\n\nImage URL: ${imageUrl}`;
        } else if (mode === 'edit') {
          // Update the URL or any other relevant attribute for the edited commission
          document.getElementById('desc-edit').value += `\n\nImage URL: ${imageUrl}`;
        }
      } else {
        // Handle error
        console.error('Failed to upload image.');
      }
    }
  };
  xhr.open('POST', '/upload-image', true); // Adjust the endpoint URL for image upload
  xhr.send(formData);
}


// Function to sort commissions by status
function sortCommissionsByStatus() {
  // Get the current sort order
  let sortOrder = document.getElementById('toggleSort').getAttribute('data-sort-order');
  
  // Toggle the sort order
  sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';

  // Update the data-sort-order attribute
  document.getElementById('toggleSort').setAttribute('data-sort-order', sortOrder);

  // Refresh the commissions list to apply the new sort order
  refreshCommissions();
  
}

