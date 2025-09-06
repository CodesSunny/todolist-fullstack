const form = document.querySelector("form");
const todoInput = document.getElementById('todo-input');
const tbody= document.querySelector('tbody');
const taskBtn = document.getElementById("task-btn");
let storedTask = [];  //initialise empty list
let isEdit = false;    //control edit mode
let editId = null;    //track task being edited


// fetch db and display task on get method
const displayTask=async ()=>{
    try{
        const response = await fetch(' https://todolist-fullstack-jkm4.onrender.com');
        
        if(!response.ok) {
            throw new Error("response not ok" + response.status)
        } else{
            const data =await response.json();
            storedTask = data   // update local array with DB data             
            let trTemplate = ""; 
            
            //show task from array
            storedTask.forEach((item, index)=>{   
                             
                    trTemplate += `
                                    <tr>
                                        <td>${index+1 }</td>
                                        <td >${item.task }</td>
                                        <td>
                                            <i class="fa-solid fa-pen-to-square" onclick="editTask(${item.id}, event)"></i>
                                            <i  class="fa-solid fa-trash" onclick="deleteTask(${item.id})"></i>
                                        </td>
                                    </tr>
                                `
                        })     
            tbody.innerHTML = trTemplate;            
            return storedTask;
              }           

    }catch(err){
        console.log("error fetching data: ", err.message );  
        alert("some problem in data retreival: ", err.message);
    }    
}

displayTask();  //initially display on page load


// add new data and send to db
const saveTask=async()=>{
   let inputValue = todoInput.value.trim();

   if(!inputValue){
    alert("write a task");
    return;
   }

   try {
        // edit task : while edit mode 
   if(isEdit){
    //change task in input field and send to server
        const response = await fetch (` https://todolist-fullstack-jkm4.onrender.com/${editId}`, {
            method: 'PATCH',
            headers:{'Content-Type' : 'application/json'},
            body: JSON.stringify({editedTask :inputValue})
        })

    if(!response.ok ){
        throw new Error("error in fetching patch response ");
    }

     const data = await response.json();
     //reset btn text after edit done
     isEdit =   false;
     checkEdit();

   }else{
    // add task : while not edit mode
    //1 check duplicate task before adding
    for(let item of storedTask){
        if(item.task.toLowerCase() === inputValue.toLowerCase()) {
            alert("task already present");
            return;
        } 
   }

   //2 if not duplicate add new task to db
    const response = await fetch (' https://todolist-fullstack-jkm4.onrender.com', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
                                newTask : inputValue
                            })
        })
        if(!response.ok ){
        throw new Error("error in fetching post response ");
    }
        const data = await response.json();
    }
    
   } catch (err) {
    console.log( err.message );
    
   }
   
   await displayTask();
   todoInput.value = "";
}


// delete task 
const deleteTask =async (taskId)=>{
    const response = await fetch (` https://todolist-fullstack-jkm4.onrender.com/${taskId}`, {
        method: 'DELETE'
    })

    const data = await response.json();   //remaining data after deletion 
    await displayTask();    
}


//check edit
const checkEdit =()=>{
    //set btn text as per edit state
    taskBtn.textContent = isEdit? "Save Changes" : "Add Task";
}


//edit task
const editTask=(taskId, e )=>{
         isEdit = true;
         editId = taskId;
         checkEdit();

    //pre fill task in input field
    todoInput.value = e.target.parentElement.previousElementSibling.textContent.toLowerCase().trim(); 
}
 


form.addEventListener("submit", (e)=>{
    e.preventDefault();
    saveTask();  
})
