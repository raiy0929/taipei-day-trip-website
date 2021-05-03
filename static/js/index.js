// global variables
let landContainer = document.getElementById('landContainer');
let keywordBtn = document.querySelector('.header-btn');
let keyword = '';
let page = 0;
let onloading = false;
let src = '';

//------- event & func ------//
keywordBtn.addEventListener('click', function(e) {
    e.preventDefault();
    resetAll();
    onloading = false;
    page = 0;
    index_get_attr();
})

// get attrs data
async function index_get_attr() {
    onloading = true;
    let keyword = document.getElementById('keyword').value;
    if (page !== null && keyword){
        src = '/api/attractions?page='+page+'&keyword='+keyword;
    } else if (page !== null ){
        src = '/api/attractions?page='+page;
    } else {
        return 'nope';
    }

    await fetch(src).then((response) => response.json()).then((responseData)=>{
        if(responseData.error === true) {
            landContainer.innerHTML='<div class="nodata">查無相關景點</div>';
        }
        let attrs = responseData.data
        attractionsItem(attrs)
        let nextPage = responseData.nextPage;
        if (nextPage !== null) {
            page = nextPage;
            onloading = false;
            onScroll();
        }
    }).catch((error) => {console.log(error)})
}

// append attrs
function attractionsItem(attractions){
    for(let i=0; i<attractions.length; i++){ 
        let li = document.createElement("li")
        li.setAttribute('class', 'content-land-item');
        let img = document.createElement("img");
        img.setAttribute('src',attractions[i].images[0])
        let section = document.createElement("section");
        section.setAttribute('class','content-land-item-text');
        let name = document.createElement("h5");
        name.textContent=attractions[i].name;
        
        let ulAddr = document.createElement("ul");
        ulAddr.setAttribute('class','d-flex');
        let mrtLi = document.createElement("li");
        mrtLi.textContent=attractions[i].mrt;
        let cateLi = document.createElement("li");
        cateLi.textContent=attractions[i].category;

        let a = document.createElement("a");
        let attrId = attractions[i].id;
        a.setAttribute('href','/attraction/'+attrId);

        ulAddr.appendChild(mrtLi);
        ulAddr.appendChild(cateLi);

        section.appendChild(name);
        section.appendChild(ulAddr);

        a.appendChild(img);
        a.appendChild(section);
        

        li.appendChild(a);
        
    
        landContainer.appendChild(li);
    }
}

// clean all attrs
function resetAll(){
    landContainer.textContent='';
}

// scroll events
function onScroll(){
    window.addEventListener('scroll',function(){
        let position = landContainer.getBoundingClientRect();
        let scroll = window.innerHeight-position.top;
        if (scroll - position.height >= 0 && onloading === false ){
            index_get_attr();
        }
    });
}

function test(){
    $(".header-bar").load("header.html");
}

//------- event & func end ------//

// test();
index_get_attr();

