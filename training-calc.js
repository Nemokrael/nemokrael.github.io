const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const statFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function onTrain() {

    const stats = ["str", "def", "spe", "dex"];
    const coeff1 = [1600, 2100, 1600, 1800];
    const coeff2 = [1700, -600, 2000, 1500];
    const coeff3 = [700, 1500, 1350, 1000];

    const happy = document.getElementById("happy").value;

    const historyRow = document.createElement("div");
    historyRow.setAttribute("class", "row");
    const historyLabel = document.createElement("label");
    historyLabel.setAttribute("class", "col-4");
    historyLabel.innerText = happy + "H" + " " + document.getElementById("total").innerText;
    historyRow.appendChild(historyLabel);
    document.getElementById("history-container").appendChild(historyRow);

	let total_gains = 0;
	let total_stats_new = 0;

    stats.forEach((stat, idx) => {

        const gymSelect = document.getElementById("gym");
        const gymDots = gymSelect.options[gymSelect.selectedIndex].getAttribute(stat);
        const energyPerTrain = gymSelect.options[gymSelect.selectedIndex].getAttribute("ept");
        const initial = +(document.getElementById(stat + "_input").value.replace(/,/g, ''));
        const bonusMultiplier = (1 + document.getElementById(stat + "_steadfast").value / 100) *
            (1 + document.getElementById(stat + "_property").value / 100) *
            (1 + document.getElementById(stat + "_edu_spec").value / 100) *
            (1 + document.getElementById(stat + "_edu_gen").value / 100) *
            (1 + document.getElementById(stat + "_job").value / 100) *
            (1 + document.getElementById(stat + "_book").value / 100);
        const totalEnergy = document.getElementById(stat + "_erg").value;
        const initialCap = Math.min(initial, 50000000);

        // store cookies
        storeValue("selectedGym", gymSelect.selectedIndex);
        storeValue(stat + "_input", initial);
        storeValue(stat + "_steadfast", document.getElementById(stat + "_steadfast").value);
        storeValue(stat + "_property", document.getElementById(stat + "_property").value);
        storeValue(stat + "_edu_spec", document.getElementById(stat + "_edu_spec").value);
        storeValue(stat + "_edu_gen", document.getElementById(stat + "_edu_gen").value);
        storeValue(stat + "_job", document.getElementById(stat + "_job").value);
        storeValue(stat + "_erg", document.getElementById(stat + "_erg").value);
        storeValue("happy", document.getElementById("happy").value);

        document.getElementById(stat + "_bonus").value = (gymDots * bonusMultiplier).toFixed(4);

        // alert if not integer!
        const numTrains = totalEnergy / energyPerTrain;
        if (!Number.isInteger(numTrains)) {
            alert("Not an integer number of trains for stat " + stat + "\nEnergy per train is " + energyPerTrain);
            throw new Error();
        }


        // iterate
        lowestStat = parseFloat(initial);
        highestStat = parseFloat(initial);
        var lowestGain = (1 / 200000) * gymDots * energyPerTrain * bonusMultiplier *
            (initialCap * (1 + 0.07 * (Math.log(1 + happy / 250)).toFixed(4)).toFixed(4) + 8 * Math.pow(happy, 1.05) + coeff1[idx] * (1 - Math.pow(happy / 99999, 2)) + coeff2[idx] - coeff3[idx]);
        var highestGain = (1 / 200000) * gymDots * energyPerTrain * bonusMultiplier *
            (initialCap * (1 + 0.07 * (Math.log(1 + happy / 250)).toFixed(4)).toFixed(4) + 8 * Math.pow(happy, 1.05) + coeff1[idx] * (1 - Math.pow(happy / 99999, 2)) + coeff2[idx] + coeff3[idx]);
        var lowestHappy = parseFloat(happy);
        var highestHappy = parseFloat(happy);

        for (var i = 0; i < numTrains; i++) {

            lowestStat = lowestStat + lowestGain;
            highestStat = highestStat + highestGain;

            highestHappy = Math.max(lowestHappy - 0.4 * energyPerTrain, 0);
            lowestHappy = Math.max(lowestHappy - 0.6 * energyPerTrain, 0);

            lowestGain = (1 / 200000) * gymDots * energyPerTrain * bonusMultiplier *
                (initialCap * (1 + 0.07 * (Math.log(1 + lowestHappy / 250)).toFixed(4)).toFixed(4) + 8 * Math.pow(lowestHappy, 1.05) + coeff1[idx] * (1 - Math.pow(lowestHappy / 99999, 2)) + coeff2[idx] - coeff3[idx]);
            highestGain = (1 / 200000) * gymDots * energyPerTrain * bonusMultiplier *
                (Math.min(highestStat, 50000000) * (1 + 0.07 * (Math.log(1 + highestHappy / 250)).toFixed(4)).toFixed(4) + 8 * Math.pow(highestHappy, 1.05) + coeff1[idx] * (1 - Math.pow(highestHappy / 99999, 2)) + coeff2[idx] + coeff3[idx]);

        }

        const final = ((lowestStat + highestStat) / 2);
        storeValue(stat + "_final", final);
		total_stats_new += final;
        document.getElementById(stat + "_final").value = statFormatter.format(final);
        document.getElementById(stat + "_gains").value = statFormatter.format(final - initial);
		total_gains += (final - initial);

        // append history
        const historyStat = document.createElement("input");
        historyStat.setAttribute("class", "col-2");
        historyStat.setAttribute("disabled", true);
        historyStat.setAttribute("value", statFormatter.format(final));
        historyStat.setAttribute("title", statFormatter.format(initial)
            + " -> " + statFormatter.format(final) + "\n"
            + "+" + statFormatter.format(final - initial) + "\n"
            + "x" + (gymDots * bonusMultiplier).toFixed(4) + "\n"
            + totalEnergy + "E");
        historyRow.appendChild(historyStat);
    })

	document.getElementById("total_gains_predicted").innerText = statFormatter.format(total_gains);
	document.getElementById("total_stats_predicted").innerText = statFormatter.format(total_stats_new);
}

