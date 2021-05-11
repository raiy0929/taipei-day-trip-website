//global settings
let url = location.pathname;
let attrId = url.split('/')[2];


// ------- event & func ------- //

// get attr data
async function attraction_get_attr(id) {
    await fetch(`/api/attraction/${id}`).then((response) => {return response.json()}).then(responseData => {
        let attrData = responseData.data;
         attrDetail(attrData);
    }).catch((error)=>{console.log(error)})
}

// append attr data
function attrDetail(attrData){
    // get html ele
    let attrName = document.querySelector('.attraction-preview h2')
    let attrCateg= document.querySelector('.category')
    let attrMrt = document.querySelector('.mrt')
    let attrProfile= document.querySelector('.profile')
    let attrAddr= document.querySelector('.address')
    let attrTransp=document.querySelector('.transport')
    
    // call img append
    attraction_get_images(attrData)
    
    // append other data
    attrName.textContent = attrData.name;
    attrCateg.textContent = attrData.category;
    attrMrt.textContent = attrData.mrt;
    attrProfile.textContent = attrData.description;
    attrAddr.textContent = attrData.address;
    attrTransp.textContent = attrData.transport;
}

// append images & circles
function attraction_get_images(attrData){
    for(let i = 0; i <attrData.images.length; i++) {
        let img_container = document.querySelector('.pic-sec');
        let attrImg = document.createElement('img');
        attrImg.className = 'pic d-none';
        attrImg.dataset.picnum = i;
        attrImg.setAttribute('src',attrData.images[i]);
        img_container.appendChild(attrImg);

        let a = document.createElement('a');
        let img = document.createElement('img');

        // circle
        let circle_container = document.querySelector('.pic-circle');
        img.setAttribute('src','../static/image/icon/icon-other_circle.png');
        img.className = 'icon-circle';
        img.dataset.circlenum = i;

        a.appendChild(img);
        circle_container.appendChild(a);
    }

    // first image & black circle
    let first_pic = document.querySelector('[data-picnum="0"]');
    first_pic.className = 'pic showing-pic fade';

    let current_cir = document.querySelector('[data-circlenum="0"]');
    current_cir.setAttribute('src','../static/image/icon/icon-current_circle.png');
    current_cir.className= 'icon-circle showing-cir';

    showImages_by_circle();
    showImages_by_arrow();
}

// images click evevnt (1). arrows
function showImages_by_arrow(){
    let arrow = document.querySelector('.arrow-container'); 

    arrow.addEventListener('click', function(e){
        let showing_pic = document.querySelector('.showing-pic');
        let showing_cir = document.getElementsByClassName('showing-cir')[0];
        let num =  parseInt(showing_pic.dataset.picnum);

        if(e.target.nodeName === 'IMG'){
            if(e.target.getAttribute('class') === 'btn-prev-pic btn-pic-arrow'){
                let prev_num = num-1;
                if(prev_num === -1){
                    return;
                }else{
                    showing_pic.className='pic d-none';
                    showing_cir.setAttribute('src','../static/image/icon/icon-other_circle.png');
                    showing_cir.className='icon-circle';
                    change_show_pic(prev_num)
                }
            }else if(e.target.getAttribute('class') === 'btn-next-pic btn-pic-arrow'){
                let next_num = num+1; 
                let picAmount= document.getElementsByClassName('pic');
                if(next_num >= picAmount.length){
                    return;
                }else{
                    showing_pic.className='pic d-none';
                    showing_cir.setAttribute('src','../static/image/icon/icon-other_circle.png');
                    showing_cir.className='icon-circle';
                    change_show_pic(next_num)
                }
            }
        }else{
            return;
        }
    })
}

// change showing image
function change_show_pic(new_num){

    document.querySelector('[data-picnum="'+new_num+'"]').className = 'pic showing-pic fade';
    document.querySelector('[data-circlenum="'+new_num+'"]').setAttribute('src','../static/image/icon/icon-current_circle.png');
    document.querySelector('[data-circlenum="'+new_num+'"]').className = 'icon-circle showing-cir';
}

// images click evevnt (2). circles
function showImages_by_circle(){
    let circle_container =  document.querySelector('.pic-circle');
    circle_container.addEventListener('click',function(e){
        if(e.target.nodeName === 'IMG'){
            
            let opt_num = e.target.dataset.circlenum;

            // images
            let opt_img = '[data-picnum="'+opt_num+'"]';
            document.getElementsByClassName('showing-pic')[0].className = 'pic d-none';
            document.querySelector(opt_img).className = 'pic showing-pic fade';

            // circles
            // get current
            let opt_cir = '[data-circlenum="'+opt_num+'"]';
            document.getElementsByClassName('showing-cir')[0].setAttribute('src','../static/image/icon/icon-other_circle.png')
            document.getElementsByClassName('showing-cir')[0].className = 'icon-circle';
            document.querySelector(opt_cir).setAttribute('src','../static/image/icon/icon-current_circle.png');
            document.querySelector(opt_cir).className = 'icon-circle showing-cir';
        }
    })

}

// cost fee
function get_cost_fee(){
    let early = document.getElementById('trip-time-early');
    let night = document.getElementById('trip-time-night');
    let show_cost = document.querySelector('.cost-preview-price');

    early.addEventListener('click', function(){
        show_cost.textContent = "2000";
    })

    night.addEventListener('click', function(){
        show_cost.textContent = "2500";
    })
}


// get today date
function getToday(){
    let today = new Date();
    document.getElementById('trip-date').value=today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
}

//date picker
function datePick(){
    document.querySelector('.trip-date-picker').addEventListener('change', function(){
        let date = this.value;
        document.getElementById('trip-date').value=date;
    })
}

// ------- event & func ------- //

attraction_get_attr(attrId);
get_cost_fee();
getToday();
datePick();
