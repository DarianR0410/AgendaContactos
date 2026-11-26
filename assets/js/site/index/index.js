    const inputName = document.getElementById("name");
    const inputPhone = document.getElementById("phone");
    const inputPicture =  document.getElementById("picture");
    const inputContactType = document.getElementById("contact-type");

let editingContact = null; // referencias a la tarjeta que se esta editando

function GenerateHtmlContact(){

    if(Validate()){
    if(editingContact){
        editingContact.img.setAttribute("src", inputPicture.value);
        editingContact.img.setAttribute("alt", inputName.value);
        editingContact.title.innerText = inputName.value;
        editingContact.phone.innerText = `phone: ${inputPhone.value}`;
        editingContact.type.innerText = `contact type: ${inputContactType.value}`;
        editingContact = null;
        document.getElementById("save-button").innerText = "Save";
        Clear();
        return;
    }
    const contactContainer = document.getElementById("contact-container");
    const valueName = inputName.value;
    const valuePhone = inputPhone.value;
    const valuePicture = inputPicture.value;
    const valueContactType = inputContactType.value;

    const divCol = document.createElement("div");
    divCol.setAttribute("class", "col-12 col-sm-3 mt-3");

    const divCard = document.createElement("div");
    divCard.setAttribute("class", "card");

    const imgTop = document.createElement("img");
    imgTop.setAttribute("src", valuePicture);
    imgTop.setAttribute("class", "card-img-top");
    imgTop.setAttribute("alt", valueName);

    const divCardBody = document.createElement("div");
    divCardBody.setAttribute("class", "card-body");

    const h5CardTitle = document.createElement("h5");
    h5CardTitle.setAttribute("class", "card-title");
    h5CardTitle.innerText = valueName;

    const ulGroup = document.createElement("ul");
    ulGroup.setAttribute("class", "list-group list-group-flush");

    const liPhone = document.createElement("li");
    liPhone.setAttribute("class", "list-group-item");
    liPhone.innerText = `phone: ${valuePhone}`; //string interpolation

    const liContactType = document.createElement("li");
    liContactType.setAttribute("class", "list-group-item");
    liContactType.innerText = `contact type: ${valueContactType}`;

    const divButton = document.createElement("div");
    divButton.setAttribute("class", "mt-1");

    const deleteButton = document.createElement("button");
    deleteButton.setAttribute("class", "btn btn-outline-danger float-end");
    deleteButton.type = "button";
    deleteButton.innerText = "Delete";

    deleteButton.addEventListener("click", function(){
        if(confirm("Are you sure you want to delete this contact?")){
            contactContainer.removeChild(divCol);
        }
    });

    const editButton = document.createElement("button");
    editButton.setAttribute("class", "btn btn-outline-secondary float-end me-2 edit-button");
    editButton.type = "button";
    editButton.innerText = "Edit";

    editButton.addEventListener("click", function(){
        inputName.value = h5CardTitle.innerText;
        inputPhone.value = liPhone.innerText.replace("phone: ", "");
        inputPicture.value = imgTop.getAttribute("src");
        inputContactType.value = liContactType.innerText.replace("contact type: ", "");
        editingContact = { img: imgTop, title: h5CardTitle, phone: liPhone, type: liContactType };
        document.getElementById("save-button").innerText = "Update";
        inputName.focus();
    });

    divButton.appendChild(deleteButton);
    divButton.appendChild(editButton);

    ulGroup.appendChild(liPhone);
    ulGroup.appendChild(liContactType);

    divCardBody.appendChild(h5CardTitle);
    divCardBody.appendChild(ulGroup);
    divCardBody.appendChild(divButton);

    divCard.appendChild(imgTop);
    divCard.appendChild(divCardBody);

    divCol.appendChild(divCard);

    contactContainer.appendChild(divCol);
    Clear();
    

    } else {
        alert("All fields are required.")
    }

}

function Clear(){
    editingContact = null;
    document.getElementById("save-button").innerText = "Save";
    ClearInput(inputName, true);
    ClearInput(inputPhone);
    ClearInput(inputPicture);
    ClearInput(inputContactType);


}


function Validate(){
    let isValid = true;

    const valueName = inputName.value;
    const valuePhone = inputPhone.value;
    const valuePicture = inputPicture.value;
    const valueContactType = inputContactType.value;
    
    isValid = InputValidator(inputName, valueName, isValid);
    isValid = InputValidator(inputPhone, valuePhone, isValid);
    isValid = InputValidator(inputPicture, valuePicture, isValid);
    isValid = InputValidator(inputContactType, valueContactType, isValid);
    
    return isValid;
}

function InputValidator(input, value, isValid){
    
    if(value === "" || value == null || value == undefined){
        input.classList.add("input-error");
        input.classList.remove("input-success");
        return false;
    } else{
        input.classList.add("input-success");
        input.classList.remove("input-error");
    }
    if(!isValid){
        return false;
    } else 
        return true;
    }
    
    
function ClearInput(input, isFocus = false){
    if(input != null && input != undefined && input.value != ""){
        input.value = "";
        input.classList.remove("input-success");
        input.classList.remove("input-error");
    }
    
        if(isFocus){
            input.focus();
        }
    }