function storeValue(name, value) {
    localStorage.setItem(name, value);
}

function retrieveValue(name) {
    return localStorage.getItem(name);
}

$(document).ready(function () {

	const total_stats = 0

    const stats = ["str", "def", "spe", "dex"];
    stats.forEach(stat => {
		val = retrieveValue(stat + "_input");
		total_stats += val;
        document.getElementById(stat + "_input").value = val;

        document.getElementById(stat + "_steadfast").value = retrieveValue(stat + "_steadfast") ? retrieveValue(stat + "_steadfast") : 10;
        document.getElementById(stat + "_property").value = retrieveValue(stat + "_property") ? retrieveValue(stat + "_property") : 2;
        document.getElementById(stat + "_edu_spec").value = retrieveValue(stat + "_edu_spec") ? retrieveValue(stat + "_edu_spec") : 0;
        document.getElementById(stat + "_edu_gen").value = retrieveValue(stat + "_edu_gen") ? retrieveValue(stat + "_edu_gen") : 0;
        document.getElementById(stat + "_job").value = retrieveValue(stat + "_job") ? retrieveValue(stat + "_job") : 0;
        document.getElementById(stat + "_book").value = retrieveValue(stat + "_book") ? retrieveValue(stat + "_book") : 0;
        document.getElementById(stat + "_erg").value = retrieveValue(stat + "_erg") ? retrieveValue(stat + "_erg") : 5;
    });
	document.getElementById("total_stats_initial").value = total_stats;

    document.getElementById("happy").value = retrieveValue("happy");

	const gymSelect = document.getElementById("gym");
	gymSelect.selectedIndex = retrieveValue("selectedGym") ? retrieveValue("selectedGym") : 0;
	const option = gymSelect.options[gymSelect.selectedIndex];
	formatGymTitle(gymSelect, option);
	formatGymInfo(gymSelect, option);

    Array.from(gymSelect.options).forEach(option => formatGymTitle(option, option));

    if (retrieveValue("key")) {
        document.getElementById("key").value = retrieveValue("key");
        onRead();
    }

    // populate item dropdown
    Array.from(document.getElementById("unused_items").children).forEach(itemRow => {
        const itemId = itemRow.getAttribute("item");
        const itemName = itemRow.children[1].innerText;
        var option = document.createElement("option");
        option.setAttribute("item", itemId);
        option.innerText = itemName;
        formatItemTitle(option, itemRow);
        document.getElementById("item").appendChild(option);
    });

    // set-up initial stats inputs
    $("input[data-type='number']").keyup(function (event) {
        // skip for arrow keys
        if (event.which >= 37 && event.which <= 40) {
            event.preventDefault();
        }
        var $this = $(this);
        var num = $this.val().replace(/[^0-9,]/gi, '').replace(/,/gi, "");
        var num2 = num.split(/(?=(?:\d{3})+$)/).join(",");
        // the following line has been simplified. Revision history contains original.
        $this.val(num2);
    });

});

