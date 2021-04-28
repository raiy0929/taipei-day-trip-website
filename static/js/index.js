// global variables
let landContainer = document.getElementById('landContainer');
let keywordBtn = document.getElementById('btn-keyword');
let keyword = '';
let page = 0;
let onloading = false;
let src = '';

//------- event & func ------//
keywordBtn.addEventListener('click', function(e) {
    resetAll();
    onloading = false;
    page = 0;
    index_get_attr();
})

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
        let pic = document.createElement("img");
        pic.setAttribute('src',attractions[i].images[0])
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

        ulAddr.appendChild(mrtLi);
        ulAddr.appendChild(cateLi);

        section.appendChild(name);
        section.appendChild(ulAddr);

        li.appendChild(pic);
        li.appendChild(section);
    
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

index_get_attr();

