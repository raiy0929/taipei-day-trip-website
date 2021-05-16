
const profile_name = document.querySelector('.profile_name');
const profile_email = document.querySelector('.profile_email');
const profile_birth = document.querySelector('.profile_birth');

async function getUserProfile(){
    let userReq = new Request(Req,{ method:"GET"});
    fetch(userReq).then((response) => {return response.json()}).then((result)=>{
        console.log(result);
        profile_name.textContent = result.data.name;
        profile_email.textContent = result.data.email;
        profile_birth.textContent = result.data.birth;
    })
}

getUserProfile();