function onCopy() {
	let total_stats = 0;

    const stats = ["str", "def", "spe", "dex"];
    stats.forEach(stat => {
		total_stats += Math.round(retrieveValue(stat + "_final"));
        document.getElementById(stat + "_input").value = statFormatter.format(Math.round(retrieveValue(stat + "_final")));
        document.getElementById(stat + "_final").value = "";
    });

	document.getElementById("total_stats_initial").innerText = statFormatter.format(total_stats);
}

async function onRead() {
    storeValue("key", document.getElementById("key").value);
    const userResponse = await fetch("https://api.torn.com/user/?selections=battlestats,gym,perks,bars,profile,stocks,inventory&key=" + document.getElementById("key").value);
    let read = await userResponse.json();

    if (read.error) {
        alert(read.error.error)
    } else {
		// select current user gym
		const gymSelect = document.getElementById("gym");
		gymSelect.selectedIndex = retrieveValue("selectedGym") ? retrieveValue("selectedGym") : 0;
		const option = gymSelect.options[gymSelect.selectedIndex];
		formatGymTitle(gymSelect, option);
		formatGymInfo(gymSelect, option);

        document.getElementById("str_input").value = statFormatter.format(read.strength);
        document.getElementById("def_input").value = statFormatter.format(read.defense);
        document.getElementById("spe_input").value = statFormatter.format(read.speed);
        document.getElementById("dex_input").value = statFormatter.format(read.dexterity);
		document.getElementById("total_stats_initial").innerText = statFormatter.format(read.strength + read.defense + read.speed + read.dexterity);

        storeValue("base_happy", read.happy.maximum);
        storeValue("edvd_bonus", 1);
        read.faction_perks.forEach(perk => {
            [stat, bonus] = parsePerk(perk);
            if (stat) {
                document.getElementById(stat + "_steadfast").value = bonus[0];
                document.getElementById(stat + "_steadfast").setAttribute("title", perk);
            }
            if (perk.includes("candy")) {
                const bonus = /\d+/.exec(perk);
                storeValue("candy_bonus", bonus);
            }
        });
        read.property_perks.forEach(perk => {
            [stat, bonus] = parsePerk(perk);
            if (stat) {
                ["str", "def", "spe", "dex"].forEach(stat => {
                    document.getElementById(stat + "_property").value = bonus;
                    document.getElementById(stat + "_property").setAttribute("title", perk);
                })
            }
        });
        read.education_perks.forEach(perk => {
            [stat, bonus] = parsePerk(perk);
            if (stat) {
                if (stat === "all") {
                    ["str", "def", "spe", "dex"].forEach(stat => {
                        document.getElementById(stat + "_edu_gen").value = bonus;
                        document.getElementById(stat + "_edu_gen").setAttribute("title", perk);
                    });
                } else {
                    document.getElementById(stat + "_edu_spec").value = bonus;
                    document.getElementById(stat + "_edu_spec").setAttribute("title", perk);
                }
            }
        });
        read.job_perks.forEach(perk => {
            [stat, bonus] = parsePerk(perk);
            if (stat) {
                document.getElementById(stat + "_job").value = bonus;
                document.getElementById(stat + "_job").setAttribute("title", perk);
            }
        });
        read.company_perks.forEach(perk => {
            if (perk.includes("bonus to Erotic DVDs")) { // 10* AN
                storeValue("edvd_bonus", 2);
            }
        });
        if (read.job) {
            if (read.job.company_type) {
                const company_type = read.job.company_type;
                // add specials to dropdown
                Array.from(document.getElementById("unused_specials").children).forEach(specialRow => {
                    if (company_type === parseInt(specialRow.getAttribute("company"))) {
                        const specialId = specialRow.getAttribute("item");
                        const specialName = specialRow.children[1].innerText;
                        var option = document.createElement("option");
                        option.setAttribute("item", specialId);
                        option.innerText = specialName;
                        formatItemTitle(option, specialRow);
                        document.getElementById("item").appendChild(option);
                    }
                });
            }
        }
        if (read.stocks) {
            Array.from(document.getElementById("unused_stock_benefits").children).forEach(stockRow => {
                const stockId = parseInt(stockRow.getAttribute("stock"));
                if (read.stocks[stockId]) {
                    const stockId = stockRow.getAttribute("item");
                    const stockName = stockRow.children[1].innerText;
                    let option = document.createElement("option");
                    option.setAttribute("item", stockId);
                    option.innerText = stockName;
                    formatItemTitle(option, stockRow);
                    document.getElementById("item").appendChild(option);
                }
            });
        }

		updateGymDots(gymSelect);
        /*
        const bookSelect = document.getElementById("book-select");
        read.inventory.forEach(item => {
            if (item.type === "Book") {
                if ([757, 758, 759, 760, 761, 770, 782, 783, 784].includes(item.ID)) {
                    let option = document.createElement("option");
                    option.setAttribute("book", item.ID);
                    option.innerText = item.name;
                    bookSelect.appendChild(option);
                }
            }
        });
        */
    }

    const itemResponse = await fetch("https://api.torn.com/torn/36,151,197,199,206,310,366,367,527,528,529,530,532,533,985,986,987?selections=items&key=" + document.getElementById("key").value);
    read = await itemResponse.json();

    if (read.error) {
        alert(read.error.error)
    } else {
        for (let itemId of Object.keys(read.items)) {
            storeValue("price" + itemId, read.items[itemId].market_value);
            document.getElementById("price" + itemId).innerText = currencyFormatter.format(read.items[itemId].market_value) + " ea";
        }
    }

    const pointsResponse = await fetch("https://api.torn.com/market/?selections=pointsmarket&key=" + document.getElementById("key").value);
    read = await pointsResponse.json();

    if (read.error) {
        alert(read.error.error)
    } else {
        let quantity = 0;
        let total_cost = 0;
        for (const listing in read.pointsmarket) {
            total_cost = total_cost + read.pointsmarket[listing].total_cost;
            quantity = quantity + read.pointsmarket[listing].quantity;
        }
        storeValue("price1", total_cost / quantity);
        document.getElementById("price1").innerText = currencyFormatter.format(Math.round(total_cost / quantity)) + " ea";
    }

    updateHappy();
}

