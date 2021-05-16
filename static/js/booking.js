// ---- global settings
let bookingReq = new Request('/api/booking',{
    method:'GET',
    headers:userHeaders
});

const userName = document.querySelector('.userName');

const noOrderPage = document.querySelector('.content-noOrder');
const hasOrder = document.querySelector('.content-order');

const title = document.querySelector('.order_title');
const date = document.querySelector('.order_date');
const time = document.querySelector('.order_time');
const fee = document.querySelector('.order_fee');
const address = document.querySelector('.order_address');
const image = document.querySelector('.order_image');

const deleteIcon = document.querySelector('.icon-delete');
const delete_check = document.querySelector('.check_delete_popup');


// ---- M

async function getUser(){
    fetch(Req).then((response) => {return response.json()}).then((result)=>{
        showUserName(result.data.name);
    })
}

async function getOrder(){ 
    
    await fetch(bookingReq).then((response) => {return response.json()}).then((result) =>{
        if(result.data === null){
            noOrderPage.style.display = 'block';
            hasOrder.style.display = 'none';
        }else if(result.error === true){
            alert('請先登入');
            location.href='/';
        }else{
            showOrder(result.data);
            getCancelOrder(result.data.order)
        }
    }).catch((error)=>{console.log(error)})
    
}

async function cancelOrder(orderID){
    cancelBody = JSON.stringify({
        "orderID":orderID
    });
    console.log(orderID);

    let cancelReq = new Request(bookingReq,{method:"DELETE", body:cancelBody});

    await fetch(cancelReq).then((response)=>{return response.json()}).then((result)=>{
        if(result.ok === true){
            alert('已刪除行程');
            location.reload();
        }
    })
}


function getCancelOrder(orderID){
    deleteIcon.addEventListener('click', function(){
        blur_effect.style.display='block';
        delete_check.style.display='flex';
        checkCancel(orderID);
    })
}

function checkCancel(orderID){
    const delete_no = document.getElementById('btn_delete_no');
    const delete_yes = document.getElementById('btn_delete_yes');

    delete_no.addEventListener('click', function(){
        blur_effect.style.display='none';
        delete_check.style.display='none';
    })

    delete_yes.addEventListener('click', function(){
        cancelOrder(orderID);
    })
}


// ---- V
function showOrder(orderAttraction){
    title.textContent = "台北一日遊："+orderAttraction.attraction.name;
    date.textContent = orderAttraction.date;
    fee.textContent = orderAttraction.price;
    address.textContent = orderAttraction.attraction.address;
    image.setAttribute('src',orderAttraction.attraction.image);

    if (orderAttraction.time === "morning"){
        time.textContent = "上半天";
    } else if (orderAttraction.time === "afternoon"){
        time.textContent = "下半天";
    }

}

function showUserName(name){
    userName.textContent = name;
}


// ---- C & E
getUser();
getOrder();

