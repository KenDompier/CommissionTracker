let statusInput = document.getElementById('status');
let amtInput = document.getElementById('amount');
let payments = document.getElementById('payments'); 
let paymentId = document.getElementById('payment-id');

let data = [];

const api = 'http://127.0.0.1:8000';

function tryAdd() {
    let msg = document.getElementById('msg');
    msg.innerHTML = '';
    console.log("works");
  }

  //MONGODB THINGS
// Function to fetch portys from the backend
async function getPayments() {
    try {
      const response = await fetch(`${api}/payments`);
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const payments = await response.json();

      data = payments.payments;

      refreshPayments();
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  }

document.getElementById('form-add').addEventListener('submit', async (e) => {
    e.preventDefault();


      const paymentData = {
        // clientId: "Client ID",
        // artistId: "Artist ID",
        status: statusInput,
        amount: amtInput.value
      };
        const response = await fetch(`${api}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        });
        refreshPayments();
        if (!response.ok) {
          throw new Error('Failed to add payment');
        }
  
        //addCommission(commissionData);
        refreshPayments();
  
        // Close Modal
        let add = document.getElementById('add');
        add.setAttribute('data-bs-dismiss', 'modal');
        add.click();
        (() => {
          add.setAttribute('data-bs-dismiss', '');
        })();
  
        // Reset the Text and Progress Bar
        getPayments();
        refreshPayments();

      } 
  );


  
  // Function to refresh portys on the UI
  function refreshPayments() {
  
    payments.innerHTML = '';
    Array.from(data).forEach((x) => {
      payments.innerHTML += `
      <div class = "responsive">
      <div class="gallery">
            <div id="payment-${x.id}">
            <div class = "description">${x.status}</div>
            <pre class="fw-bold fs-4">$${x.amount}</pre>

                <i onClick="tryEditPayment('${x._id}')" data-bs-toggle="modal" data-bs-target="#modal-edit" class="fas fa-edit"></i>
                <i onClick="deletePayment('${x._id}')" class="fas fa-trash-alt"></i>
            
            </div>
        </div>    
        </div>
      `;
    });
    resetForm();
  }

  async function tryEditPayment(id) {
    // Find the commission with the specified ID
    const payment = data.find(obj => obj._id === id);
  
    // Populate the modal with the commission details
    document.getElementById('status-edit').value = payment.status;
    document.getElementById('amount-edit').value = payment.amount;
  
    // Set the commission ID in the modal title
    document.getElementById('payment-id').textContent = id;
  
    // Add event listener for the form submission
    const formEdit = document.getElementById('form-edit');
    formEdit.addEventListener('submit', async (event) => {
      event.preventDefault();
  

         // Map the selected status value to the corresponding key
  
      const updatedPayment = {
        status: document.getElementById('status-edit'),
        artistId: "artist",
        clientId: "client",
        amount: document.getElementById('amount-edit').value,

      };
      console.log(updatedPayment);
  
      try {
        // Send a PUT request to update the port in the database
        const response = await fetch(`/payments/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedPayment),
        });      
        getPayments();
        refreshPayments();
  
  
        if (!response.ok) {
          throw new Error('Failed to update payment');
        }
  
        // Refresh the portys list after updating
        refreshPayments();
  
        let update = document.getElementById('edit');
        update.setAttribute('data-bs-dismiss', 'modal');
        update.click();
        (() => {
          update.setAttribute('data-bs-dismiss', '');
        })();
  
        refreshPayments();
  
      } catch (error) {
        console.error('Error updating payment:', error);
        // Handle error
      }
    });
  }

  function resetForm() {
    amtInput.value = '';
    statusInput = '';
  }
getPayments();

  async function deletePayment(id) {

    try {
      const response = await fetch(`${api}/payments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete payment');
      }
      data = data.filter((x) => x._id !== id);
      refreshPayments();
    } catch (error) {
      console.error('Error deleting payments:', error);
    }
  }