function parsePerk(perk) {
    perk = perk.toUpperCase();
    stat = null;
    if (perk.includes("GYM GAINS")) {
        if (perk.includes("STRENGTH")) {
            stat = "str";
        } else if (perk.includes("SPEED")) {
            stat = "spe";
        } else if (perk.includes("DEXTERITY")) {
            stat = "dex";
        } else if (perk.includes("DEFENSE")) {
            stat = "def";
        } else {
            stat = "all";
        }
    }
    const bonus = /\d+/.exec(perk);
    return [stat, bonus];
}

function updateGymDots(gymSelect) {
	const stats = ["str", "def", "spe", "dex"];

	stats.forEach((stat, idx) => {
		const gymDots = gymSelect.options[gymSelect.selectedIndex].getAttribute(stat);

		const bonusMultiplier = 
		(1 + document.getElementById(stat + "_steadfast").value / 100) *
		(1 + document.getElementById(stat + "_property").value / 100) *
		(1 + document.getElementById(stat + "_edu_spec").value / 100) *
		(1 + document.getElementById(stat + "_edu_gen").value / 100) *
		(1 + document.getElementById(stat + "_job").value / 100) *
		(1 + document.getElementById(stat + "_book").value / 100);

		document.getElementById(stat + "_bonus").value = (gymDots * bonusMultiplier).toFixed(4);
	});
}

