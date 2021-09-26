const dropZone = document.querySelector('.drop-zone');
const fileInput = document.querySelector('#fileinput');
const browseBtn = document.querySelector('#browseBtn');

const progressContainer = document.querySelector('.progress-container');
const bgProgress = document.querySelector('.bg-progress');
const progressBar = document.querySelector('.progress-bar');
const percentDiv = document.querySelector('#precent');

const sharingContainer = document.querySelector('.sharing-container');
const fileURLInput = document.querySelector('#fileURL');
const copyBtn = document.querySelector('#copyBtn');

const emailForm = document.querySelector('#emailForm');
const toast = document.querySelector('.toast');
const maxAllowesSize=100*1024*1024;

const host = 'https://inshare615.herokuapp.com';
const uploadURL = `${host}/api/files`;
const emailURL = `${host}/api/files/send`;

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!dropZone.classList.contains('dragged')) {
        dropZone.classList.add('dragged')
    }
})

dropZone.addEventListener('dragleave', () => {
    if (dropZone.classList.contains('dragged')) {
        dropZone.classList.remove('dragged')
    }
})

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (dropZone.classList.contains('dragged')) {
        dropZone.classList.remove('dragged')
    }
    const files = e.dataTransfer.files;
    console.log(files);
    if (files.length) {
        fileInput.files = files;
        uploadFile();
    }
})

fileInput.addEventListener('change', () => {
    uploadFile();
})

browseBtn.addEventListener('click', () => {
    fileInput.click();
})

copyBtn.addEventListener('click', () => {
    fileURLInput.select();
    document.execCommand('copy');
    showToast("Link copied")
})

const uploadFile = () => {

    progressContainer.style.display = 'block';
    if(fileInput.files.length > 1){
        fileInput.value="";
        showToast("Only upload 1 file");
        return;
    }
    const file = fileInput.files[0];
    if(file.size > maxAllowesSize){
        fileInput.value="";
        showToast("Can't upload mare than 100MB");
        return;
    }
    const formData = new FormData();
    formData.append('myfile', file);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response)
            onUploadSuccess(JSON.parse(xhr.response))
        }
    };

    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror=()=>{
        fileInput.value="";
        showToast(`Error in upload: ${xhr.statusText}`);
    }

    xhr.open("POST", uploadURL);
    xhr.send(formData)
}

const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    // console.log(percent);
    const scaleX = `scaleX(${percent / 100})`;
    bgProgress.style.transform = scaleX;
    percentDiv.innerHTML = percent;
    progressBar.style.transform = scaleX;
}

const onUploadSuccess = ({ file: url }) => {
    console.log(url);
    fileInput.value = "";
    emailForm[2].removeAttribute('disabled');
    progressContainer.style.display = 'none';
    sharingContainer.style.display = 'block';
    fileURLInput.value = url;
}

emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = fileURLInput.value;

    const formData = {
        uuid: url.split('/').splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    }
    emailForm[2].setAttribute('disabled', 'true');
    console.table(formData);

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    }).then(res => res.json())
        .then(({ success }) => {
            if (success) {
                sharingContainer.style.display = "none";
                showToast("Email Sent");
            }
        })
})

let toastTimer;
// the toast function
const showToast = (msg) => {
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.classList.add("show");
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
};