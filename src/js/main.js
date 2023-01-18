window.addEventListener("DOMContentLoaded", () => {

    const lCur = document.querySelector(".left_cur"),
        rCur = document.querySelector(".right_cur"),
        calendar = document.querySelector(".calendar"),
        curName1 = document.querySelector(".div13"),
        curName2 = document.querySelector(".div15"),
        changeButton = document.querySelector(".div3"),
        leftRateInfo = document.querySelector(".left_rate_info"),
        rightRateInfo = document.querySelector(".right_rate_info"),
        curList = document.querySelector("select");


    let selectedTarget = "curName1";
    lCur.value = rCur.value = 0;

    calendar.value = new Date().toISOString().split("T")[0];
    calendar.max = new Date().toISOString().split("T")[0];
    calendar.min = "2005-01-01";

    let data = [{
        "txt": "Українська гривня",
        "rate": 1,
        "cc": "UAH"
    }];

    loadData(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${ formatDate(calendar.value) }&json`)
        .then(() => {
            console.log("Ok")
        }).catch(e => console.error(e));


    calendar.addEventListener("input", () => {
        loadData(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${ formatDate(calendar.value) }&json`)
            .then(() => {
                console.log("Ok")
            }).catch(e => console.error(e))
    })

    async function loadData( url, date ) {
        try {
            let response = await fetch(url);
            if ( response.ok ) {
                let json = await response.json();
                json.forEach(item => {
                    data.push(item);
                });

                // calendar.value = date;
                rateInfo();
                setList();

            } else {
                alert("Помилка HTTP: " + response.status);
            }
        } catch (e) {
            console.error(e)
        }
    }

    function formatDate( date ) {
        return date.split("-").join("");
    }

    function rateInfo() {
        leftRateInfo.innerHTML = `1 ${ curName1.innerHTML } = ${ (getRate(curName1.innerHTML) / getRate(curName2.innerHTML)).toFixed(4) } ${ curName2.innerHTML }`;
        rightRateInfo.innerHTML = `1 ${ curName2.innerHTML } = ${ (getRate(curName2.innerHTML) / getRate(curName1.innerHTML)).toFixed(4) } ${ curName1.innerHTML }`;
    }

    lCur.addEventListener("input", ( e ) => {
        checkNumInputs(".left_cur");
        rCur.value = (lCur.value / (getRate(curName2.innerHTML) / getRate(curName1.innerHTML))).toFixed(4);
    })

    rCur.addEventListener("input", () => {
        checkNumInputs(".right_cur");
        lCur.value = (rCur.value / (getRate(curName1.innerHTML) / getRate(curName2.innerHTML))).toFixed(4);
    })

    changeButton.addEventListener("click", () => {
        [curName1.innerHTML, curName2.innerHTML] = [curName2.innerHTML, curName1.innerHTML];
        [lCur.value, rCur.value] = [rCur.value, lCur.value];
        [leftRateInfo.innerHTML, rightRateInfo.innerHTML] = [rightRateInfo.innerHTML, leftRateInfo.innerHTML];
    })


    function getRate( name ) {
        let rate = 1;
        data.forEach(item => {
            if ( name === item.cc ) rate = item.rate;
        })
        return rate;
    }

    function setList() {
        data.forEach(item => {
            curList.add(new Option(item.txt + ", " + item.cc));
        })
    }

    curList.addEventListener("click", () => {
        changeCurrency(selectedTarget);
        showCurrencyList(".currencies_select");

    })

    curName1.addEventListener("click", () => {
        showCurrencyList(".currencies_select");
        selectedTarget = "curName1";
    })

    curName2.addEventListener("click", () => {
        showCurrencyList(".currencies_select");
        selectedTarget = "curName2";
    })

    function changeCurrency( target ) {
        let sel = curList.selectedIndex;

        target === "curName1" ? curName1.innerHTML = (curList.options[sel].text).slice(-3) :
            curName2.innerHTML = (curList.options[sel].text).slice(-3);

        rateInfo();

        rCur.value = (lCur.value / (getRate(curName2.innerHTML) / getRate(curName1.innerHTML))).toFixed(4);
        lCur.value = (rCur.value / (getRate(curName1.innerHTML) / getRate(curName2.innerHTML))).toFixed(4);
    }

    function showCurrencyList( listName ) {
        const list = document.querySelector(listName);
        list.style.display === "block" ? list.style.display = "none" :
            list.style.display = "block";
    }

    const checkNumInputs = ( selector ) => {
        const numInputs = document.querySelectorAll(selector);

        numInputs.forEach(item => {
            if ( item.value.slice(-1) === "." ) item.value = item.value.slice(0, -1);
            // if ( item.value <= 0 || item.value[0] === "." ) item.value = "100";
            if ( item.value[0] === "0" && item.value[1] !== "." ) item.value = "";
            item.addEventListener('keypress', function ( e ) {
                if ( e.key.match(/[^0-9]/ig) ) {
                    e.preventDefault();
                }
            });
        });
    };


})