function updateHappy() {

    let total = 0;
    let jps = 0;
    let happy = parseInt(retrieveValue("base_happy"));
    let energy = 0;
    let candyBonus = (1 + parseInt(retrieveValue("candy_bonus")) / 100);
	if (isNaN(candyBonus)) {
		candyBonus = 1;
	}
    const edvdBonus = parseInt(retrieveValue("edvd_bonus"));
    /*
    if (document.getElementById("wdd").checked) {
        candyBonus = candyBonus * 3;
    }
    */
    const bookSelect = document.getElementById("book-select");
    const bookId = bookSelect.options[bookSelect.selectedIndex].getAttribute("book");
    if (bookId === "783") { // Yes Please Diabetes
        candyBonus = candyBonus * 2;
    }
    Array.from(document.getElementById("item_container").children).forEach(itemRow => {

        const itemId = itemRow.getAttribute("item");
        const count = document.getElementById("row" + itemId).children[2].value;
        if (parseFloat(retrieveValue("price" + itemId))) {
            total += parseFloat(retrieveValue("price" + itemId)) * count;
        } else if (itemRow.getAttribute("jp")) {
            jps += itemRow.getAttribute("jp") * count;
        }

        if (itemId === "197") { // ecstasy doubles happiness
            itemRow.children[4].innerText = "H*2";
        } else {
            itemRow.children[4].innerText = "";
        }

        let itemHappy = itemRow.getAttribute("happy");
        if (itemRow.getAttribute("candy") === '') {
            itemHappy = Math.ceil(candyBonus * itemHappy);
        } else if (itemRow.getAttribute("item") === '366') {
            if (edvdBonus !== null) {
                itemHappy *= edvdBonus;
            }
        }
        happy = happy + itemHappy * count;
        if (itemHappy > 0) {
            itemRow.children[4].innerText = "+" + itemHappy + "H ";
        }
        if (itemRow.getAttribute("candy") === '') {
            itemRow.children[4].innerText += "*";
        }

        let itemEnergy = itemRow.getAttribute("energy");
        if (itemRow.getAttribute("caffeine") === '') {
            if (bookId === "782") { // Fuelling Your Way To Failure
                itemEnergy *= 2;
            }
        }
		// using 6 for a points refill here... amount calculated is correct (for donator/subscriber)
		// but the display is just... plain wrong
        energy = energy + itemEnergy * count;
        if (itemEnergy > 0) {
			if (itemId === "1") {
				itemRow.children[4].innerText += "+" + itemEnergy*count + "E";
			}
			else {
				itemRow.children[4].innerText += "+" + itemEnergy + "E";
			}
        }
    });
    if (document.getElementById("ecstasy").value === '1') {
        happy = happy * 2;
    }
    if (bookId !== "770") { // Ignorance is bliss
        happy = Math.min(happy, 99999);
    }
    document.getElementById("total").innerText = currencyFormatter.format(total) + ((jps > 0) ? ", " + jps + "JP" : "");
    document.getElementById("happy").value = happy;
    document.getElementById("total_gain").innerText = "+" + (happy - parseInt(retrieveValue("base_happy"))) + "H +" + energy + "E";
}

function onItemSelect() {
    const itemSelect = document.getElementById("item");
    const selected = itemSelect.options[itemSelect.selectedIndex].getAttribute("item");
    if (selected == 0) { // select
        return;
    }
    itemSelect.remove(itemSelect.selectedIndex);
    const itemRow = document.getElementById("row" + selected);
    formatItemTitle(itemRow.children[1], itemRow);
    document.getElementById("item_container").appendChild(itemRow);
    updateHappy();
}

function onGymChange() {
    const gymSelect = document.getElementById("gym");
    const option = gymSelect.options[gymSelect.selectedIndex];
    formatGymTitle(gymSelect, option);
	formatGymInfo(gymSelect, option);
	updateGymDots(gymSelect);
}

function formatGymTitle(element, option) {
    const stats = ["str", "def", "spe", "dex"];
    const statTitle = ["Strength", "Defense", "Speed", "Dexterity"];
    let title = "";
    stats.forEach((stat, index) => {
        title += statTitle[index] + ": " + option.getAttribute(stat) + "\n";
    });
    const ept = option.getAttribute("ept");
    title += "Energy per train: " + ept;
    element.setAttribute("title", title);
}

function formatGymInfo(element, option) {
    const stats = ["str", "def", "spe", "dex"];
    const statTitle = ["Str", "Def", "Spe", "Dex"];
    stats.forEach((stat, index) => {
		document.getElementById("dots-"+stat).innerText = option.getAttribute(stat);
    });
}

function formatItemTitle(element, itemRow) {
    let title = "";
    const happy = itemRow.getAttribute("happy");
    if (happy > 0) {
        title += "Increases happiness by " + happy + "\n";
    }
    const energy = itemRow.getAttribute("energy");
    if (energy > 0) {
        title += "Increases energy by " + energy + "\n";
    }
    element.setAttribute("title", title);
}

function onJumpStart() {

    const jumpSelect = document.getElementById("jumpstart");
    const option = jumpSelect.options[jumpSelect.selectedIndex];
    const itemSelect = document.getElementById("item");
    let itemsToRemove = [];
    let itemRow = null;

    switch (option.text) {

        case 'Lollipop':

            itemRow = document.getElementById("row310");
            formatItemTitle(itemRow.children[1], itemRow);
            itemRow.children[2].value = 48;
            document.getElementById("item_container").appendChild(itemRow);
            itemsToRemove.push("Lollipop");

            itemRow = document.getElementById("row197");
            formatItemTitle(itemRow.children[1], itemRow);
            itemRow.children[2].value = 1;
            document.getElementById("item_container").appendChild(itemRow);
            itemsToRemove.push("Ecstasy");

            break;

        case 'Choco':

            itemRow = document.getElementById("row36");
            formatItemTitle(itemRow.children[1], itemRow);
            itemRow.children[2].value = 48;
            document.getElementById("item_container").appendChild(itemRow);
            itemsToRemove.push("Big Box of Chocolates");

            itemRow = document.getElementById("row206");
            formatItemTitle(itemRow.children[1], itemRow);
            itemRow.children[2].value = 1;
            document.getElementById("item_container").appendChild(itemRow);
            itemsToRemove.push("Xanax");

            itemRow = document.getElementById("row1");
            formatItemTitle(itemRow.children[1], itemRow);
            itemRow.children[2].value = 25;
            document.getElementById("item_container").appendChild(itemRow);
            itemsToRemove.push("Points Refill");

            itemRow = document.getElementById("row197");
            formatItemTitle(itemRow.children[1], itemRow);
            itemRow.children[2].value = 1;
            document.getElementById("item_container").appendChild(itemRow);
            itemsToRemove.push("Ecstasy");

            break;


        case 'Happy':

            itemRow = document.getElementById("row366");
            formatItemTitle(itemRow.children[1], itemRow);
            itemRow.children[2].value = 5;
            document.getElementById("item_container").appendChild(itemRow);
            itemsToRemove.push("Erotic DVD");

            itemRow = document.getElementById("row206");
            formatItemTitle(itemRow.children[1], itemRow);
            itemRow.children[2].value = 4;
            document.getElementById("item_container").appendChild(itemRow);
            itemsToRemove.push("Xanax");

            itemRow = document.getElementById("row1");
            formatItemTitle(itemRow.children[1], itemRow);
            itemRow.children[2].value = 25;
            document.getElementById("item_container").appendChild(itemRow);
            itemsToRemove.push("Points Refill");

            itemRow = document.getElementById("row197");
            formatItemTitle(itemRow.children[1], itemRow);
            itemRow.children[2].value = 1;
            document.getElementById("item_container").appendChild(itemRow);
            itemsToRemove.push("Ecstasy");
    }

    Array.from(itemSelect.options).forEach(item => {
        if (itemsToRemove.includes(item.text)) {
            item.remove();
        }
    })

    updateHappy();
    jumpSelect.disabled = true;
}

function onBook() {
    document.getElementById("str_book").value = 0;
    document.getElementById("def_book").value = 0;
    document.getElementById("spe_book").value = 0;
    document.getElementById("dex_book").value = 0;
    const bookSelect = document.getElementById("book-select");
    const bookId = bookSelect.options[bookSelect.selectedIndex].getAttribute("book");
    switch (bookId) {
        case "757":
            document.getElementById("str_book").value = 20;
            document.getElementById("def_book").value = 20;
            document.getElementById("spe_book").value = 20;
            document.getElementById("dex_book").value = 20;
            break;
        case "758":
            document.getElementById("str_book").value = 30;
            break;
        case "759":
            document.getElementById("def_book").value = 30;
            break;
        case "760":
            document.getElementById("spe_book").value = 30;
            break;
        case "761":
            document.getElementById("dex_book").value = 30;
            break;
        case "784":
            document.getElementById("row1").setAttribute('energy', 10); // Ugly Energy on prf
            document.getElementById("row367").setAttribute('energy', 250); // Ugly Energy on FHC
            updateHappy();
            break;
        default:
            updateHappy();
            break;

    }
}
